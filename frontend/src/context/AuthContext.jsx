import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password, captchaId, captchaCode) => {
    try {
      const response = await api.post('/auth/login', { username, password, captchaId, captchaCode });
      const { token: jwtToken, ...userData } = response.data;
      
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng',
      };
    }
  };

  const register = async (username, password, email, fullName, phone) => {
    try {
      const response = await api.post('/auth/register', { username, password, email, fullName, phone });
      const { token: jwtToken, ...userData } = response.data;
      
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại. Tên đăng nhập hoặc email đã tồn tại',
      };
    }
  };

  const loginWithOAuthToken = (jwtToken, username, email, role, customerId, customerName) => {
    const userData = { 
      username, 
      email, 
      role, 
      customerId: customerId ? parseInt(customerId) : null, 
      customerName 
    };
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isManager = () => user?.role === 'MANAGER';
  const isSupport = () => user?.role === 'SUPPORT';
  const isAuditor = () => user?.role === 'AUDITOR';
  const isCustomer = () => user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      loginWithOAuthToken, 
      logout, 
      isAdmin,
      isManager,
      isSupport,
      isAuditor,
      isCustomer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
