import axios from 'axios';

// URL máy chủ - dùng relative path để Nginx proxy tới backend
// Tự động hoạt động cả ở dev (localhost:8080) lẫn Docker (http://backend:8080)
const API_BASE = "/api/auth";

export const authService = {
  // Đăng ký: yêu cầu fullname, email, phone, password, confirmPassword, username, role
  register: (data) => axios.post(`${API_BASE}/register`, data),

  // Đăng nhập: yêu cầu identifier (Username, Email hoặc Số điện thoại) và password
  login: (data) => axios.post(`${API_BASE}/login`, data),

  // Quên mật khẩu: yêu cầu identifier
  forgotPassword: (data) => axios.post(`${API_BASE}/forgot-password`, data),
  // Xác thực OTP
  verifyOtp: (data) => axios.post(`${API_BASE}/verify-otp`, data),

  // Reset mật khẩu
  resetPassword: (data) => axios.post(`${API_BASE}/reset-password`, data)
};