import React from 'react';
import logo from './logo.svg';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import './App.css';
import Layout from './components/layout';
import { Route } from 'react-router-dom';
import Index from './pages';
import Search from './pages/search';

function App() {
  return (
    <div className="App">
    <Layout>
      <Route path="/" element={<Index />}/>
      <Route path="/search" element={<Search />}/>
      <Route path="/my_music" element={<Index />}/>
    </Layout>
    </div>
      );
}

export default App;



