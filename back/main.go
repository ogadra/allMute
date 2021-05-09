package main

import (
	"fmt"
	//"errors"
	"net/http"
	"os"
	"encoding/json"
	"time"
	"io"
	//"m/lib/makeParam"
	"strconv"

	"github.com/Fukkatsuso/oauth-sample/app/lib/twitter"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/mrjones/oauth"
	// "github.com/gin-contrib/timeout"
	// "github.com/dghubble/go-twitter/twitter"
	// "github.com/dghubble/oauth1"
)


type creds struct{
	ConsumerKey string
	AccessToken string
	ConsumerSecret string
	AccessSecret string
}

type followers struct {
	Ids []int64 `json:"ids"`
	Next_cursor int64 `json:"next_cursor"`
	Next_cursor_str string `json:"next_cursor_str"`
	Previous_cursor int64 `json:"previous_cursor"`
	Previous_cursor_str string `json:"previous_cursor_str"`
}

func allMute(c *gin.Context, token *oauth.AccessToken, method string) {

	client := twitter.NewClient()
	aToken := twitter.GetAccessToken(c)
	user := twitter.User{}
	_ = twitter.GetUser(c, aToken, &user)
	params := map[string]string{"screen_name": user.ScreenName}
	resp, err := client.Get("https://api.twitter.com/1.1/friends/ids.json", params, token)

	if err != nil{
		fmt.Println(err)
	}
	defer resp.Body.Close()

	var r io.Reader = resp.Body
    r = io.TeeReader(r, os.Stderr)
	var f followers

	err = json.NewDecoder(r).Decode(&f)
	if err != nil {
		fmt.Println(err)
	}

	for _, v := range f.Ids {
		params = map[string]string{"user_id": strconv.FormatInt(v, 10)}
		for{
			resp, err = client.PostWithBody("https://api.twitter.com/1.1/mutes/users/" + method + ".json", "", params, token)
			if resp.StatusCode == 429{
				time.Sleep((time.Minute * 1))
			} else if resp.StatusCode == 200{
				break
			}
		}
		if err != nil{
			fmt.Println(err)
		}
	}
}

func main() {
	godotenv.Load(fmt.Sprintf("%s.env", os.Getenv("GO_ENV")))
	store := cookie.NewStore([]byte("secret"))
	store.Options(sessions.Options{
		MaxAge: 60 * 60 * 24,
	})

	r := gin.Default()
	r.Use(sessions.Sessions("session", store))
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			os.Getenv("FRONT_SERVER"),
		},
	}))

	r.GET("/twitter", func(c *gin.Context) {
		aToken := twitter.GetAccessToken(c)

		if aToken == nil {
			c.Redirect(http.StatusSeeOther, "/twitter/oauth")
			return
		}
		// プロフィール取得


		user := twitter.User{}
		_ = twitter.GetUser(c, aToken, &user)

		c.JSON(200, gin.H{"user": user})
	})
	r.GET("/callback", func(c *gin.Context) {
		c.Redirect(http.StatusSeeOther, "/settings")
	})
	r.GET("/twitter/oauth", func(c *gin.Context) {
		loginURL, err := twitter.OAuth(c)
		if err != nil {
			c.Redirect(http.StatusSeeOther, "/")
			return
		}
		c.JSON(200, gin.H{"url": loginURL})
	})
	r.GET("/twitter/callback", func(c *gin.Context) {
		redirectURL, err := twitter.Callback(c)
		fmt.Println(redirectURL)
		if err != nil {
			c.Redirect(http.StatusSeeOther, "/twitter/oauth")
			return
		}
		c.Redirect(http.StatusFound, "/api/proxy/callback")
	})
	r.POST("/twitter/unoauth", func(c *gin.Context) {
		err := twitter.UnOAuth(c)
		if err != nil {
			c.Redirect(http.StatusSeeOther, "/")
			return
		}
		c.JSON(200, gin.H{"status": "logouted"})
	})
	r.POST("/twitter/mute/:method", func(c *gin.Context){
		aToken := twitter.GetAccessToken(c)
		if aToken == nil {
			c.Redirect(http.StatusSeeOther, "/twitter/oauth")
			return
		}
		go allMute(c, aToken, c.Param("method"))
	})

	r.Run() // listen and serve on 0.0.0.0:8080
}
