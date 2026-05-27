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
  
  // Trạng thái đăng nhập
  const [role, setRole] = useState(null);
  const [fullname, setFullname] = useState('');

  // --- TRẠNG THÁI CHỨA DỮ LIỆU ĐỘNG TỪ BACKEND ---
  const [featuredGigs, setFeaturedGigs] = useState([]); // Chứa danh sách bài đăng dịch vụ
  const [categories, setCategories] = useState([]);     // Chứa danh sách danh mục đa cấp
  const [loadingGigs, setLoadingGigs] = useState(true);  // Trạng thái chờ tải dữ liệu

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
        // Mặc định gọi lấy 4 phần tử theo layout hiện tại
        const response = await axios.get('http://localhost:8080/api/v1/gigs/featured?limit=4');
        if (response.data && response.data.status === 'success') {
          setFeaturedGigs(response.data.data); // Gán mảng dữ liệu vào State
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
          setCategories(response.data.data); // Gán mảng danh mục vào State
        }
      } catch (error) {
        console.error("Lỗi khi kết nối API lấy danh sách danh mục:", error);
      }
    };

    // Kích hoạt gọi dữ liệu
    fetchFeaturedGigs();
    fetchCategories();
  }, []);

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
      
      {/* 1. HEADER */}
      <header className="main-header">
        <div className="container header-flex">
          <div className="header-left">
            <h1 className="logo" onClick={() => navigate('/')}>vance<span>.</span></h1>
          </div>
          <nav className="header-right">
            
            {/* ĐỔI THÀNH DỮ LIỆU DANH MỤC ĐỘNG TRONG DROPDOWN */}
            <div className="nav-item-dropdown">
              <span className="nav-link">Categories <ChevronDown size={14} /></span>
              <div className="dropdown-content">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <span key={cat.id} onClick={() => navigate(`/categories/${cat.slug}`)}>
                      {cat.name}
                    </span>
                  ))
                ) : (
                  <>
                    <span onClick={() => navigate('/categories/graphics-design')}>Graphics & Design</span>
                    <span onClick={() => navigate('/categories/programming-tech')}>Programming & Tech</span>
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
                <div 
                  className="user-avatar" 
                  onClick={() => navigate('/profile')} 
                  style={{ cursor: 'pointer' }}
                >
                  {fullname ? fullname[0].toUpperCase() : <User size={16}/>}
                </div>
              </div>
            ) : (
              <div className="guest-nav">
                <span className="btn-signin" onClick={() => navigate('/login')}>Sign In</span>
              </div>
            )}
          </nav>
        </div>
        
        {/* THANH DANH MỤC PHỤ ĐỘNG PHÍA DƯỚI HEADER */}
        <div className="category-menu hide-mobile">
          <div className="container">
            <ul>
              {categories.map((cat) => (
                <li 
                  key={cat.id} 
                  onClick={() => navigate(`/categories/${cat.slug}`)} 
                  style={{ cursor: 'pointer' }}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
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
            <h1>Find the perfect <i>freelance</i> services for your business</h1>
            
            <div className="hero-search-container">
              <div className="search-wrapper">
                <div className="category-select">
                  <select>
                    <option>All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-icon" />
                </div>
                <div className="search-input-group">
                  <input type="text" placeholder="What service are you looking for today?" />
                  <button className="hero-search-btn"><Search size={20} /></button>
                </div>
              </div>
            </div>

            <div className="popular-tags">
              <span>Popular:</span>
              {["Website Design", "WordPress", "Logo Design", "AI Services"].map(tag => (
                <button key={tag}>{tag}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY CAROUSEL TỰ ĐỘNG THEO BACKEND */}
      <section className="category-carousel">
        <div className="container">
          <h2>Popular professional services</h2>
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

      {/* 4. FEATURED GIGS LIÊN KẾT DATABASE THẬT */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Inspirational work made on our platform</h2>
          
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
                    <div className="seller-row">
                      <div className="seller-avatar">
                        {gig.seller ? gig.seller[0].toUpperCase() : 'F'}
                      </div>
                      <p className="seller-name"><b>{gig.seller || "Freelancer"}</b></p>
                    </div>
                    <p className="gig-title">{gig.title}</p>
                    <div className="rating-row">
                      <Star size={14} fill="#ffb33e" color="#ffb33e" />
                      <span>
                        <b>{gig.rating ? gig.rating.toFixed(1) : "0.0"}</b> ({gig.reviews || 0})
                      </span>
                    </div>
                  </div>
                  <div className="gig-footer">
                    <span className="price-label">STARTING AT</span>
                    <span className="price-value">${gig.price}</span>
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

      {/* 5. VALUE PROPOSITION */}
      <section className="value-prop">
        <div className="container prop-grid">
          <div className="prop-content">
            <h2>A whole world of freelance talent at your fingertips</h2>
            
            <div className="prop-item">
              <div className="prop-title-row">
                <ShieldCheck size={24} className="prop-icon" />
                <h4>Secure Payments</h4>
              </div>
              <p>Your money is only released to the freelancer once you approve the work. Protected by our reliable Escrow system.</p>
            </div>

            <div className="prop-item">
              <div className="prop-title-row">
                <Headphones size={24} className="prop-icon" />
                <h4>24/7 Professional Support</h4>
              </div>
              <p>Our dedicated support team is available round the clock to assist you with any questions or order disputes.</p>
            </div>

            <div className="prop-item">
              <div className="prop-title-row">
                <UserCheck size={24} className="prop-icon" />
                <h4>Vetted Quality Talent</h4>
              </div>
              <p>Every freelancer's profile, portfolio, and skills are carefully reviewed to ensure top-tier service on our platform.</p>
            </div>
          </div>
          
          <div className="prop-image-wrapper">
            <img 
              src="https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg?auto=compress&cs=tinysrgb&w=800" 
              alt="Platform Benefits" 
              className="prop-main-img"
            />
          </div>
        </div>
      </section>

      {/* 6. SOCIAL PROOF & TESTIMONIALS */}
      <section className="social-proof-section">
        <div className="partner-logos-wrapper">
          <div className="container partner-flex">
            <span className="partner-title">Trusted by:</span>
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
            <h2 className="section-title-center">What our customers say</h2>
            <div className="testimonials-grid">
              
              <div className="testimonial-card">
                <div className="client-info">
                  <div className="client-avatar">KT</div>
                  <div>
                    <h5>Kien Thuc</h5>
                    <p className="client-role">Founder at TechStart</p>
                  </div>
                </div>
                <p className="client-comment">"Finding web developers on this platform is incredibly fast. The interface is intuitive, and the Escrow payment protection gives me complete peace of mind for large projects."</p>
                <div className="client-stars">⭐⭐⭐⭐⭐</div>
              </div>

              <div className="testimonial-card">
                <div className="client-info">
                  <div className="client-avatar">MD</div>
                  <div>
                    <h5>Minh Duc</h5>
                    <p className="client-role">Marketing Manager</p>
                  </div>
                </div>
                <p className="client-comment">"The 24/7 support team handles everything fairly and quickly. The SEO writers here are highly professional and deliver exceptional content that drives results."</p>
                <div className="client-stars">⭐⭐⭐⭐⭐</div>
              </div>

              <div className="testimonial-card">
                <div className="client-info">
                  <div className="client-avatar">AH</div>
                  <div>
                    <h5>An Hoang</h5>
                    <p className="client-role">Product Designer</p>
                  </div>
                </div>
                <p className="client-comment">"I hired a logo designer here. The freelancer was very dedicated and delivered revisions right on schedule. The approval process is as professional as global platforms."</p>
                <div className="client-stars">⭐⭐⭐⭐⭐</div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 7. NEW USER PROMO BANNER SECTION */}
      <section className="promo-banner-section">
        <div className="container">
          <h2 className="section-title">Special Offers for New Users</h2>
          <div className="promo-grid">
            
            <div className="promo-card discount-main" onClick={() => navigate('/login')}>
              <div className="promo-content-left">
                <span className="promo-badge">NEW USER ONLY</span>
                <h3>Get <b>20% OFF</b> Your First Order</h3>
                <p>Find top-tier freelance experts for your project today. Use code: <span className="promo-code">WELCOME20</span></p>
                <button className="promo-btn">Claim Offer Now</button>
              </div>
              <div className="promo-image-right">
                <img src="https://images.pexels.com/photos/5849559/pexels-photo-5849559.jpeg?auto=compress&cs=tinysrgb&w=600" alt="New User Discount" />
              </div>
            </div>

            <div className="promo-card protection-sub">
              <div className="promo-content-left">
                <span className="promo-badge-blue">100% SECURE</span>
                <h3>Free Escrow Protection</h3>
                <p>Your budget is safe with us. Freelancers are only paid after your final approval.</p>
                <span className="promo-link" onClick={() => navigate('/pages')}>Learn how it works →</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="footer-section">
        <div className="container footer-top">
          <div className="footer-col">
            <h2>Categories</h2>
            <ul>
              {categories.map((cat) => (
                <li key={cat.id} onClick={() => navigate(`/categories/${cat.slug}`)} style={{ cursor: 'pointer' }}>
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h2>Support</h2>
            <ul><li>Help & Support</li><li>Trust & Safety</li><li>Selling on Vance</li></ul>
          </div>
          <div className="footer-col">
            <h2>About</h2>
            <ul><li>Careers</li><li>Privacy Policy</li><li>Terms of Service</li></ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container bottom-flex">
            <div className="f-left">
              <span className="f-logo">vance<span>.</span></span>
              <span className="copyright">© Vance International Ltd. 2026</span>
            </div>
            <div className="f-right settings">
              <span><Globe size={16} /> English</span>
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