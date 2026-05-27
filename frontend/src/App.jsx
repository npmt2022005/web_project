import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth/AuthPage';
import HomePage from './pages/HomePage'; // Import trang chủ chung
import BuyerHome from './pages/Marketplace/BuyerHome';   // Import trang Buyer
import SellerHome from './pages/Dashboard/SellerHome'; // Import trang Seller
import Profile from './pages/Profile/Profile'; // Import trang Profile vừa tạo mới

// Component giữ chỗ tạm thời cho các trang danh mục chưa phát triển xong
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '100px', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <h2>{title} Page</h2>
    <p style={{ color: '#74767e', margin: '20px 0' }}>Trang này hiện đang được phát triển...</p>
    <a href="/" style={{ color: '#1dbf73', fontWeight: 'bold', textDecoration: 'none' }}>
      ← Quay lại Trang chủ
    </a>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Trang đầu tiên xuất hiện khi truy cập link hệ thống */}
        <Route path="/" element={<HomePage />} />
        
        {/* Trang thông tin cá nhân (Profile) nằm trong src/pages/Profile/ */}
        <Route path="/profile" element={<Profile />} />
        
        {/* 2. Các trang Home quản trị theo vai trò hệ thống */}
        <Route path="/buyer-home" element={<BuyerHome />} />
        <Route path="/seller-home" element={<SellerHome />} />
        
        {/* 3. Các tuyến đường xử lý điều hướng Menu Dropdown & Carousel */}
        {/* Categories (Danh mục dịch vụ) */}
        <Route path="/categories/graphics-design" element={<PlaceholderPage title="Graphics & Design" />} />
        <Route path="/categories/programming-tech" element={<PlaceholderPage title="Programming & Tech" />} />
        <Route path="/categories/digital-marketing" element={<PlaceholderPage title="Digital Marketing" />} />
        <Route path="/categories/video-animation" element={<PlaceholderPage title="Video & Animation" />} />
        <Route path="/categories/writing-translation" element={<PlaceholderPage title="Writing & Translation" />} />
        
        {/* Listings (Danh sách hiển thị) */}
        <Route path="/listings/services" element={<PlaceholderPage title="Services Listings" />} />
        <Route path="/listings/projects" element={<PlaceholderPage title="Projects Listings" />} />
        
        {/* Users (Danh sách người dùng) */}
        <Route path="/users/seller" element={<PlaceholderPage title="Seller Directory" />} />
        <Route path="/users/buyer" element={<PlaceholderPage title="Buyer Directory" />} />
        
        {/* Các trang tĩnh phụ trợ */}
        <Route path="/pages" element={<PlaceholderPage title="Static Pages" />} />

        {/* 4. Trang Authentication (Đăng nhập / Đăng ký) */}
        <Route path="/login" element={<AuthPage isLoginDefault={true} />} />
        <Route path="/signup" element={<AuthPage isLoginDefault={false} />} />

        {/* 5. Điều hướng dự phòng: Nếu người dùng gõ sai đường dẫn URL thì tự động quay về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;