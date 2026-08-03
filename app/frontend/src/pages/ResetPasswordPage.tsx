import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import permissionService from '../services/permissionService';

const { Title, Text } = Typography;

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { token: string; new_password: string; confirm_password: string }) => {
    if (values.new_password !== values.confirm_password) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      const res = await permissionService.resetPassword({
        token: values.token,
        new_password: values.new_password,
      });
      setSuccessMsg(res.message || 'Đặt lại mật khẩu thành công!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại token.');
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
            Đặt lại mật khẩu tài khoản
          </Text>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '32px 28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgb(0 0 0 / 0.04)' }}>
          <Title level={4} style={{ marginBottom: 8, color: '#1a2b42', fontWeight: 600 }}>
            Đặt lại mật khẩu
          </Title>
          <Text style={{ color: '#5a6d82', fontSize: 13, display: 'block', marginBottom: 24 }}>
            Nhập mã Token và mật khẩu mới bên dưới.
          </Text>

          {error && (
            <Alert description={error} type="error" showIcon closable onClose={() => setError(null)} style={{ marginBottom: 20, borderRadius: 8 }} />
          )}

          {successMsg && (
            <Alert description={successMsg} type="success" showIcon style={{ marginBottom: 20, borderRadius: 8 }} />
          )}

          <Form
            name="reset"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
            requiredMark={false}
            initialValues={{ token: tokenFromUrl }}
          >
            {!tokenFromUrl && (
              <Form.Item
                label="Reset Token"
                name="token"
                rules={[{ required: true, message: 'Vui lòng nhập Reset Token' }]}
              >
                <Input.TextArea rows={3} placeholder="Dán mã token từ Terminal Backend vào đây..." style={{ borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }} />
              </Form.Item>
            )}

            <Form.Item
              label="Mật khẩu mới"
              name="new_password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                { min: 6, message: 'Tối thiểu 6 ký tự' },
              ]}
            >
              <Input.Password placeholder="Tối thiểu 6 ký tự" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirm_password"
              rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu mới" size="large" style={{ borderRadius: 8 }} />
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
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <Link to="/login" style={{ fontSize: 13, color: '#0c5da5' }}>← Quay lại Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
