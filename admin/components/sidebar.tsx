import Link from 'next/link'
import styles from './sidebar.module.css'
import { useSession, signIn, signOut } from "next-auth/react"

export default function Sidebar() {
  const { data: session } = useSession()
  return (
    <nav className={styles.nav}>
      {/* <input className={styles.input} placeholder="Search..." />  */}
      <Link href="/account">
        <a>Account</a>
      </Link>
      <Link href="/playlists">
        <a>Playlists</a>
      </Link>
      <Link href="/albums">
        <a>Albums</a>
      </Link>
      <Link href="/speakers">
        <a>Speakers</a>
      </Link>
      <Link href="/cards">
        <a>Cards</a>
      </Link>
      {(session)?
        <a onClick={() => signOut()}>Sign out</a>
        :
        <a onClick={() => signIn('spotify')}>Sign in</a>
      }
    </nav>
  )
}
