import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  return (
    <Layout className="min-h-screen bg-gray-100">
      <AppSidebar />
      <Layout className="bg-gray-100 min-h-screen">
        <AppHeader />
        <Content className="m-3 sm:m-6 p-4 sm:p-6 bg-white rounded-xl shadow-sm min-h-[calc(100vh-7rem)] overflow-x-hidden">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
