import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // --- Thêm Axios để gọi API ---
import { 
  Search, Star, Globe, Bell, Mail, 
  User, LayoutGrid, Info, ShieldCheck, ChevronDown,
  Headphones, UserCheck 
} from 'lucide-react';
import './HomeStyles.css'; 

// --- IMPORT INTERNAL IMAGES ---
import codeImg from '../assets/images/code.jpg';
import designImg from '../assets/images/design.jpg';
import marketingImg from '../assets/images/marketing.jpg';
import videoImg from '../assets/images/video.jpg';
import writingImg from '../assets/images/writing.jpg';

// --- IMPORT PARTNER LOGOS FROM ICONS FOLDER ---
import googleLogo from '../assets/icons/google-logo.png';
import metaLogo from '../assets/icons/meta-logo.png';
import netflixLogo from '../assets/icons/netflix-logo.jpg';
import pgLogo from '../assets/icons/pg-logo.jpg';
import paypalLogo from '../assets/icons/paypal-logo.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  
  // --- TRẠNG THÁI CHỨA DỮ LIỆU ĐỘNG TỪ BACKEND ---
  const [featuredGigs, setFeaturedGigs] = useState([]); // Chứa danh sách bài đăng dịch vụ
  const [categories, setCategories] = useState([]);     // Chứa danh sách danh mục đa cấp
  const [loadingGigs, setLoadingGigs] = useState(true);  // Trạng thái chờ tải dữ liệu
  const [role, setRole] = useState(null);
  const [fullname, setFullname] = useState('');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [popularCategories, setPopularCategories] = useState([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/gigs_v1/meta/filters');
        const apiData = response.data.data;
        setPopularCategories(apiData.popularTags);
      } catch (error) {
        console.error("Lỗi lấy metadata ở Trang chủ:", error);
      }
    };
    fetchMetadata();
  }, []);
  
  useEffect(() => {
    // 1. Kiểm tra trạng thái đăng nhập từ localStorage
    const storedRole = localStorage.getItem('role');
    const storedFullname = localStorage.getItem('fullname');
    
    if (storedRole) {
      setRole(storedRole);
      setFullname(storedFullname || '');
    }

    // 2. GỌI API LẤY DANH SÁCH DỊCH VỤ NỔI BẬT (/api/v1/gigs/featured)
    const fetchFeaturedGigs = async () => {
      try {
        setLoadingGigs(true);
        const response = await axios.get('http://localhost:8080/api/v1/gigs/featured?limit=4');
        if (response.data && response.data.status === 'success') {
          setFeaturedGigs(response.data.data); 
        }
      } catch (error) {
        console.error("Lỗi khi kết nối API lấy Featured Gigs:", error);
      } finally {
        setLoadingGigs(false);
      }
    };

    // 3. GỌI API LẤY DANH SÁCH CÂY DANH MỤC (/api/v1/categories)
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/categories');
        if (response.data && response.data.status === 'success') {
          setCategories(response.data.data); 
        }
      } catch (error) {
        console.error("Lỗi khi kết nối API lấy danh sách danh mục:", error);
      }
    };

    fetchFeaturedGigs();
    fetchCategories();
  }, []);

  // --- HÀM XỬ LÝ ĐIỀU HƯỚNG SANG TRANG SEARCH ---
  const handleSearchSubmit = () => {
    if (searchKeyword.trim()) {
      let url = `/search?keyword=${encodeURIComponent(searchKeyword.trim())}`;
      if (selectedCategory !== 'All Categories') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      navigate(url);
    }
  };

  // --- HÀM ĐIỀU HƯỚNG AN TOÀN VÀO TRANG PROFILE ---
  const handleAvatarClick = () => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      navigate(`/profile/${storedUsername}`);
    } else {
      navigate('/profile');
    }
  };

  // Hàm ánh xạ hình ảnh tĩnh dự phòng dựa trên slug danh mục nếu Backend không có imgUrl
  const getCategoryImage = (slug) => {
    if (slug.includes('design')) return designImg;
    if (slug.includes('programming') || slug.includes('tech')) return codeImg;
    if (slug.includes('marketing')) return marketingImg;
    if (slug.includes('video')) return videoImg;
    return writingImg;
  };

  return (
    <div className="common-home">
      
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg-wrapper">
          <img 
            src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg" 
            alt="Hero Background" 
            className="hero-bg-img"
          />
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <h1>Tìm kiếm dịch vụ <i>freelance</i> hoàn hảo cho doanh nghiệp của bạn</h1>
            
            <div className="hero-search-container">
              <div className="search-wrapper">
                <div className="category-select">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="All Categories">Tất cả danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-icon" />
                </div>
                <div className="search-input-group">
                  <input 
                    type="text" 
                    placeholder="Hôm nay bạn đang cần tìm dịch vụ gì?" 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  />
                  <button className="hero-search-btn" onClick={handleSearchSubmit}>
                    <Search size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="popular-tags">
              <span>Phổ biến:</span>
              {(popularCategories && popularCategories.length > 0 
                  ? popularCategories 
                  : [
                      { name: "Thiết kế Website", categorySlug: "website-design" },
                      { name: "WordPress", categorySlug: "wordpress" },
                      { name: "Thiết kế Logo", categorySlug: "logo-design" },
                      { name: "Dịch vụ AI", categorySlug: "ai-services" }
                    ]
                ).map((category, index) => (
                  <button 
                    key={category.categorySlug || index} 
                    onClick={() => {
                      setSearchKeyword(category.name);
                      navigate(`/search?category=${encodeURIComponent(category.categorySlug)}`);
                    }}
                  >
                    {category.name}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CAROUSEL TỰ ĐỘNG THEO BACKEND */}
      <section className="category-carousel">
        <div className="container">
          <h2>Các dịch vụ chuyên nghiệp nổi bật</h2>
          <div className="carousel-grid">
            {categories.slice(0, 5).map((cat) => (
              <div 
                key={cat.id} 
                className="carousel-card" 
                onClick={() => navigate(`/categories/${cat.slug}`)} 
                style={{ cursor: 'pointer' }}
              >
                <img 
                  src={cat.imgUrl && cat.imgUrl !== "đường link" ? cat.imgUrl : getCategoryImage(cat.slug)} 
                  alt={cat.name} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED GIGS LIÊN KẾT DATABASE THẬT */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Những sản phẩm đầy cảm hứng được thực hiện trên nền tảng</h2>
          
          {loadingGigs ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#1dbf73', fontWeight: 'bold' }}>
              Đang kết nối hệ thống dữ liệu...
            </div>
          ) : featuredGigs.length > 0 ? (
            <div className="gig-grid">
              {featuredGigs.map(gig => (
                <div className="gig-card" key={gig.id} onClick={() => navigate(`/gigs/${gig.id}`)} style={{ cursor: 'pointer' }}>
                  <img 
                    src={gig.thumbnailUrl || "https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg"} 
                    alt={gig.title} 
                    className="gig-thumbnail" 
                  />
                  <div className="gig-info">
                    <div className="seller-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div className="seller-avatar">
                        {gig.seller ? gig.seller[0].toUpperCase() : 'F'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <p className="seller-name" style={{ margin: 0, lineHeight: 1.2 }}><b>{gig.seller || "Người bán công tác"}</b></p>
                        <span className="seller-meta" style={{ fontSize: '12px', color: '#74767e' }}>
                          {gig.level ? gig.level : 'Người bán mới'} {gig.country ? ` • ${gig.country}` : ''}
                        </span>
                      </div>
                    </div>
                    <p className="gig-title" style={{ minHeight: '44px' }}>{gig.title}</p>
                    <div className="rating-row">
                      <Star size={14} fill="#ffb33e" color="#ffb33e" />
                      <span>
                        <b>{gig.rating ? gig.rating.toFixed(1) : "0.0"}</b> ({gig.reviews || 0})
                      </span>
                    </div>
                  </div>
                  <div className="gig-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="delivery-time" style={{ fontSize: '12px', color: '#74767e', fontWeight: '500' }}>
                      {gig.deliveryTime ? `Giao trong: ${gig.deliveryTime} ngày` : 'Giao linh hoạt'}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span className="price-label">GIÁ KHỞI ĐIỂM</span>
                      <span className="price-value">${gig.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#74767e' }}>
              Hiện chưa có dịch vụ nổi bật nào được đăng tải.
            </div>
          )}
        </div>
      </section>

      {/* 4. VALUE PROPOSITION */}
      <section className="value-prop">
        <div className="container prop-grid">
          <div className="prop-content">
            <h2>Cả thế giới tài năng freelance trong tầm tay bạn</h2>
            
            <div className="prop-item">
              <div className="prop-title-row">
                <ShieldCheck size={24} className="prop-icon" />
                <h4>Thanh toán an toàn</h4>
              </div>
              <p>Tiền của bạn chỉ được chuyển cho freelancer sau khi bạn phê duyệt sản phẩm. Được bảo vệ bởi hệ thống Ký quỹ (Escrow) đáng tin cậy của chúng tôi.</p>
            </div>

            <div className="prop-item">
              <div className="prop-title-row">
                <Headphones size={24} className="prop-icon" />
                <h4>Hỗ trợ chuyên nghiệp 24/7</h4>
              </div>
              <p>Đội ngũ hỗ trợ tận tâm của chúng tôi luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào để giải đáp thắc mắc hoặc xử lý tranh chấp đơn hàng.</p>
            </div>

            <div className="prop-item">
              <div className="prop-title-row">
                <UserCheck size={24} className="prop-icon" />
                <h4>Tài năng chất lượng đã qua kiểm duyệt</h4>
              </div>
              <p>Hồ sơ, năng lực và kỹ năng của mỗi freelancer đều được xem xét kỹ lưỡng để đảm bảo dịch vụ hàng đầu trên nền tảng của chúng tôi.</p>
            </div>
          </div>
          
          <div className="prop-image-wrapper">
            <img 
              src="https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg?auto=compress&cs=tinysrgb&w=800" 
              alt="Lợi ích của nền tảng" 
              className="prop-main-img"
            />
          </div>
        </div>
      </section>

      {/* 5. SOCIAL PROOF & TESTIMONIALS */}
      <section className="social-proof-section">
        <div className="partner-logos-wrapper">
          <div className="container partner-flex">
            <span className="partner-title">Được tin dùng bởi:</span>
            <div className="logos-grid">
              <img src={googleLogo} alt="Google" className="partner-brand-img" style={{ height: '32px' }} />
              <img src={metaLogo} alt="Meta" className="partner-brand-img" style={{ height: '32px' }} />
              <img src={netflixLogo} alt="Netflix" className="partner-brand-img" style={{ height: '32px' }} />
              <img src={pgLogo} alt="P&G" className="partner-brand-img" style={{ height: '38px' }} />
              <img src={paypalLogo} alt="PayPal" className="partner-brand-img" style={{ height: '34px' }} />
            </div>
          </div>
        </div>

        <div className="testimonials-wrapper">
          <div className="container">
            <h2 className="section-title-center">Khách hàng nói gì về chúng tôi</h2>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <div className="client-info">
                  <div className="client-avatar">KT</div>
                  <div>
                    <h5>Kiến Thức</h5>
                    <p className="client-role">Sáng lập viên tại TechStart</p>
                  </div>
                </div>
                <p className="client-comment">"Tìm kiếm các nhà phát triển web trên nền tảng này vô cùng nhanh chóng. Giao diện trực quan và tính năng bảo vệ thanh toán Ký quỹ giúp tôi hoàn toàn an tâm đối với các dự án lớn."</p>
                <div className="client-stars">⭐⭐⭐⭐⭐</div>
              </div>

              <div className="testimonial-card">
                <div className="client-info">
                  <div className="client-avatar">MD</div>
                  <div>
                    <h5>Minh Đức</h5>
                    <p className="client-role">Quản lý Marketing</p>
                  </div>
                </div>
                <p className="client-comment">"Đội ngũ hỗ trợ 24/7 xử lý mọi việc rất công bằng và nhanh chóng. Các cây viết SEO ở đây làm việc vô cùng chuyên nghiệp và đem lại những nội dung xuất sắc giúp thúc đẩy hiệu quả kinh doanh."</p>
                <div className="client-stars">⭐⭐⭐⭐⭐</div>
              </div>

              <div className="testimonial-card">
                <div className="client-info">
                  <div className="client-avatar">AH</div>
                  <div>
                    <h5>An Hoàng</h5>
                    <p className="client-role">Nhà thiết kế sản phẩm</p>
                  </div>
                </div>
                <p className="client-comment">"Tôi đã thuê một nhà thiết kế logo tại đây. Bạn freelancer làm việc rất tận tâm và bàn giao các bản sửa đổi đúng tiến độ. Quy trình phê duyệt sản phẩm chuyên nghiệp không thua kém gì các nền tảng toàn cầu."</p>
                <div className="client-stars">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 ĐÃ XÓA: Khối PROMO BANNER SECTION theo yêu cầu để giao diện gọn gàng hơn */}

      {/* 7. FOOTER */}
      <footer className="footer-section">
        <div className="container footer-top">
          <div className="footer-col">
            <h2>Danh mục</h2>
            <ul>
              {categories.map((cat) => (
                <li key={cat.id} onClick={() => navigate(`/categories/${cat.slug}`)} style={{ cursor: 'pointer' }}>
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h2>Hỗ trợ</h2>
            <ul><li>Trợ giúp & Hỗ trợ</li><li>Niềm tin & An toàn</li><li>Bán hàng trên Vance</li></ul>
          </div>
          <div className="footer-col">
            <h2>Giới thiệu</h2>
            <ul><li>Cơ hội nghề nghiệp</li><li>Chính sách bảo mật</li><li>Điều khoản dịch vụ</li></ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container bottom-flex">
            <div className="f-left">
              {/* 🌟 ĐÃ SỬA: Thêm CSS inline định màu rõ ràng cho logo để không bị ẩn chìm vào màu nền footer */}
              <span className="f-logo" style={{ color: '#202124', fontWeight: 'bold' }}>vance<span style={{ color: '#1dbf73' }}>.</span></span>
              <span className="copyright">© Vance International Ltd. 2026</span>
            </div>
            <div className="f-right settings">
              <span><Globe size={16} /> Tiếng Việt</span>
              <span>$ USD</span>
              <LayoutGrid size={20} />
              <Info size={20} />
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;