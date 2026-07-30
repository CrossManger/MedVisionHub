import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-10 px-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/90">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-[#1677ff] mb-3 shadow-inner">
            <LoginOutlined className="text-3xl" />
          </div>
          <Title level={2} className="!text-[#1677ff] !mb-1 font-bold tracking-tight">
            MedVision Hub
          </Title>
          <Text type="secondary" className="text-sm">
            Hệ thống Quản lý & Cổng dữ liệu Hình ảnh Y tế
          </Text>
        </div>

        {errorMessage && (
          <Alert
            message="Lỗi đăng nhập"
            description={errorMessage}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMessage(null)}
            className="mb-6 rounded-lg"
          />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          size="large"
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Tên đăng nhập" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Mật khẩu" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item className="mb-3">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="w-full h-11 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div className="flex items-center justify-between mt-4">
            <Link to="/forgot-password" className="text-sm text-[#1677ff] hover:underline">
              Quên mật khẩu?
            </Link>
            <div>
              <Text type="secondary" className="text-sm">Chưa có tài khoản? </Text>
              <Link to="/register" className="text-sm text-[#1677ff] font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
