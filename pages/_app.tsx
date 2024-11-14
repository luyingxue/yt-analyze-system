import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ToastProvider } from '../components/ui/use-toast'
import { ToastContainer } from '../components/ui/ToastContainer'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <Component {...pageProps} />
      <ToastContainer />
    </ToastProvider>
  )
}

export default MyApp 