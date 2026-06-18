// src/App.jsx
import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/Auth/AuthPage';
import HomePage from './pages/HomePage'; // Import trang chủ chung
import MyProfile from './pages/Profile/MyProfile'; // 🌟 Đã cập nhật import sang file MyProfile mới
import GigsPage from './pages/Gigs/GigsPage';
import Header from './pages/Components/Header';

// 🌟 TÍCH HỢP IMPORT TRANG KHÁM PHÁ DANH SÁCH SELLER MỚI
import SellerExploration from './pages/Marketplace/SellerExploration';

// 🆕 TÍCH HỢP ĐƯỜNG DẪN ĐẾN TRANG CHI TIẾT PROFILE SELLER MỚI TẠO
import SellerDetail from './pages/Marketplace/SellerDetail';

// 1. Tích hợp Import trang chi tiết bài đăng dịch vụ vào đây
import GigDetailPage from './pages/Gigs/GigDetailPage';

// 🟢 TÍCH HỢP IMPORT TRANG TẠO BÀI ĐĂNG DỊCH VỤ (CHẾ ĐỘ TEST GIAO DIỆN)
import CreateGigPage from './pages/Gigs/CreateGigPage';

// 🔵 TÍCH HỢP IMPORT TRANG THANH TOÁN / XÁC NHẬN ĐƠN HÀNG (CHECKOUT PAGE)
import CheckoutPage from './pages/Orders/CheckoutPage';

// 🌟 TÍCH HỢP IMPORT TRANG QUẢN LÝ DỊCH VỤ CỦA SELLER (MANAGE SERVICES)
import ManageServices from './pages/Services/ManageServices';

// 🆕 THÊM MỚI: Tích hợp trang quản lý đơn hàng dành riêng cho Seller mới tạo
import ManageSellerOrders from './pages/Orders/ManageSellerOrders';

// 🆕 THÊM MỚI: Tích hợp trang danh sách đơn hàng của người mua (My Orders)
import MyOrders from './pages/Orders/MyOrders';

// 🆕 THÊM MỚI: Tích hợp trang chi tiết đơn hàng / Phòng làm việc (Order Detail / Workspace)
import OrderDetailPage from './pages/Orders/OrderDetailPage';

// 🆕 THÊM MỚI: Tích hợp trang nộp yêu cầu đơn hàng vừa tạo
import OrderRequirementPage from './pages/Orders/OrderRequirementPage';

// 💬 TÍCH HỢP ĐƯỜNG DẪN TRANG CHAT HỘI THOẠI MỚI
import ChatPage from './pages/Chat/ChatPage';

// 👑 TÍCH HỢP CÁC THÀNH PHẦN TRANG ADMIN MỚI TỪ THƯ MỤC GOM CHUNG TRONG PAGES
import AdminLayout from './pages/admin/AdminLayout';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminCategoryManagement from './pages/admin/AdminCategoryManagement'; // 👑 BỔ SUNG: Import trang quản lý danh mục thực tế

