import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import permissionService from '../services/permissionService';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const res = await permissionService.forgotPassword({ email });
      setMessage(res.message || 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Quên mật khẩu?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="example@medvision.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu đặt lại mật khẩu'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Quay lại trang Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
