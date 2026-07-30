import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest } from '../types/user';
import axios from 'axios';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await login(values);
      message.success('Đăng nhập thành công!');
      navigate('/dashboard', { replace: true });
    } catch (error: unknown) {
      let errMsg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu!';
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errMsg = error.response.data.error;
      } else if (error instanceof Error) {
        errMsg = error.message;
      }
      setErrorMessage(errMsg);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ color: '#0c5da5', marginBottom: 4, fontWeight: 700 }}>
            MedVision Hub
          </Title>
          <Text style={{ color: '#5a6d82', fontSize: 13 }}>
            Hệ thống Quản lý Hình ảnh Y tế
          </Text>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '32px 28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgb(0 0 0 / 0.04)' }}>
          <Title level={4} style={{ marginBottom: 24, color: '#1a2b42', fontWeight: 600 }}>
            Đăng nhập
          </Title>

          {errorMessage && (
            <Alert
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage(null)}
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          <Form name="login" onFinish={onFinish} layout="vertical" autoComplete="off" requiredMark={false}>
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            >
              <Input placeholder="Nhập tên đăng nhập" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -8 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: '#0c5da5' }}>
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{ borderRadius: 8, height: 44, fontWeight: 500, background: '#0c5da5' }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text style={{ color: '#5a6d82', fontSize: 13 }}>Chưa có tài khoản?{' '}</Text>
            <Link to="/register" style={{ fontSize: 13, fontWeight: 600, color: '#0c5da5' }}>
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
