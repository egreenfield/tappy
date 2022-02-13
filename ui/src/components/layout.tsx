import './layout.module.css'
import { Layout as AntLayout, Menu } from 'antd';
import {Route, Routes, useLocation, useNavigate } from 'react-router-dom'; 
import { AiOutlineHome } from 'react-icons/ai';

const { Header, Content } = AntLayout;

type RouteType = ReturnType<typeof Route>;

interface LayoutProperties{
  children:RouteType[] | RouteType;
}



export default function Layout({children}:LayoutProperties) {
  const navigate = useNavigate();
  const location = useLocation();

  const onNavigate = (section:string) => {
    navigate(section)
  }
  return (
  <AntLayout>
      <Header style={{ padding: '0px 20px' }}>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[location.pathname]} onClick={({key}) => onNavigate(key)}>
          <Menu.Item key="/"><AiOutlineHome /></Menu.Item>
          <Menu.Item key="/search">search</Menu.Item>
          <Menu.Item key="/my_music">my music</Menu.Item>
          <Menu.Item key="/cards">cards</Menu.Item>
          <Menu.Item key="/bookmarks">bookmarks</Menu.Item>
          <Menu.Item key="/speakers">speakers</Menu.Item>
          <Menu.Item key="/import">import</Menu.Item>
          <Menu.Item key="/account">account</Menu.Item>
        </Menu>        
      </Header>
      <Content style={{ padding: '50px' }}>
        <div className="site-layout-content">
        <Routes>
          {children}
        </Routes>
          </div>      
      </Content>
      {/* <Footer>Footer</Footer> */}
  </AntLayout>
 )
}
