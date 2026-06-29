// src/components/Header/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../../services/apiClient';
import { Globe, Mail, Bell, User, ChevronDown, ChevronLeft, ChevronRight, LogOut, PlusCircle, ShoppingBag, MessageSquare, ShieldAlert } from 'lucide-react';
import './Header.css'

const Header = () => {
    const navigate = useNavigate();

    // Trạng thái đăng nhập có sẵn
    const [role, setRole] = useState(null);
    const [fullname, setFullname] = useState('');

    // Trạng thái danh mục cho thanh Menu có sẵn
    const [categories, setCategories] = useState([]);

    // 🟢 Trạng thái điều khiển đóng/mở Dropdown khi bấm vào Avatar người dùng
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const scrollRef = useRef(null);
    const handleScroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // 🟢 Hàm xử lý Đăng xuất nhanh cho người dùng
    const handleLogout = () => {
        localStorage.clear(); // Xóa sạch trạng thái phiên làm việc cũ
        setRole(null);
        setFullname('');
        setShowUserDropdown(false);
        navigate('/login');
    };

    useEffect(() => {
        // 1. Kiểm tra trạng thái đăng nhập từ localStorage
        const storedRole = localStorage.getItem('role');
        const storedFullname = localStorage.getItem('fullname');
        if (storedRole) {
            setRole(storedRole);
            setFullname(storedFullname || '');
        }

        // 2. Gọi API lấy danh sách danh mục
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/v1/categories');
                if (response.data && response.data.status === 'success') {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi kết nối API lấy danh sách danh mục (Header):", error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <header className="main-header">
            <div className="container header-flex">
                <div className="header-left">
                    {/* 🌟 FIX LỖI LOGO: Thêm style color cố định để chữ vance luôn hiển thị rõ ràng không bị mất màu */}
                    <h1 className="logo" onClick={() => navigate('/')} style={{ color: '#1a1b1e', fontWeight: 800 }}>
                        vance<span style={{ color: '#1dbf73' }}>.</span>
                    </h1>
                </div>
                <nav className="header-right">

                    {/* Danh mục Dropdown */}
                    <div className="nav-item-dropdown">
                        <span className="nav-link">Danh mục <ChevronDown size={14} /></span>
                        <div className="dropdown-content categories-dropdown-wrapper">
                            {categories.length > 0 ? (
                                <ul className="categories-dropdown-menu">
                                    {categories.map((parent) => (
                                        <li key={parent.slug || parent.id} className="menu-item-parent">
                                            <span
                                                className="parent-link"
                                                onClick={() => navigate(`/search?category=${parent.slug}`)}
                                            >
                                                {parent.name}
                                            </span>

                                            {/* Danh mục con (Hiển thị trượt ngang) */}
                                            {parent.subCategories && parent.subCategories.length > 0 && (
                                                <ul className="sub-menu-flyout">
                                                    {parent.subCategories.map((child) => (
                                                        <li
                                                            key={child.slug || child.id}
                                                            className="menu-item-child"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Ngăn click nhầm vào cha
                                                                console.log(">>> Đã click vào danh mục con:", child.slug);
                                                                navigate(`/search?category=${child.slug}`);
                                                            }}
                                                        >
                                                            {child.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                // Fallback khi chưa tải được API
                                <>
                                    <span onClick={() => navigate('/gigs?category=graphics-design')}>Graphics & Design</span>
                                    <span onClick={() => navigate('/gigs?category=programming-tech')}>Programming & Tech</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Người dùng Dropdown (Đã loại bỏ lựa chọn buyer) */}
                    <div className="nav-item-dropdown">
                        <span className="nav-link">Người dùng <ChevronDown size={14} /></span>
                        <div className="dropdown-content">
                            <span onClick={() => navigate('/users/seller')}>Người bán</span>
                        </div>
                    </div>

                    {/* 👑 NÚT CHUYỂN NHANH QUA TRANG ADMIN TRÊN NAVBAR (DÀNH RIÊNG CHO ADMIN) */}
                    {role && (role.toUpperCase() === 'ROLE_ADMIN' || role.toUpperCase() === 'ADMIN') && (
                        <span
                            className="nav-link admin-nav-shortcut"
                            onClick={() => navigate('/admin/users')}
                            style={{ color: '#f44336', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <ShieldAlert size={14} /> Quản trị Admin
                        </span>
                    )}

                    {/* 🟢 TÍCH HỢP THÊM: Mục "Trở thành người bán" dành riêng cho BUYER */}
                    <span
                        className="nav-link become-seller-nav-btn"
                        onClick={async () => {
                            try {
                                const resp = await apiClient.get('/v1/profile/me');
                                const result = resp.data;
                                if (result?.status !== 'success' || !result.data) {
                                    alert('Bạn chưa cập nhật hồ sơ. Vui lòng hoàn tất thông tin hồ sơ trước khi trở thành người bán.');
                                    navigate('/profile');
                                    return;
                                }

                                const profile = result.data;
                                const missingFields = [];
                                const info = profile.basicInfo || {};

                                if (!info.phone || info.phone.trim() === "") missingFields.push('Số điện thoại');
                                if (!info.city || info.city.trim() === "") missingFields.push('Thành phố');
                                if (!info.description || info.description.trim() === "") missingFields.push('Giới thiệu bản thân');
                                if (!profile.education || profile.education.length === 0) missingFields.push('Học vấn');
                                if (!profile.experience || profile.experience.length === 0) missingFields.push('Kinh nghiệm làm việc');

                                if (missingFields.length > 0) {
                                    const message = 'Bạn cần hoàn thành các thông tin sau trước khi trở thành người bán:\n- ' + missingFields.join('\n- ');
                                    alert(message);
                                    navigate('/profile');
                                    return;
                                }

                                // 🌟 ĐÃ SỬA: Đủ thông tin -> chuyển sang khu vực xác nhận Seller riêng,
                                // KHÔNG dùng chung trang /profile như cũ (vì đó là trang buyer, không đủ ý nghĩa "trở thành seller")
                                navigate('/profile/become-seller');
                            } catch (error) {
                                console.error('Lỗi khi kiểm tra hồ sơ:', error);
                                alert('Không thể kiểm tra hồ sơ. Vui lòng thử lại sau.');
                            }
                        }}
                        style={{ color: '#1dbf73', fontWeight: '600', cursor: 'pointer' }}
                    >
                        Trở thành người bán
                    </span>

                    <span className="nav-link"><Globe size={16} /> Tiếng Việt</span>

                    {role ? (
                        <div className="auth-nav">
                            <Mail size={20} className="nav-icon" style={{ cursor: 'pointer', color: '#74767e' }} onClick={() => navigate('/chat')} />
                            <Bell size={20} className="nav-icon" style={{ cursor: 'pointer', color: '#74767e' }} />

                            {/* KHU VỰC AVATAR ĐỂ THẢ MENU DOWN */}
                            <div style={{ position: 'relative' }}>
                                <div
                                    className="user-avatar"
                                    onClick={() => setShowUserDropdown(!showUserDropdown)} // Thay đổi trạng thái ẩn/hiện khi click
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {fullname ? fullname[0].toUpperCase() : <User size={16} />}
                                </div>

                                {/* Khối Menu Dropdown xuất hiện khi showUserDropdown === true */}
                                {showUserDropdown && (
                                    <div className="avatar-dropdown-box" style={{
                                        position: 'absolute', right: 0, top: '45px', backgroundColor: '#fff',
                                        border: '1px solid #e4e5e7', borderRadius: '4px', width: '170px', zIndex: 999,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '6px 0'
                                    }}>
                                        {/* Mục Profile chung cho tất cả user */}
                                        <div
                                            className="avatar-dropdown-item"
                                            onClick={() => { navigate('/profile'); setShowUserDropdown(false); }}
                                            style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#333', fontSize: '14px' }}
                                        >
                                            <User size={14} /> Hồ sơ của tôi
                                        </div>

                                        {/* 💬 MỤC TIN NHẮN CHUNG CHO CẢ BUYER VÀ SELLER */}
                                        <div
                                            className="avatar-dropdown-item"
                                            onClick={() => { navigate('/chat'); setShowUserDropdown(false); }}
                                            style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#333', fontSize: '14px', borderTop: '1px solid #f1f1f1' }}
                                        >
                                            <MessageSquare size={14} /> Tin nhắn
                                        </div>

                                        {/* Hiển thị Đơn hàng của tôi dành riêng cho tài khoản BUYER */}
                                        {role && (role.toUpperCase() === 'ROLE_BUYER' || role.toUpperCase() === 'BUYER') && (
                                            <div
                                                className="avatar-dropdown-item"
                                                onClick={() => { navigate('/my-orders'); setShowUserDropdown(false); }}
                                                style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#1dbf73', fontSize: '14px', fontWeight: '500', borderTop: '1px solid #f1f1f1' }}
                                            >
                                                <ShoppingBag size={14} /> Đơn mua của tôi
                                            </div>
                                        )}

                                        {/* Phù hợp với vai trò Seller */}
                                        {role && (role.toUpperCase() === 'ROLE_SELLER' || role.toLowerCase() === 'seller') && (
                                            <>
                                                {/* ➕ BỔ SUNG: Cho phép Seller quản lý và theo dõi các đơn dịch vụ mà chính mình đi đặt mua */}
                                                <div
                                                    className="avatar-dropdown-item"
                                                    onClick={() => { navigate('/my-orders'); setShowUserDropdown(false); }}
                                                    style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#1dbf73', fontSize: '14px', fontWeight: '500', borderTop: '1px solid #f1f1f1' }}
                                                >
                                                    <ShoppingBag size={14} /> Đơn mua của tôi
                                                </div>

                                                <div
                                                    className="avatar-dropdown-item"
                                                    onClick={() => { navigate('/manage-services'); setShowUserDropdown(false); }}
                                                    style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#1dbf73', fontSize: '14px', fontWeight: '500', borderTop: '1px solid #f1f1f1' }}
                                                >
                                                    <PlusCircle size={14} /> Quản lý dịch vụ
                                                </div>

                                                <div
                                                    className="avatar-dropdown-item"
                                                    onClick={() => { navigate('/manage-orders'); setShowUserDropdown(false); }}
                                                    style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#1dbf73', fontSize: '14px', fontWeight: '500', borderTop: '1px solid #f1f1f1' }}
                                                >
                                                    <ShoppingBag size={14} /> Quản lý đơn hàng
                                                </div>
                                            </>
                                        )}

                                        {/* 👑 LỰA CHỌN TRANG ADMIN TRONG AVATAR DROPDOWN (DÀNH RIÊNG CHO ADMIN) */}
                                        {role && (role.toUpperCase() === 'ROLE_ADMIN' || role.toUpperCase() === 'ADMIN') && (
                                            <div
                                                className="avatar-dropdown-item admin-action"
                                                onClick={() => { navigate('/admin/users'); setShowUserDropdown(false); }}
                                                style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#f44336', fontSize: '14px', fontWeight: '600', borderTop: '1px solid #f1f1f1' }}
                                            >
                                                <ShieldAlert size={14} /> Hệ thống Admin
                                            </div>
                                        )}

                                        <div
                                            className="avatar-dropdown-item logout-action"
                                            onClick={handleLogout}
                                            style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#f44336', fontSize: '14px', borderTop: '1px solid #f1f1f1' }}
                                        >
                                            <LogOut size={14} /> Đăng xuất
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="guest-nav">
                            <span className="btn-signin" onClick={() => navigate('/login')}>Đăng nhập</span>
                        </div>
                    )}
                </nav>
            </div>

            {/* Thanh menu phụ danh mục trượt ngang phía dưới */}
            <div className="category-menu hide-mobile">
                <div className="menu-scroll-container">
                    <button className="scroll-arrow-btn left" onClick={() => handleScroll('left')}>
                        <ChevronLeft size={18} />
                    </button>
                    <ul className="horizontal-category-list" ref={scrollRef}>
                        {categories.map((parent) => (
                            <li key={parent.id || parent.slug} className="horizontal-menu-item">

                                <span
                                    className="horizontal-parent-link"
                                    onClick={() => navigate(`/search?category=${parent.slug}`)}
                                >
                                    {parent.name}
                                </span>

                                {/* Danh mục con (Sẽ xổ thẳng xuống dưới khi hover) */}
                                {parent.subCategories && parent.subCategories.length > 0 && (
                                    <ul className="horizontal-sub-menu">
                                        {parent.subCategories.map((child) => (
                                            <li
                                                key={child.id || child.slug}
                                                className="horizontal-child-link"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Ngăn click nhầm vào cha
                                                    navigate(`/search?category=${child.slug}`);
                                                }}
                                            >
                                                {child.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                            </li>
                        ))}
                    </ul>
                    <button className="scroll-arrow-btn right" onClick={() => handleScroll('right')}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;