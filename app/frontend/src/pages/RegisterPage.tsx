import React from 'react';
import { Form, Input, Button, Card, Typography, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { RegisterRequest } from '../types/user';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const onFinish = async (values: RegisterRequest) => {
    await register(values);
    // placeholder: move to login
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <Card className="w-full max-w-md shadow-lg rounded-xl overflow-hidden border-0">
        <div className="text-center mb-8">
          <Title level={2} className="!text-[#1677ff] !mb-1">MedVision Hub</Title>
          <Text type="secondary">Tạo tài khoản mới</Text>
        </div>
        
        <Form
          name="register"
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input prefix={<IdcardOutlined className="text-gray-400" />} placeholder="Họ và tên" />
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Mật khẩu" />
          </Form.Item>
          
          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="DOCTOR">Bác sĩ</Option>
              <Option value="NURSE">Y tá</Option>
              <Option value="ADMIN">Quản trị viên</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full mt-2" size="large">
              Đăng ký
            </Button>
          </Form.Item>
          
          <div className="text-center mt-4">
            <Text>Đã có tài khoản? </Text>
            <Link to="/login" className="text-[#1677ff] hover:underline">Đăng nhập ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
