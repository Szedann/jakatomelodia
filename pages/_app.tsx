import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return <>
      {/* <Head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1184252809909531" crossOrigin="anonymous"></script>
      </Head> */}
      <Component {...pageProps} />
    </>
}

export default MyApp
