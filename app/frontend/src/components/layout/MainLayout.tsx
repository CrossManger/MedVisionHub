import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  return (
    <Layout className="min-h-screen">
      <AppSidebar />
      <Layout>
        <AppHeader />
        <Content className="m-6 p-6 bg-white rounded-lg shadow-sm">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
