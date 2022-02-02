import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import { Button } from 'antd';

export default function Account() {
  const { data: session } = useSession()
  return (
    <section>
      <h2>Account</h2> {(() => {
        if (session) {
          return  <>
              <p> You are signed in</p>
              <Button type="primary" onClick={()=> signOut()}>Sign out</Button>
            </>
        } else {
          return  <>
            <p> You are NOT signed in</p>
            <Button type="primary" onClick={()=>signIn("spotify")}>Sign in</Button>
          </>
        }
      })()}
    </section>
  )
}

Account.getLayout = function getLayout(page) {
  return (
    <Layout selected='account'>{page}</Layout>
  )
}
