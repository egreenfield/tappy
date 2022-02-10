import { Button } from "antd"
import { signIn, signOut, useSession } from "../lib/auth"

export default function Index() {
    const {data:session} = useSession()
    return (
      <section>
        {(() => {
          if (session) {
            return  <>
                <p> You are signed in</p>
                <Button type="primary" onClick={()=> signOut()}>Sign out</Button>
              </>
          } else {
            return  <>
              <p> You are NOT signed in</p>
              <Button type="primary" onClick={()=> signIn()}>Sign in</Button>
            </>
          }
        })()}
      </section>
    )
}