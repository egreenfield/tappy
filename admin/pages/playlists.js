import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import { useSession, signIn, signOut } from "next-auth/react"

export default function Playlists() {
  const { data: session } = useSession()
  if (session) {
    return (
    <section>
      <h2>Playlists</h2>
      <p>
        This example adds a property <code>getLayout</code> to your page,
        allowing you to return a React component for the layout. This allows you
        to define the layout on a per-page basis. Since we're returning a
        function, we can have complex nested layouts if desired.
      </p>
      <p>
        When navigating between pages, we want to persist page state (input
        values, scroll position, etc) for a Single-Page Application (SPA)
        experience.
      </p>
      <p>
        This layout pattern will allow for state persistence because the React
        component tree is persisted between page transitions. To preserve state,
        we need to prevent the React component tree from being discarded between
        page transitions.
      </p>
      <h3>Try It Out</h3>
      <p>
        To visualize this, try tying in the search input in the{' '}
        <code>Sidebar</code> and then changing routes. You'll notice the input
        state is persisted.
      </p>
    </section>
  )
  }
  return (
    <section>
      <h2>Playlists</h2>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </section>
  )

}

Playlists.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Sidebar />
      {page}
    </Layout>
  )
}
