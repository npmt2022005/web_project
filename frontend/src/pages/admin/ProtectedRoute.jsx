// src/pages/admin/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Lấy dữ liệu chứng thực và vai trò được lưu trong localStorage khi handleLogin thành công
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Trường hợp 1: Người dùng chưa đăng nhập hệ thống
  if (!token) {
    // Đá người dùng về trang đăng nhập và xóa các dữ liệu rác nếu có
    return <Navigate to="/login" replace />;
  }

  // Trường hợp 2: Đã đăng nhập nhưng vai trò KHÔNG PHẢI là ADMIN
  if (userRole !== 'ROLE_ADMIN' && userRole !== 'ADMIN') {
    // Đá người dùng về trang chủ công khai của hệ thống để bảo mật thông tin
    return <Navigate to="/" replace />;
  }

  // Trường hợp 3: Hợp lệ (Đã đăng nhập & là tài khoản ADMIN) -> Cho phép hiển thị nội dung trang admin
  return children;
};

export default ProtectedRoute;