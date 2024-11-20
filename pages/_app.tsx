import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ToastProvider } from '../components/ui/use-toast'
import { ToastContainer } from '../components/ui/ToastContainer'
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ToastContainer />
    </ToastProvider>
  )
}

export default MyApp 