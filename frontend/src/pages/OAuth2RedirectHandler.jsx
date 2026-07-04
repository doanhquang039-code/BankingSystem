import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler = () => {
  const { loginWithOAuthToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const role = searchParams.get('role');

    if (token && username) {
      // Lưu token và user info vào AuthContext
      loginWithOAuthToken(token, username, email, role);
      // Điều hướng về trang chủ Dashboard
      navigate('/dashboard');
    } else {
      // Nếu có lỗi, chuyển về trang login kèm cảnh báo
      navigate('/login?error=oauth2_failed');
    }
  }, [searchParams, loginWithOAuthToken, navigate]);

  return (
    <div className="oauth2-loading-screen">
      <div className="spinner-glow"></div>
      <p>Xác thực thông tin tài khoản của bạn...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
