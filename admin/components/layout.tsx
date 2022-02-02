import Head from 'next/head'
import styles from './layout.module.css'

import { Layout as AntLayout, Menu } from 'antd';
import { useRouter } from 'next/router';
const { Header, Content, Footer } = AntLayout;

export default function Layout({ children, selected }:{children:any[],selected:string}) {
  const router = useRouter();
  const navigate = (section:string) => {
    router.push("/"+section)
  }
  return (
  //   <>
  //     <Head>
  //       <title>Layouts Example</title>
  //     </Head>
  //     <main className={styles.main}>{children}</main>
  //   </>
  <AntLayout>
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[selected]} onClick={({key}) => navigate(key)}>
          <Menu.Item key="albums">albums</Menu.Item>
          <Menu.Item key="playlists">playlists</Menu.Item>
          <Menu.Item key="cards">cards</Menu.Item>
          <Menu.Item key="speakers">speakers</Menu.Item>
          <Menu.Item key="account">account</Menu.Item>
        </Menu>        
      </Header>
      <Content style={{ padding: '50px' }}>
        <div className="site-layout-content">{children}</div>      
      </Content>
      {/* <Footer>Footer</Footer> */}
  </AntLayout>
 )
}
