import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Select, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { RegisterRequest } from '../types/user';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

interface FormValues extends RegisterRequest {
  confirmPassword?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const payload: RegisterRequest = {
        full_name: values.full_name,
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role || 'patient',
      };

      await register(payload);
      message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error: unknown) {
      let errMsg = 'Đăng ký thất bại. Vui lòng thử lại sau!';
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
            <SafetyOutlined className="text-3xl" />
          </div>
          <Title level={2} className="!text-[#1677ff] !mb-1 font-bold tracking-tight">
            MedVision Hub
          </Title>
          <Text type="secondary" className="text-sm">
            Tạo tài khoản mới để trải nghiệm hệ thống
          </Text>
        </div>

        {errorMessage && (
          <Alert
            message="Lỗi đăng ký"
            description={errorMessage}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMessage(null)}
            className="mb-6 rounded-lg"
          />
        )}

        <Form
          name="register"
          onFinish={onFinish}
          size="large"
          layout="vertical"
          initialValues={{ role: 'patient' }}
          autoComplete="off"
        >
          <Form.Item
            label="Họ và tên"
            name="full_name"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input 
              prefix={<IdcardOutlined className="text-gray-400" />} 
              placeholder="Nguyễn Văn A" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
              { max: 100, message: 'Tên đăng nhập không vượt quá 100 ký tự!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="username" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Định dạng email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              placeholder="user@example.com" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Tối thiểu 6 ký tự" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Nhập lại mật khẩu" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò" className="rounded-lg">
              <Option value="patient">Bệnh nhân (Patient)</Option>
              <Option value="doctor">Bác sĩ (Doctor)</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-3">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="w-full h-11 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Đăng ký ngay
            </Button>
          </Form.Item>

          <div className="text-center mt-4">
            <Text type="secondary">Đã có tài khoản? </Text>
            <Link to="/login" className="text-[#1677ff] font-semibold hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
