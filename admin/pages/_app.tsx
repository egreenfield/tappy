import '../global.css'
import { SessionProvider } from "next-auth/react"
import { AppDataContext, appData } from '../lib/appData';
export default function MyApp({ Component, pageProps: {session, ...pageProps}, }) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <AppDataContext.Provider>
        <SessionProvider session={session}>
            {getLayout(<Component {...pageProps} />)}
        </SessionProvider>
    </AppDataContext.Provider>
    )
}