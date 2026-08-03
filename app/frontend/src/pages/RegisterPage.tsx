import React, { useState } from 'react';
import { Form, Input, Button, Typography, Select, Alert, message } from 'antd';
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
        phone: values.phone,
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', padding: '24px 0' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ color: '#0c5da5', marginBottom: 4, fontWeight: 700 }}>
            MedVision Hub
          </Title>
          <Text style={{ color: '#5a6d82', fontSize: 13 }}>
            Tạo tài khoản mới
          </Text>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '32px 28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgb(0 0 0 / 0.04)' }}>
          <Title level={4} style={{ marginBottom: 24, color: '#1a2b42', fontWeight: 600 }}>
            Đăng ký tài khoản
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

          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ role: 'patient' }}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              label="Họ và tên"
              name="full_name"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Nguyễn Văn A" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                { min: 3, message: 'Tối thiểu 3 ký tự' },
              ]}
            >
              <Input placeholder="username" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input placeholder="email@example.com" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ pattern: /^[0-9+\-\s]{7,20}$/, message: 'Số điện thoại không hợp lệ' }]}
            >
              <Input placeholder="0901 234 567" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Tối thiểu 6 ký tự' },
              ]}
            >
              <Input.Password placeholder="Tối thiểu 6 ký tự" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              label="Vai trò"
              name="role"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select placeholder="Chọn vai trò" size="large" style={{ borderRadius: 8 }}>
                <Option value="patient">Bệnh nhân</Option>
                <Option value="doctor">Bác sĩ</Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{ borderRadius: 8, height: 44, fontWeight: 500, background: '#0c5da5' }}
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text style={{ color: '#5a6d82', fontSize: 13 }}>Đã có tài khoản?{' '}</Text>
            <Link to="/login" style={{ fontSize: 13, fontWeight: 600, color: '#0c5da5' }}>
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
