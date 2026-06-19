import axios from 'axios';

/**
 * Global API Client - Sử dụng relative path
 * 
 * Khi chạy trong Docker:
 * - Frontend từ Nginx tại http://localhost (cổng 80)
 * - Request /api/... sẽ được Nginx proxy sang http://backend:8080/api/...
 * 
 * Khi chạy ở dev:
 * - Frontend tại http://localhost:5173
 * - Backend tại http://localhost:8080
 * - Sử dụng relative path /api/... rồi browser sẽ convert thành http://localhost:8080/api/...
 *   (hoặc nếu có proxy config trong vite.config.js)
 */

const apiClient = axios.create({
  // Sử dụng relative path - tương thích cả Docker (proxy Nginx) và dev mode
  baseURL: '/api',
  
  // Timeout cho mỗi request
  timeout: 30000,
  
  // Cho phép gửi cookie/credentials
  withCredentials: true,
  
  // Headers mặc định
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để tự động thêm JWT token vào Authorization header
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (nếu có)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi 401 - token hết hạn
    if (error.response?.status === 401) {
      // Xóa token cũ
      localStorage.removeItem('token');
      // Chuyển hướng đến trang login (tùy chọn)
      // window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
