import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1184252809909531"
     crossorigin="anonymous"></script>
      <Component {...pageProps} />
    </>
}

export default MyApp
