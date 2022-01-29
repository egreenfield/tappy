import Link from 'next/link'
import styles from './sidebar.module.css'

export default function Sidebar() {
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
    </nav>
  )
}
