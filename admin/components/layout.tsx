import Head from 'next/head'
import styles from './layout.module.css'

import { Layout as AntLayout, Menu } from 'antd';
import { useRouter } from 'next/router';
const { Header, Content, Footer } = AntLayout;
import { AiOutlineHome, AiFillHome } from 'react-icons/ai';

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
      <Header style={{ padding: '0px 20px' }}>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[selected]} onClick={({key}) => navigate(key)}>
          <Menu.Item key=""><AiOutlineHome /></Menu.Item>
          <Menu.Item key="search">search</Menu.Item>
          <Menu.Item key="my_music">my music</Menu.Item>
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
