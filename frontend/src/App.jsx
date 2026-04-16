import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth/AuthPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Thay vì hiện HomePlaceholder, ta tự động chuyển hướng sang /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Cấu hình trang Đăng nhập */}
        <Route path="/login" element={<AuthPage isLoginDefault={true} />} />
        
        {/* Cấu hình trang Đăng ký */}
        <Route path="/signup" element={<AuthPage isLoginDefault={false} />} />

        {/* Chuyển hướng tất cả các đường dẫn lạ về /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;