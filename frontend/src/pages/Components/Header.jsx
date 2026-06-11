// src/components/Header/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Globe, Mail, Bell, User, ChevronDown, ChevronLeft, ChevronRight, LogOut, PlusCircle, ShoppingBag } from 'lucide-react'; 
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
                const response = await axios.get('http://localhost:8080/api/v1/categories');
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
                    <h1 className="logo" onClick={() => navigate('/')}>vance<span>.</span></h1>
                </div>
                <nav className="header-right">

                    <div className="nav-item-dropdown">
                        <span className="nav-link">Categories <ChevronDown size={14} /></span>
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

                    <div className="nav-item-dropdown">
                        <span className="nav-link">Listings <ChevronDown size={14} /></span>
                        <div className="dropdown-content">
                            <span onClick={() => navigate('/listings/services')}>Services</span>
                            <span onClick={() => navigate('/listings/projects')}>Projects</span>
                        </div>
                    </div>

                    <div className="nav-item-dropdown">
                        <span className="nav-link">Users <ChevronDown size={14} /></span>
                        <div className="dropdown-content">
                            <span onClick={() => navigate('/users/seller')}>Seller</span>
                            <span onClick={() => navigate('/users/buyer')}>Buyer</span>
                        </div>
                    </div>

                    <span className="nav-link" onClick={() => navigate('/pages')}>Pages</span>
                    <span className="nav-link"><Globe size={16} /> English</span>

                    {role ? (
                        <div className="auth-nav">
                            <Mail size={20} className="nav-icon" style={{ cursor: 'pointer', color: '#74767e' }} />
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
                                            <User size={14} /> My Profile
                                        </div>

                                        {/* 🌟 THÊM MỚI: Hiển thị My Orders dành riêng cho tài khoản BUYER */}
                                        {role && (role.toUpperCase() === 'ROLE_BUYER' || role.toUpperCase() === 'BUYER') && (
                                            <div 
                                                className="avatar-dropdown-item"
                                                onClick={() => { navigate('/my-orders'); setShowUserDropdown(false); }}
                                                style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#1dbf73', fontSize: '14px', fontWeight: '500', borderTop: '1px solid #f1f1f1' }}
                                            >
                                                <ShoppingBag size={14} /> My Orders
                                            </div>
                                        )}

                                        {/* Chuyển đổi tên sang Manage Services phù hợp với vai trò Seller */}
                                        {role && (role.toUpperCase() === 'ROLE_SELLER' || role.toLowerCase() === 'seller') && (
                                            <div 
                                                className="avatar-dropdown-item"
                                                onClick={() => { navigate('/manage-services'); setShowUserDropdown(false); }}
                                                style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#1dbf73', fontSize: '14px', fontWeight: '500', borderTop: '1px solid #f1f1f1' }}
                                            >
                                                <PlusCircle size={14} /> Manage Services
                                            </div>
                                        )}

                                        <div 
                                            className="avatar-dropdown-item logout-action"
                                            onClick={handleLogout}
                                            style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#f44336', fontSize: '14px', borderTop: '1px solid #f1f1f1' }}
                                        >
                                            <LogOut size={14} /> Logout
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="guest-nav">
                            <span className="btn-signin" onClick={() => navigate('/login')}>Sign In</span>
                        </div>
                    )}
                </nav>
            </div>

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
                    {/* Nút mũi tên PHẢI */}
                    <button className="scroll-arrow-btn right" onClick={() => handleScroll('right')}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;