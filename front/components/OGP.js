import React from 'react'
import Head from 'next/head';

class Ogps extends React.Component {
  render(){
    return (
      <>
        <Head>
        <title>ツイッターを破壊</title>
          <link rel="icon" href="/favicon.ico" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="ツイッターを破壊" />
          <meta property="og:url" content="https://all-mute.vercel.app/" />
          <meta property="og:image" key="ogImage" content="https://all-mute.vercel.app/OGP.png"/>
          <meta property="og:site_name" content="ツイッターを破壊" />
          <meta property="og:description" content="フォロー中のアカウントを全員ミュートするツール" />
          <meta name="twitter:image" key="twitterImage" content="https://all-mute.vercel.app/OGP.png"/>
          <meta name="twitter:side" content="@const_myself"/>
          <meta name="twitter:player" content="@const_myself"/>
          <meta name="twitter:card" content="summary"/>
        </Head>
      </>
  )}
}

export default Ogps