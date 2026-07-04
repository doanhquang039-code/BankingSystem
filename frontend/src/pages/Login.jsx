import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, RefreshCw } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login, loginWithOAuthToken, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Kiểm tra nếu có token được redirect về từ OAuth2 thành công
  useEffect(() => {
    const oauthToken = searchParams.get('token');
    const oauthUsername = searchParams.get('username');
    const oauthEmail = searchParams.get('email');
    const oauthRole = searchParams.get('role');

    if (oauthToken && oauthUsername) {
      loginWithOAuthToken(oauthToken, oauthUsername, oauthEmail, oauthRole);
      navigate('/dashboard');
    } else if (token) {
      navigate('/dashboard');
    }
  }, [searchParams, token, navigate, loginWithOAuthToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(username, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleSocialLogin = (provider) => {
    // Chuyển hướng trình duyệt sang endpoint OAuth2 của Backend
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  return (
    <div className="login-container">
      <div className="glow-bubble bubble-1"></div>
      <div className="glow-bubble bubble-2"></div>
      
      <div className="login-card">
        <div className="brand-logo">
          <span>🏦</span>
        </div>
        <h2>BankingSystem</h2>
        <p className="tagline">Hệ thống ngân hàng số bảo mật và thông minh</p>

        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
            {submitting ? <RefreshCw className="animate-spin" size={18} /> : 'Đăng Nhập'}
          </button>
        </form>

        <div className="divider">
          <span>Hoặc đăng nhập bằng</span>
        </div>

        <div className="social-grid">
          <button onClick={() => handleSocialLogin('google')} className="social-btn google">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>
          
          <button onClick={() => handleSocialLogin('facebook')} className="social-btn facebook">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </button>

          <button onClick={() => handleSocialLogin('microsoft')} className="social-btn microsoft">
            {/* Custom Simple Windows Icon representation */}
            <svg viewBox="0 0 23 23" width="16" height="16" fill="currentColor">
              <path d="M0 0h11v11H0zm12 0h11v11H12zM0 12h11v11H0zm12 0h11v11H12z"/>
            </svg>
            <span>Microsoft</span>
          </button>

          <button onClick={() => handleSocialLogin('linkedin')} className="social-btn linkedin">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            <span>LinkedIn</span>
          </button>
        </div>

        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
