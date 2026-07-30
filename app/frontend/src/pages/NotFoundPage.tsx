import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
        extra={
          <Button
            type="primary"
            onClick={() => navigate('/')}
            style={{ borderRadius: 8, background: '#0c5da5' }}
          >
            Về trang chủ
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;
