import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, Shield, LogOut, ArrowLeft, 
  Camera, Star, Clock, Wallet, ArrowUpRight, ArrowDownLeft, Eye, EyeOff 
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gigs'); // 'gigs' hoặc 'reviews' cho Seller
  const [showBalance, setShowBalance] = useState(false); // Ẩn/hiện số dư ví

  // --- 1. MOCK DATA CHUẨN CẤU TRÚC DATABASE BACKEND ---
  const [profileData, setProfileData] = useState({
    // I. THÀNH PHẦN CHUNG (Bảng users)
    user: {
      fullname: localStorage.getItem('fullname') || 'Phan Trung Kiên',
      username: 'kien_phan2026',
      email: 'phankien.dev@gmail.com',
      phone: '0987654321',
      avatar_url: '', // Để trống để test ảnh mặc định / chữ cái đầu
      created_at: '2026-04-15',
      current_role: localStorage.getItem('role') || 'ROLE_SELLER', // ROLE_BUYER hoặc ROLE_SELLER
      is_online: true
    },
    // II. THÀNH PHẦN SELLER (Bảng sellers)
    seller: {
      bio: 'Tôi là một lập trình viên Fullstack với 3 năm kinh nghiệm phát triển hệ thống bằng ReactJS và Spring Boot. Đảm bảo mã nguồn tối ưu và bàn giao đúng hạn.',
      rating_avg: 4.95,
      total_reviews: 120,
      response_time: '1 giờ'
    },
    // Danh sách Gigs (Bảng gigs + mức giá thấp nhất từ gigpackages)
    gigs: [
      { id: 1, title: 'Tôi sẽ thiết kế giao diện Figma chuyên nghiệp cho Mobile App', thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500', min_price: 50, is_paused: 0 },
      { id: 2, title: 'Tôi sẽ xây dựng RESTful API bằng Spring Boot và MySQL', thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500', min_price: 120, is_paused: 0 },
      { id: 3, title: 'Tôi sẽ tối ưu hóa SEO và tăng tốc độ tải trang React', thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500', min_price: 30, is_paused: 1 }, // Thử nghiệm Gig đang ẩn
    ],
    // Danh sách Đánh giá (Bảng reviews liên kết users)
    reviews: [
      { id: 101, buyer_name: 'Nguyễn Văn A', buyer_avatar: '', rating: 5, comment: 'Sản phẩm hoàn thiện rất tốt, bàn giao đúng hạn và hỗ trợ nhiệt tình!', created_at: '2026-05-10' },
      { id: 102, buyer_name: 'Alex Johnson', buyer_avatar: '', rating: 4.8, comment: 'API viết rất sạch sẽ, có đầy đủ tài liệu đi kèm.', created_at: '2026-05-01' }
    ],
    // III. THÀNH PHẦN BUYER (Bảng wallets & payments)
    wallet: {
      balance: 1550.00 // $1,550.00
    },
    payments: [
      { id: 201, type: 'DEPOSIT', amount: 500, description: 'Nạp tiền qua PayPal', created_at: '2026-05-12' },
      { id: 202, type: 'PAYMENT', amount: 120, description: 'Thanh toán Đơn hàng #68105', created_at: '2026-05-05' }
    ]
  });

  // --- 2. LOGIC ĐỔI TRẠNG THÁI ẨN / HIỆN GIG (Chỉ dành cho chủ sở hữu) ---
  const toggleGigStatus = (gigId) => {
    setProfileData(prevState => ({
      ...prevState,
      gigs: prevState.gigs.map(gig => 
        gig.id === gigId ? { ...gig, is_paused: gig.is_paused === 1 ? 0 : 1 } : gig
      )
    }));
  };

  // --- 3. LOGIC TẢI ẢNH ĐẠI DIỆN MỚI lên ---
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileData(prevState => ({
        ...prevState,
        user: { ...prevState.user, avatar_url: imageUrl }
      }));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const { user, seller, gigs, reviews, wallet, payments } = profileData;
  const isSellerMode = user.current_role === 'ROLE_SELLER';

  return (
    <div className="profile-page-container">
      {/* Nút quay lại */}
      <div className="profile-back-nav" onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> <span>Quay lại Trang chủ</span>
      </div>

      <div className="profile-layout">
        
        {/* ==========================================================================
           I. KHU VỰC BÊN TRÁI: THÀNH PHẦN CHUNG (Chung cho Buyer & Seller)
           ========================================================================== */}
        <div className="profile-sidebar">
          <div className="profile-card-general">
            {/* Ảnh đại diện bo tròn + Nút upload ảnh */}
            <div className="avatar-wrapper">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">{user.fullname.charAt(0).toUpperCase()}</div>
              )}
              <label className="avatar-upload-btn" title="Tải ảnh mới">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </label>
              {/* Chấm xanh online */}
              {user.is_online && <span className="online-badge" title="Đang trực tuyến"></span>}
            </div>

            {/* Tên hiển thị chuyên nghiệp */}
            <h2 className="user-fullname">{user.fullname}</h2>
            <p className="user-username">@{user.username}</p>
            
            {/* Badge Vai trò hiện tại */}
            <span className={`role-tag ${user.current_role.toLowerCase()}`}>
              {isSellerMode ? 'Freelancer / Seller' : 'Client / Buyer'}
            </span>

            <div className="profile-divider"></div>

            {/* Thông tin bảo mật & Ngày tham gia */}
            <div className="user-meta-details">
              <div className="meta-item private-info" title="Thông tin bảo mật chỉ bạn nhìn thấy">
                <Mail size={16} /> <span>{user.email}</span> <span className="lock-label">Private</span>
              </div>
              <div className="meta-item private-info" title="Thông tin bảo mật chỉ bạn nhìn thấy">
                <Phone size={16} /> <span>{user.phone}</span> <span className="lock-label">Private</span>
              </div>
              <div className="meta-item">
                <Calendar size={16} /> 
                <span>Thành viên từ: {new Date(user.created_at).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="profile-divider"></div>
            <button className="btn-logout-profile" onClick={handleLogout}><LogOut size={16} /> Đăng xuất</button>
          </div>

          {/* ==========================================================================
             III. THÀNH PHẦN CHUYÊN BIỆT: VÍ & TÀI CHÍNH (Chỉ dành cho BUYER)
             ========================================================================== */}
          {!isSellerMode && (
            <div className="buyer-wallet-card">
              <div className="wallet-header">
                <div className="wallet-title"><Wallet size={18} /> <span>Số dư tài khoản</span></div>
                <button className="btn-toggle-eye" onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <h2 className="wallet-balance">
                {showBalance ? `$${wallet.balance.toFixed(2)}` : '******'}
              </h2>
            </div>
          )}
        </div>

        {/* ==========================================================================
           II. KHU VỰC BÊN PHẢI: CHI TIẾT THEO VAI TRÒ (SELLER HOẶC BUYER)
           ========================================================================== */}
        <div className="profile-main-content">
          
          {isSellerMode ? (
            /* --- GIAO DIỆN HIỂN THỊ CỦA SELLER --- */
            <>
              {/* 1. Giới thiệu & Uy tín */}
              <div className="seller-about-section">
                <h3>Giới thiệu bản thân</h3>
                <p className="seller-bio">{seller.bio}</p>
                
                <div className="seller-stats-bar">
                  <div className="stat-box">
                    <span className="stat-stars">⭐ {seller.rating_avg}</span>
                    <span className="stat-label">({seller.total_reviews} đánh giá)</span>
                  </div>
                  <div className="stat-box border-left">
                    <Clock size={16} className="text-gray" />
                    <span className="stat-label">Thời gian phản hồi: <b>{seller.response_time}</b></span>
                  </div>
                </div>
              </div>

              {/* Menu Tabs chuyển đổi giữa Danh sách dịch vụ và Đánh giá */}
              <div className="profile-tabs-header">
                <button className={`tab-link ${activeTab === 'gigs' ? 'active' : ''}`} onClick={() => setActiveTab('gigs')}>
                  Dịch vụ đang cung cấp ({gigs.length})
                </button>
                <button className={`tab-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                  Đánh giá từ khách hàng ({reviews.length})
                </button>
              </div>

              {/* 2. Danh sách Gigs dạng Lưới (Grid) */}
              {activeTab === 'gigs' && (
                <div className="gigs-grid-container">
                  {gigs.map((gig) => (
                    <div key={gig.id} className={`gig-profile-card ${gig.is_paused === 1 ? 'gig-paused' : ''}`}>
                      <div className="gig-thumbnail-wrapper" onClick={() => navigate(`/gigs/${gig.id}`)}>
                        <img src={gig.thumbnail_url} alt={gig.title} />
                        {gig.is_paused === 1 && <span className="paused-badge">Đang ẩn</span>}
                      </div>
                      <div className="gig-card-body">
                        <p className="gig-title" onClick={() => navigate(`/gigs/${gig.id}`)}>{gig.title}</p>
                        <div className="gig-card-footer">
                          {/* Nút bật/tắt trạng thái ẩn/hiện nếu là chính chủ */}
                          <button className={`btn-status-toggle ${gig.is_paused === 1 ? 'paused' : 'active'}`} onClick={() => toggleGigStatus(gig.id)}>
                            {gig.is_paused === 1 ? 'Bật hiển thị' : 'Tạm ẩn'}
                          </button>
                          <div className="gig-price">
                            <span className="price-lbl">Khởi điểm</span>
                            <span className="price-val">${gig.min_price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. Khu vực Đánh giá khách hàng (Reviews) */}
              {activeTab === 'reviews' && (
                <div className="reviews-list-container">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="review-item-row">
                      <div className="review-buyer-avatar">
                        {rev.buyer_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="review-main-body">
                        <div className="review-row-header">
                          <h4>{rev.buyer_name}</h4>
                          <span className="review-date">{new Date(rev.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="review-stars-score">
                          {Array.from({ length: Math.floor(rev.rating) }).map((_, i) => <span key={i}>⭐</span>)}
                          <span className="score-num">{rev.rating}</span>
                        </div>
                        <p className="review-comment-text">{rev.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* --- GIAO DIỆN HIỂN THỊ LỊCH SỬ GIAO DỊCH CỦA BUYER --- */
            <div className="buyer-history-section">
              <h3>Lịch sử giao dịch gần đây</h3>
              <div className="payment-table-wrapper">
                {payments.map((pay) => (
                  <div key={pay.id} className="payment-row-item">
                    <div className="payment-left-side">
                      <div className={`payment-icon-bg ${pay.type.toLowerCase()}`}>
                        {pay.type === 'DEPOSIT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div className="payment-details">
                        <p className="pay-desc">{pay.description}</p>
                        <span className="pay-date">{new Date(pay.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className={`payment-amount ${pay.type.toLowerCase()}`}>
                      {pay.type === 'DEPOSIT' ? '+' : '-'}${pay.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;