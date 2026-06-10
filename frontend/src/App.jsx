import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/Auth/AuthPage';
import HomePage from './pages/HomePage'; // Import trang chủ chung
import BuyerHome from './pages/Marketplace/BuyerHome';   // Import trang Buyer
import SellerHome from './pages/Dashboard/SellerHome'; // Import trang Seller
import MyProfile from './pages/Profile/MyProfile'; // 🌟 Đã cập nhật import sang file MyProfile mới
import GigsPage from './pages/Gigs/GigsPage';
import Header from './pages/Components/Header';

// 1. Tích hợp Import trang chi tiết bài đăng dịch vụ vào đây
import GigDetailPage from './pages/Gigs/GigDetailPage';

// 🟢 TÍCH HỢP IMPORT TRANG TẠO BÀI ĐĂNG DỊCH VỤ (CHẾ ĐỘ TEST GIAO DIỆN)
import CreateGigPage  from './pages/Gigs/CreateGigPage';

// 🔵 TÍCH HỢP IMPORT TRANG THANH TOÁN / XÁC NHẬN ĐƠN HÀNG (CHECKOUT PAGE)
import CheckoutPage from './pages/Orders/CheckoutPage';

// 🌟 TÍCH HỢP IMPORT TRANG QUẢN LÝ DỊCH VỤ CỦA SELLER (MANAGE SERVICES)
import ManageServices from './pages/Services/ManageServices';

// Component giữ chỗ tạm thời cho các trang danh mục chưa phát triển xong
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '100px', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <h2>{title} Page</h2>
    <p style={{ color: '#74767e', margin: '20px 0' }}>Trang này hiện đang được phát triển...</p>
    <a href="/" style={{ color: '#1dbf73', fontWeight: 'bold', textDecoration: 'none' }}>
      &larr; Quay lại Trang chủ
    </a>
  </div>
);

// Thành phần phụ trợ xử lý ẩn/hiện Header động dựa theo URL hiện tại
const AppContent = () => {
  const location = useLocation();

  // Danh sách các đường dẫn (URL) mà bạn muốn ẨN thanh Header đi
  const hideHeaderPaths = ['/login', '/signup'];

  // Kiểm tra xem trang hiện tại có thuộc danh sách cần ẩn hay không
  const shouldHideHeader = hideHeaderPaths.includes(location.pathname);

  return (
    <>
      {/* Nếu KHÔNG phải trang đăng nhập/đăng ký thì mới hiển thị Header */}
      {!shouldHideHeader && <Header />}

      <Routes>
        {/* 1. Trang đầu tiên xuất hiện khi truy cập link hệ thống */}
        <Route path="/" element={<HomePage />} />
        
         {/* Trang thông tin cá nhân (Profile của chính mình) - Đã sửa từ Profile sang MyProfile */}
        <Route path="/profile" element={<MyProfile />} />

        {/* Giữ lại Route động xem Profile người khác của bạn */}
        <Route path="/profile/:username" element={<MyProfile />} /> 

        {/* Giữ lại Route Tìm kiếm từ code trên GitHub về */}
        <Route path="/search" element={<GigsPage />} />

        {/* 2. Tích hợp cấu hình Route động cho trang xem chi tiết thông tin bài đăng */}
        <Route path="/gigs/:id" element={<GigDetailPage />} />

        {/* 🟢 ROUTE DẪN ĐẾN TRANG TẠO BÀI ĐĂNG DỊCH VỤ MỚI */}
        <Route path="/create-gig" element={<CreateGigPage />} />
        
        {/* 🔵 TÍCH HỢP ROUTE DẪN ĐẾN TRANG THANH TOÁN XÁC NHẬN ĐƠN HÀNG THỰC TẾ */}
        <Route path="/checkout/:orderId" element={<CheckoutPage />} />
        
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
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;