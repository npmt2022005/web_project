// src/layouts/AdminLayout.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, Folder, LogOut, Home, ShieldAlert } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation(); // 👑 BỔ SUNG: Lấy thông tin đường dẫn URL hiện tại để xử lý trạng thái active cho menu

  const handleLogout = () => {
    // Xử lý xóa token đăng nhập ở đây
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="admin-layout-container">
      {/* 1. Sidebar bên trái */}
      <aside className="admin-sidebar">
        <div className="admin-logo-section">
          <ShieldAlert size={28} className="logo-icon" />
          <span className="logo-text">MARKET ADMIN</span>
        </div>

        <nav className="admin-menu">
          <div className="menu-group-title">Hệ thống</div>
          
          {/* 🛠️ CẬP NHẬT: Tự động kích hoạt class active linh hoạt dựa trên URL, không cố định cứng vào một mục */}
          <Link 
            to="/admin/users" 
            className={`admin-menu-item ${location.pathname === '/admin/users' ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Quản lý người dùng</span>
          </Link>
          
          <Link 
            to="/admin/categories" 
            className={`admin-menu-item ${location.pathname === '/admin/categories' ? 'active' : ''}`}
          >
            <Folder size={18} />
            <span>Quản lý Danh mục</span>
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-menu-item back-home">
            <Home size={18} />
            <span>Trang chủ Web</span>
          </Link>
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* 2. Vùng nội dung bên phải */}
      <main className="admin-main-content">
        <header className="admin-top-header">
          <h2>Bảng điều khiển quản trị</h2>
          <div className="admin-profile-summary">
            <span className="admin-name">Xin chào, Thục Kiên</span>
            <div className="admin-avatar-mini">A</div>
          </div>
        </header>
        <div className="admin-page-body">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;