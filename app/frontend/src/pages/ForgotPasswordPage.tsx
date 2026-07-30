import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { Link } from 'react-router-dom';
import permissionService from '../services/permissionService';

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      const res = await permissionService.forgotPassword({ email: values.email });
      setSuccessMsg(res.message || 'Yêu cầu đã được xử lý. Vui lòng kiểm tra Terminal Backend để lấy mã Token.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại!');
      }
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
            Khôi phục mật khẩu tài khoản
          </Text>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '32px 28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgb(0 0 0 / 0.04)' }}>
          <Title level={4} style={{ marginBottom: 8, color: '#1a2b42', fontWeight: 600 }}>
            Quên mật khẩu?
          </Title>
          <Text style={{ color: '#5a6d82', fontSize: 13, display: 'block', marginBottom: 24 }}>
            Nhập email tài khoản để nhận hướng dẫn đặt lại mật khẩu.
          </Text>

          {error && (
            <Alert description={error} type="error" showIcon closable onClose={() => setError(null)} style={{ marginBottom: 20, borderRadius: 8 }} />
          )}

          {successMsg && (
            <div style={{ marginBottom: 20 }}>
              <Alert description={successMsg} type="success" showIcon style={{ borderRadius: 8, marginBottom: 12 }} />
              <Link to="/reset-password">
                <Button
                  type="primary"
                  block
                  size="large"
                  style={{ borderRadius: 8, height: 44, fontWeight: 500, background: '#0d9f6e' }}
                >
                  Nhập mã Token & Đặt lại mật khẩu
                </Button>
              </Link>
            </div>
          )}

          <Form name="forgot" onFinish={onFinish} layout="vertical" autoComplete="off" requiredMark={false}>
            <Form.Item
              label="Địa chỉ Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input placeholder="email@example.com" size="large" style={{ borderRadius: 8 }} />
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
                Gửi yêu cầu
              </Button>
            </Form.Item>
          </Form>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <Link to="/login" style={{ fontSize: 13, color: '#0c5da5' }}>← Đăng nhập</Link>
            <Link to="/reset-password" style={{ fontSize: 13, color: '#0c5da5' }}>Đã có Token? →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
