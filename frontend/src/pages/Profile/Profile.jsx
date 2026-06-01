import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  User, Mail, Phone, Calendar, Shield, LogOut, ArrowLeft, 
  Camera, Star, Clock, Wallet, ArrowUpRight, ArrowDownLeft, Eye, EyeOff 
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { username: urlUsername } = useParams(); // Lấy username từ URL động (VD: /profile/phan_kien)
  
  // --- KIỂM TRA ĐĂNG NHẬP VÀ CHỦ SỞ HỮU TÀI KHOẢN ---
  const token = localStorage.getItem('token'); 
  const loggedInUsername = localStorage.getItem('username') || ''; 
  
  // Xác định đối tượng cần lấy dữ liệu (Ưu tiên URL, nếu không có URL thì chính là người đang đăng nhập)
  const targetUsername = urlUsername || loggedInUsername;

  // Nếu không truyền username trên URL, hoặc username trên URL khớp với tài khoản đang đăng nhập -> là chính chủ
  const isOwner = !urlUsername || urlUsername === loggedInUsername; 

  const [activeTab, setActiveTab] = useState('gigs'); 
  const [showBalance, setShowBalance] = useState(false); 
  const [loading, setLoading] = useState(true);

  // --- TRẠNG THÁI DỮ LIỆU THỰC TẾ ---
  const [profileData, setProfileData] = useState({
    user: null,
    seller: null,
    gigs: [],
    reviews: [],
    wallet: { balance: 0 },
    payments: []
  });

  // --- GỌI API LẤY DỮ LIỆU KHI TẢI TRANG ---
  useEffect(() => {
    // CHUẨN HÓA BẢO MẬT: Chỉ đẩy sang login nếu không có token VÀ hệ thống không xác định được xem profile của ai
    if (!token && !targetUsername) {
      console.error("Không tìm thấy Token hoặc Username, chuyển hướng về Login...");
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Cấu hình Header Token gửi kèm lên Spring Boot để xác thực người dùng
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        // Gọi API lấy thông tin Profile dựa trên targetUsername đã chuẩn hóa
        const response = await axios.get(`http://localhost:8080/api/users/${targetUsername}/profile`, config);
        
        if (response.data && response.data.status === 'success') {
          const data = response.data.data;
          
          setProfileData({
            user: data.user,
            seller: data.seller || null,
            gigs: data.gigs || [],
            reviews: data.reviews || [],
            wallet: data.wallet || { balance: 0 },
            payments: data.payments || []
          });

          // Cập nhật lại username vào localStorage nếu xem chính mình mà bộ nhớ tạm chưa có
          if (data.user && data.user.username && !urlUsername) {
            localStorage.setItem('username', data.user.username);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Profile từ API:", error);
        // Nếu API báo lỗi 401 hoặc 403 (Token hết hạn / Không hợp lệ) khi xem trang cá nhân, đẩy đi login
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUsername, token, navigate]); // Chạy lại khi targetUsername thay đổi

  // --- LOGIC BẬT / TẮT TRẠNG THÁI GIG (Cập nhật xuống DB) ---
  const toggleGigStatus = async (gigId, currentStatus) => {
    if (!isOwner) return;
    
    const nextStatus = currentStatus === 1 ? 0 : 1; 
    
    try {
      const res = await axios.put(
        `http://localhost:8080/api/gigs/${gigId}/status`, 
        { is_paused: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === 'success') {
        setProfileData(prevState => ({
          ...prevState,
          gigs: prevState.gigs.map(gig => 
            gig.id === gigId ? { ...gig, is_paused: nextStatus } : gig
          )
        }));
      }
    } catch (error) {
      alert("Không thể cập nhật trạng thái dịch vụ. Vui lòng thử lại!");
    }
  };

  // --- LOGIC TẢI ẢNH ĐẠI DIỆN LÊN SERVER / DATABASE ---
  const handleAvatarChange = async (e) => {
    if (!isOwner) return;
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await axios.post(
        'http://localhost:8080/api/users/upload-avatar', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.status === 'success') {
        const updatedAvatarUrl = res.data.data.avatar_url;
        setProfileData(prevState => ({
          ...prevState,
          user: { ...prevState.user, avatar_url: updatedAvatarUrl }
        }));
        localStorage.setItem('avatar_url', updatedAvatarUrl);
      }
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      alert("Tải ảnh thất bại!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  if (loading) {
    return <div className="profile-loading">Đang tải dữ liệu hồ sơ...</div>;
  }

  const { user, seller, gigs, reviews, wallet, payments } = profileData;
  if (!user) return <div className="profile-error">Không tìm thấy người dùng.</div>;

  const isSellerMode = user.current_role === 'ROLE_SELLER' && seller !== null;
  const displayedGigs = isOwner ? gigs : gigs.filter(g => g.is_paused === 0);

  return (
    <div className="profile-page-container">
      <div className="profile-back-nav" onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> <span>Quay lại Trang chủ</span>
      </div>

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-card-general">
            <div className="avatar-wrapper">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="avatar-image" />
              ) : (
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullname)}`} 
                  alt="Default Avatar" 
                  className="avatar-image" 
                />
              )}
              
              {isOwner && (
                <label className="avatar-upload-btn" title="Tải ảnh mới">
                  <Camera size={14} />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                </label>
              )}
              
              {user.is_online && <span className="online-badge" title="Đang trực tuyến"></span>}
            </div>

            <h2 className="user-fullname">{user.fullname}</h2>
            <p className="user-username">@{user.username}</p>
            
            <span className={`role-tag ${user.current_role.toLowerCase()}`}>
              {isSellerMode ? 'Freelancer / Seller' : 'Client / Buyer'}
            </span>

            <div className="profile-divider"></div>

            <div className="user-meta-details">
              {isOwner && (
                <>
                  <div className="meta-item private-info" title="Thông tin bảo mật chỉ bạn nhìn thấy">
                    <Mail size={16} /> <span>{user.email}</span> <span className="lock-label">Private</span>
                  </div>
                  {user.phone && (
                    <div className="meta-item private-info" title="Thông tin bảo mật chỉ bạn nhìn thấy">
                      <Phone size={16} /> <span>{user.phone}</span> <span className="lock-label">Private</span>
                    </div>
                  )}
                </>
              )}
              <div className="meta-item">
                <Calendar size={16} /> 
                <span>Thành viên từ: {new Date(user.created_at).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {isOwner && (
              <>
                <div className="profile-divider"></div>
                <button className="btn-logout-profile" onClick={handleLogout}>
                  <LogOut size={16} /> Đăng xuất
                </button>
              </>
            )}
          </div>

          {isOwner && wallet && (
            <div className="buyer-wallet-card">
              <div className="wallet-header">
                <div className="wallet-title"><Wallet size={18} /> <span>Số dư tài khoản</span></div>
                <button className="btn-toggle-eye" onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <h2 className="wallet-balance">
                {showBalance ? `$${Number(wallet.balance).toFixed(2)}` : '******'}
              </h2>
            </div>
          )}
        </div>

        <div className="profile-main-content">
          {isSellerMode ? (
            <>
              <div className="seller-about-section">
                <h3>Giới thiệu bản thân</h3>
                <p className="seller-bio">{seller.bio || "Chưa có thông tin giới thiệu."}</p>
                
                <div className="seller-stats-bar">
                  <div className="stat-box">
                    <span className="stat-stars">⭐ {seller.rating_avg || 0}</span>
                    <span className="stat-label">({seller.total_reviews || 0} đánh giá)</span>
                  </div>
                  <div className="stat-box border-left">
                    <Clock size={16} className="text-gray" />
                    <span className="stat-label">Thời gian phản hồi: <b>{seller.response_time || "1 giờ"}</b></span>
                  </div>
                </div>
              </div>

              <div className="profile-tabs-header">
                <button className={`tab-link ${activeTab === 'gigs' ? 'active' : ''}`} onClick={() => setActiveTab('gigs')}>
                  Dịch vụ đang cung cấp ({displayedGigs.length})
                </button>
                <button className={`tab-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                  Đánh giá từ khách hàng ({reviews.length})
                </button>
              </div>

              {activeTab === 'gigs' && (
                <div className="gigs-grid-container">
                  {displayedGigs.length > 0 ? (
                    displayedGigs.map((gig) => (
                      <div key={gig.id} className={`gig-profile-card ${gig.is_paused === 1 ? 'gig-paused' : ''}`}>
                        <div className="gig-thumbnail-wrapper" onClick={() => navigate(`/gigs/${gig.id}`)}>
                          <img src={gig.thumbnail_url || 'https://via.placeholder.com/500x300'} alt={gig.title} />
                          {gig.is_paused === 1 && <span className="paused-badge">Đang ẩn</span>}
                        </div>
                        <div className="gig-card-body">
                          <p className="gig-title" onClick={() => navigate(`/gigs/${gig.id}`)}>{gig.title}</p>
                          <div className="gig-card-footer">
                            {isOwner ? (
                              <button 
                                className={`btn-status-toggle ${gig.is_paused === 1 ? 'paused' : 'active'}`} 
                                onClick={() => toggleGigStatus(gig.id, gig.is_paused)}
                              >
                                {gig.is_paused === 1 ? 'Bật hiển thị' : 'Tạm ẩn'}
                              </button>
                            ) : (
                              <span className="seller-name-tag">{user.fullname}</span>
                            )}

                            <div className="gig-price">
                              <span className="price-lbl">Khởi điểm</span>
                              <span className="price-val">${gig.min_price || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-alert">Hiện tại không có dịch vụ nào đang được hiển thị.</div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-list-container">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div key={rev.id} className="review-item-row">
                        <div className="review-buyer-avatar">
                          {rev.buyer_avatar ? (
                            <img src={rev.buyer_avatar} alt={rev.buyer_name} className="img-fluid rounded-circle" />
                          ) : (
                            rev.buyer_name ? rev.buyer_name.charAt(0).toUpperCase() : 'U'
                          )}
                        </div>
                        <div className="review-main-body">
                          <div className="review-row-header">
                            <h4>{rev.buyer_name || "Người dùng ẩn danh"}</h4>
                            <span className="review-date">{new Date(rev.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="review-stars-score">
                            {Array.from({ length: Math.floor(rev.rating || 5) }).map((_, i) => <span key={i}>⭐</span>)}
                            <span className="score-num">{rev.rating || 5}</span>
                          </div>
                          <p className="review-comment-text">{rev.comment}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-alert">Chưa có đánh giá nào từ khách hàng.</div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="buyer-history-section">
              <h3>Lịch sử giao dịch gần đây</h3>
              {isOwner ? (
                <div className="payment-table-wrapper">
                  {payments.length > 0 ? (
                    payments.map((pay) => (
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
                          {pay.type === 'DEPOSIT' ? '+' : '-'}${Number(pay.amount).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-alert">Bạn chưa có lịch sử giao dịch phát sinh nào.</div>
                  )}
                </div>
              ) : (
                <div className="no-data-alert">Bạn không có quyền truy cập thông tin tài chính của người khác.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;