package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"fmt"
	"encoding/json"

	"github.com/joho/godotenv"
	"github.com/dghubble/go-twitter/twitter"
	oauth1Login "github.com/dghubble/gologin/v2/oauth1"
	twitterLogin "github.com/dghubble/gologin/v2/twitter"
	"github.com/dghubble/oauth1"
	twitterOAuth1 "github.com/dghubble/oauth1/twitter"
	"github.com/dghubble/sessions"
)

var (
)

const (
	sessionName             = "example-twtter-app"
	sessionSecret           = "example cookie signing secret"
	sessionUserKey          = "twitterID"
	sessionUsername         = "twitterUsername"
	sessionUserAccessToken  = "accessUserAccessToken"
	sessionUserAccessSecret = "twitterUserAccessSecret"
)

const followTargetTwitterUserScreenName = "const_myself"

// sessionStore encodes and decodes session data stored in signed cookies
var sessionStore = sessions.NewCookieStore([]byte(sessionSecret), nil)

// Config configures the main ServeMux.
type Config struct {
	TwitterConsumerKey    string
	TwitterConsumerSecret string
}

// New returns a new ServeMux with app routes.
func New(config *Config) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/", profileHandler)

	mux.HandleFunc("/logout", logoutHandler)

	// 1. Register Twitter login and callback handlers
	oauth1Config := &oauth1.Config{
		ConsumerKey:    config.TwitterConsumerKey,
		ConsumerSecret: config.TwitterConsumerSecret,
		CallbackURL:    "http://localhost:8080/twitter/callback",
		Endpoint:       twitterOAuth1.AuthorizeEndpoint,
	}

	mux.HandleFunc("/follow", followHandler(oauth1Config))
	mux.HandleFunc("/unfollow", unfollowHandler(oauth1Config))
	mux.Handle("/twitter/login", twitterLogin.LoginHandler(oauth1Config, nil))
	mux.Handle("/twitter/callback", twitterLogin.CallbackHandler(oauth1Config, issueSession(), nil))
	return mux
}

// issueSession issues a cookie session after successful Twitter login
func issueSession() http.Handler {
	fn := func(w http.ResponseWriter, req *http.Request) {
		ctx := req.Context()
		twitterUser, err := twitterLogin.UserFromContext(ctx)
		if err != nil {
			log.Print(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// 2. Implement a success handler to issue some form of session
		accessToken, accessSecret, err := oauth1Login.AccessTokenFromContext(ctx)
		if err != nil {
			log.Print(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		session := sessionStore.New(sessionName)
		session.Values[sessionUserKey] = twitterUser.ID
		session.Values[sessionUsername] = twitterUser.ScreenName
		session.Values[sessionUserAccessToken] = accessToken
		session.Values[sessionUserAccessSecret] = accessSecret
		session.Save(w)
		fmt.Println(twitterUser)
		http.Redirect(w, req, "/profile", http.StatusFound)
	}
	return http.HandlerFunc(fn)
}

// profileHandler shows a personal profile or a login button.
func profileHandler(w http.ResponseWriter, req *http.Request) {
	//session, err := sessionStore.Get(req, sessionName)
	data, _ := json.Marshal("{body:hello}")
	w.Write(data)
}

// follow handler follows @nekoshita_yuki by authed twitter user
func followHandler(config *oauth1.Config) func(w http.ResponseWriter, req *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		twitterClient, err := getTwitterClientFromRequest(config, req)
		if err != nil {
			log.Print(err)
			return
		}

		_, _, err = twitterClient.Friendships.Create(&twitter.FriendshipCreateParams{
			ScreenName: followTargetTwitterUserScreenName,
		})
		if err != nil {
			log.Print(err)
			return
		}

		http.Redirect(w, req, "/", http.StatusFound)
	}
}

// follow handler unfollows @nekoshita_yuki by authed twitter user
func unfollowHandler(config *oauth1.Config) func(w http.ResponseWriter, req *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		twitterClient, err := getTwitterClientFromRequest(config, req)
		if err != nil {
			log.Print(err)
			return
		}

		_, _, err = twitterClient.Friendships.Destroy(&twitter.FriendshipDestroyParams{
			ScreenName: followTargetTwitterUserScreenName,
		})
		if err != nil {
			log.Print(err)
			return
		}

		http.Redirect(w, req, "/", http.StatusFound)
	}
}

// logoutHandler destroys the session on POSTs and redirects to home.
func logoutHandler(w http.ResponseWriter, req *http.Request) {
	if req.Method == "POST" {
		sessionStore.Destroy(w, sessionName)
	}
	http.Redirect(w, req, "/", http.StatusFound)
}

func getTwitterClientFromRequest(config *oauth1.Config, req *http.Request) (*twitter.Client, error) {
	session, err := sessionStore.Get(req, sessionName)
	fmt.Println(req, sessionName)
	if err != nil {
		log.Print(err)
		return nil, err
	}

	accessToken := session.Values[sessionUserAccessToken].(string)
	accessSecret := session.Values[sessionUserAccessSecret].(string)
	httpClient := config.Client(req.Context(), oauth1.NewToken(accessToken, accessSecret))
	twitterClient := twitter.NewClient(httpClient)
	return twitterClient, nil
}

// main creates and starts a Server listening.
func main() {
	const address = "localhost:8080"
	godotenv.Load(fmt.Sprintf("%s.env", os.Getenv("GO_ENV")))
	// read credentials from environment variables if available
	config := &Config{
		TwitterConsumerKey:    os.Getenv("TWITTER_CONSUMER_KEY"),
		TwitterConsumerSecret: os.Getenv("TWITTER_CONSUMER_SECRET"),
	}
	// allow consumer credential flags to override config fields
	consumerKey := flag.String("consumer-key", "", "Twitter Consumer Key")
	consumerSecret := flag.String("consumer-secret", "", "Twitter Consumer Secret")
	flag.Parse()
	if *consumerKey != "" {
		config.TwitterConsumerKey = *consumerKey
	}
	if *consumerSecret != "" {
		config.TwitterConsumerSecret = *consumerSecret
	}
	if config.TwitterConsumerKey == "" {
		log.Fatal("Missing Twitter Consumer Key")
	}
	if config.TwitterConsumerSecret == "" {
		log.Fatal("Missing Twitter Consumer Secret")
	}

	var err error

	log.Printf("Starting Server listening on %s\n", address)
	err = http.ListenAndServe(address, New(config))
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
