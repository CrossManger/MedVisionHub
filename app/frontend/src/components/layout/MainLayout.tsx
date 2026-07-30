import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  return (
    <Layout className="min-h-screen" style={{ background: '#f0f4f8' }}>
      <AppSidebar />
      <Layout style={{ background: '#f0f4f8' }}>
        <AppHeader />
        <Content
          style={{
            margin: '16px',
            padding: '24px',
            background: '#ffffff',
            borderRadius: '12px',
            minHeight: 'calc(100vh - 88px)',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)',
            border: '1px solid #e2e8f0',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
