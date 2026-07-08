import axios from 'axios';

// Backend API runs on port 8080 by default.
// In Android Emulator, localhost maps to 10.0.2.2
const getBaseUrl = () => {
  const isCapacitor = window.Capacitor || (window.location.hostname === 'localhost' && window.location.port === '');
  return isCapacitor ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor đính kèm JWT token vào header của mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý lỗi 401 (Hết hạn token) -> Tự động logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