// 🛡️ TÍCH HỢP THÀNH PHẦN BẢO VỆ TUYẾN ĐƯỜNG ADMIN (ROUTE GUARD)
import ProtectedRoute from './pages/admin/ProtectedRoute';

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

  // Kiểm tra xem trang hiện tại có thuộc danh sách cần ẩn hay bắt đầu bằng /admin không
  const shouldHideHeader = hideHeaderPaths.includes(location.pathname) || location.pathname.startsWith('/admin');

  return (
    <>
      {/* Nếu KHÔNG phải trang đăng nhập/đăng ký/admin thì mới hiển thị Header */}
      {!shouldHideHeader && <Header />}

      <Routes>
        /* 1. Trang đầu tiên xuất hiện khi truy cập link hệ thống */
        <Route path="/" element={<HomePage />} />
        
        {/* 🌟 ĐIỀU HƯỚNG PROFILE: Cấu hình gọi component MyProfile khi vào tuyến đường /profile */}
        <Route path="/profile" element={<MyProfile />} />

        {/* Giữ lại Route động xem Profile người khác của bạn */}
        <Route path="/profile/:username" element={<MyProfile />} /> 

        {/* 🆕 ROUTE ĐIỀU HƯỚNG CHI TIẾT SELLER THEO ID */}
        <Route path="/seller/:id" element={<SellerDetail />} />

        {/* Giữ lại Route Tìm kiếm từ code trên GitHub về */}
        <Route path="/search" element={<GigsPage />} />

        {/* 2. Tích hợp cấu hình Route động cho trang xem chi tiết thông tin bài đăng */}
        <Route path="/gigs/:id" element={<GigDetailPage />} />

        {/* 🟢 ROUTE DẪN ĐẾN TRANG TẠO BÀI ĐĂNG DỊCH VỤ MỚI */}
        <Route path="/create-gig" element={<CreateGigPage />} />
        
        {/* 🌟 ROUTE ĐÃ SỬA: Trả lại đúng trang Quản lý dịch vụ gốc (ManageServices) */}
        <Route path="/manage-services" element={<ManageServices />} />

        {/* 🆕 ROUTE THÊM MỚI: Tuyến đường chính thức dẫn đến trang Quản lý đơn hàng của Seller */}
        <Route path="/manage-orders" element={<ManageSellerOrders />} />
        
        {/* 🆕 ROUTE MỚI: Tuyến đường dẫn đến danh sách đơn hàng mua của Buyer */}
        <Route path="/my-orders" element={<MyOrders />} />

        {/* 🆕 ROUTE MỚI: Không gian phòng làm việc chi tiết của đơn hàng (Dùng chung Buyer & Seller) */}
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />

        {/* 🆕 ROUTE MỚI: Tuyến đường cung cấp đề bài / yêu cầu sau khi thanh toán thành công */}
        <Route path="/orders/:orderId/requirements" element={<OrderRequirementPage />} />

        {/* 🔵 TÍCH HỢP ROUTE DẪN ĐẾN TRANG THANH TOÁN XÁC NHẬN ĐƠN HÀNG THỰC TẾ */}
        <Route path="/checkout/:orderId" element={<CheckoutPage />} />

        {/* 💬 ROUTE MỚI: Tuyến đường chính thức truy cập vào trang nhắn tin (Chat Workspace) */}
        <Route path="/chat" element={<ChatPage />} />

        {/* 👑 ROUTE ADMIN MỚI: Đã tạm thời bỏ ProtectedRoute để test giao diện trực tiếp */}
        <Route 
          path="/admin/users" 
          element={
            <AdminLayout>
              <AdminUserManagement />
            </AdminLayout>
          } 
        />

        {/* 🛠️ CẬP NHẬT: Đã tạm thời bỏ ProtectedRoute để test giao diện trực tiếp */}
        <Route 
          path="/admin/categories" 
          element={
            <AdminLayout>
              <AdminCategoryManagement />
            </AdminLayout>
          } 
        />
        
        {/* 3. Các tuyến đường xử lý điều hiện Menu Dropdown & Carousel */}
        /* Categories (Danh mục dịch vụ) */
        <Route path="/categories/graphics-design" element={<PlaceholderPage title="Graphics & Design" />} />
        <Route path="/categories/programming-tech" element={<PlaceholderPage title="Programming & Tech" />} />
        <Route path="/categories/digital-marketing" element={<PlaceholderPage title="Digital Marketing" />} />
        <Route path="/categories/video-animation" element={<PlaceholderPage title="Video & Animation" />} />
        <Route path="/categories/writing-translation" element={<PlaceholderPage title="Writing & Translation" />} />
        
        {/* Users (Danh sách người dùng) - 🌟 ĐÃ CẬP NHẬT TRANG KHÁM PHÁ SELLER CHÍNH THỨC VÀO ĐÂY */}
        <Route path="/users/seller" element={<SellerExploration />} />
        
        {/* 4. Trang Authentication (Đăng nhập / Đăng ký) */}
        <Route path="/login" element={<AuthPage isLoginDefault={true} />} />
        <Route path="/signup" element={<AuthPage isLoginDefault={false} />} />

        {/* 5. Điều hướng dự phòng: Nếu người dùng gõ sai đường dẫn URL thì tự động quay về trang chủ */}
        <Route path="/*" element={<Navigate to="/" replace />} />
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