package main

import (
	"fmt"
	"net/http"
	"errors"
	//"os"

	"github.com/Fukkatsuso/oauth-sample/app/lib/twitter"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"github.com/mrjones/oauth"
)

func Tweet(c *gin.Context, token *oauth.AccessToken, post string) error {
	
	client := twitter.NewClient()
	params := map[string]string{
		"status": post,
	}
	resp, err := client.Post("https://api.twitter.com/1.1/direct_messages/events/new.json", token)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 500 {
		return errors.New("twitter is unavailable")
	}
	if resp.StatusCode >= 400 {
		return errors.New("twitter request is invalid")
	}

	return nil
}


func main() {
	store := cookie.NewStore([]byte("secret"))
	store.Options(sessions.Options{
		MaxAge: 60 * 60 * 24,
	})

	r := gin.Default()
	r.Use(sessions.Sessions("session", store))
	r.Use(cors.New(cors.Config{
        // 許可したいHTTPリクエストヘッダの一覧
        // 許可したいアクセス元の一覧
        AllowOrigins: []string{
            "http://localhost:3000",
        },
    }))
	r.LoadHTMLGlob("views/html/*")

	

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title": "OAuth sample app!",
		})
	})

	r.GET("/twitter", func(c *gin.Context) {
		aToken := twitter.GetAccessToken(c)
		
		if aToken == nil {
			c.Redirect(http.StatusSeeOther, "/twitter/oauth")
			return
		}
		// プロフィール取得
		fmt.Println(aToken)

		user := twitter.User{}
		_ = twitter.GetUser(c, aToken, &user)
		// if err != nil {
		// 	c.Redirect(http.StatusSeeOther, "/twitter/oauth")
		// 	return
		// }

		fmt.Println(user)
		c.JSON(200, gin.H{"user":user})
		// タイムライン取得
		// tl := twitter.UserTimeline{}
		// err = twitter.GetUserTimeline(c, aToken, user.ID, &tl)
		// if err != nil {
		// 	c.Redirect(http.StatusSeeOther, "/twitter/oauth")
		// 	return
		// }
		// // ユーザーページ表示
		// c.HTML(http.StatusOK, "twitter.html", gin.H{
		// 	"title":    "user page",
		// 	"user":     user,
		// 	"timeline": tl,
		// })
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
		fmt.Println(69,loginURL)
		c.JSON(200, gin.H{"url":loginURL})
	})
	r.GET("/twitter/callback", func(c *gin.Context) {
		redirectURL, err := twitter.Callback(c)
		fmt.Println(114, redirectURL)
		if err != nil {
			c.Redirect(http.StatusSeeOther, "/twitter/oauth")
			return
		}
		//fmt.Println(redirectURL)
		c.Redirect(http.StatusFound, "/api/proxy/callback")
		//c.Redirect(http.StatusFound, redirectURL)
	})
	r.POST("/twitter/unoauth", func(c *gin.Context) {
		err := twitter.UnOAuth(c)
		if err != nil {
			c.Redirect(http.StatusSeeOther, "/")
			return
		}
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title": "twitter unauthorize successed",
		})
	})
	// r.POST("/twitter/post", func(c *gin.Context) {
	// 	aToken := twitter.GetAccessToken(c)
	// 	if aToken == nil {
	// 		c.Redirect(http.StatusSeeOther, "/twitter/oauth")
	// 		return
	// 	}
	// 	post := twitter.NewPost{
	// 		Status: c.PostForm("content"),
	// 	}
	// 	err := twitter.Tweet(c, aToken, &post)
	// 	if err != nil {
	// 		c.Redirect(http.StatusSeeOther, "/twitter")
	// 		return
	// 	}
	// 	c.Redirect(http.StatusFound, "/twitter")
	// })
	r.POST("/add", func(c *gin.Context){
		aToken := twitter.GetAccessToken(c)
		if aToken == nil {
			c.Redirect(http.StatusSeeOther, "/twitter/oauth")
			return
		}

		post := twitter.NewPost{
			Status: c.PostForm("content"),
		}

		err := twitter.Tweet(c, aToken, &post)
		if err != nil {
			c.Redirect(http.StatusSeeOther, "/twitter")
			return
		}
		c.Redirect(http.StatusFound, "/twitter")

	})

	r.Run() // listen and serve on 0.0.0.0:8080
}
