import axios from 'axios';

// URL máy chủ từ file JSON
const API_BASE = "http://localhost:8080/api/auth";

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