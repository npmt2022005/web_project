import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth/AuthPage';
import HomePage from './pages/HomePage'; // Import trang chủ chung
import BuyerHome from './pages/Marketplace/BuyerHome';   // Import trang Buyer
import SellerHome from './pages/Dashboard/SellerHome'; // Import trang Seller

// Giả định bạn sẽ tạo hoặc đã có cấu phần Profile/Categories (hoặc dùng tạm cấu phần hiện tại để test)
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '100px text-align: "center"' }}>
    <h2>{title} Page</h2>
    <a href="/">Quay lại Trang chủ</a>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Trang đầu tiên xuất hiện khi truy cập link */}
        <Route path="/" element={<HomePage />} />
        
        {/* Trang thông tin cá nhân khi click vào Avatar */}
        <Route path="/profile" element={<PlaceholderPage title="User Profile" />} />
        
        {/* 2. Các trang Home theo vai trò */}
        <Route path="/buyer-home" element={<BuyerHome />} />
        <Route path="/seller-home" element={<SellerHome />} />
        
        {/* 3. Các tuyến đường xử lý Menu Dropdown (Categories, Listings, Users) */}
        <Route path="/categories/graphics-design" element={<PlaceholderPage title="Graphics & Design" />} />
        <Route path="/categories/programming-tech" element={<PlaceholderPage title="Programming & Tech" />} />
        <Route path="/categories/digital-marketing" element={<PlaceholderPage title="Digital Marketing" />} />
        <Route path="/categories/video-animation" element={<PlaceholderPage title="Video & Animation" />} />
        <Route path="/categories/writing-translation" element={<PlaceholderPage title="Writing & Translation" />} />
        
        <Route path="/listings/services" element={<PlaceholderPage title="Services Listings" />} />
        <Route path="/listings/projects" element={<PlaceholderPage title="Projects Listings" />} />
        
        <Route path="/users/seller" element={<PlaceholderPage title="Seller Directory" />} />
        <Route path="/users/buyer" element={<PlaceholderPage title="Buyer Directory" />} />
        
        <Route path="/pages" element={<PlaceholderPage title="Static Pages" />} />

        {/* 4. Trang Đăng nhập / Đăng ký */}
        <Route path="/login" element={<AuthPage isLoginDefault={true} />} />
        <Route path="/signup" element={<AuthPage isLoginDefault={false} />} />

        {/* 5. Điều hướng dự phòng: Nếu gõ sai URL thì về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;