// src/pages/Gigs/GigDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Tích hợp thư viện axios để gọi API thực tế
import { 
  Star, Clock, RefreshCw, Check, ShieldCheck, 
  MapPin, Globe, ChevronRight 
} from 'lucide-react';
import './GigDetailPage.css'; 

const MOCK_GIG_DETAILS = {
  "1": {
    "id": 1,
    "title": "I will craft engaging social media marketing, copywriting (Mock Data)",
    "isFeatured": true,
    "createdAt": "2026-05-27T19:26:46Z",
    "stats": { "rating": 4.8, "reviewCount": 48, "salesCount": 12, "viewsCount": 159 },
    "media": {
      "mainImage": "https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg",
      "gallery": [
        "https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg",
        "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
        "https://images.pexels.com/photos/546814/pexels-photo-546814.jpeg"
      ]
    },
    "description": "I'm a freelance backend developer and writer with over six years of experience helping brands scale with secure systems and crisp messaging. I specialize in Spring Boot development, Rest APIs, and creating dynamic automation frameworks to streamline content distribution.",
    "skills": ["Content Writing", "Digital Marketing", "Social Media Marketing", "Spring Boot", "REST API"],
    "seller": {
      "id": 88,
      "fullName": "Kianna Ble",
      "avatarUrl": "https://i.pravatar.cc/150?img=32",
      "isVerified": true,
      "role": "Supporter",
      "rating": 4.9,
      "reviewCount": 142,
      "location": "Rochester, USA",
      "languages": ["English", "Spanish", "Vietnamese"]
    },
    "packages": [
      {
        "type": "BASIC",
        "price": 50,
        "shortDescription": "5 Social media posts, captions or scripts (up to 500 words)",
        "deliveryDays": 1,
        "revisions": 0, 
        "features": { "Introduce and demonstrate": true, "Source File": false, "Commercial Use": false }
      },
      {
        "type": "STANDARD",
        "price": 100,
        "shortDescription": "10 Social media posts with custom graphics and hashtag strategy",
        "deliveryDays": 7,
        "revisions": 2,
        "features": { "Introduce and demonstrate": true, "Source File": true, "Commercial Use": false }
      },
      {
        "type": "PREMIUM",
        "price": 140,
        "shortDescription": "15 Social media posts, full strategy management, plus 24/7 priority support",
        "deliveryDays": 10,
        "revisions": -1, 
        "features": { "Introduce and demonstrate": true, "Source File": true, "Commercial Use": true }
      }
    ]
  }
};

const MOCK_SIMILAR_GIGS = {
  "content": [
    {
      "id": 1,
      "thumbnailUrl": "https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg",
      "isFeatured": true,
      "title": "I will craft engaging social media marketing, copywriting",
      "stats": { "rating": 4.8, "reviewCount": 48, "salesCount": 1, "viewsCount": 159 },
      "startingPrice": 50,
      "deliveryTimeStr": "1 day",
      "seller": { "id": 88, "fullName": "Kianna Ble", "avatarUrl": "https://i.pravatar.cc/150?img=32" },
      "isFavorite": false
    }
  ]
};

const GigDetailPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [gig, setGig] = useState(null);
  const [similarGigs, setSimilarGigs] = useState([]);
  const [activeTab, setActiveTab] = useState(0); 
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // KHỐI ĐÓN NHẬN VÀ KIỂM TRA DỮ LIỆU CHẠY THỬ OFFLINE (LOCAL TEST MODE)
      if (id === 'test-local') {
        const localData = localStorage.getItem('LOCAL_TEST_GIG');
        if (localData) {
          const parsedGig = JSON.parse(localData);
          setGig(parsedGig);
          setSimilarGigs([]); 
          if (parsedGig.media && parsedGig.media.mainImage) {
            setCurrentImage(parsedGig.media.mainImage);
          }
          setLoading(false);
          return; 
        }
      }

      try {
        // Thực hiện gọi API song song từ Backend
        const [detailRes, similarRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/v1/gigs/${id}`),
          axios.get(`http://localhost:8080/api/v1/gigs/${id}/similar`)
        ]);

        // Nếu API trả dữ liệu thành công -> Cập nhật vào State hệ thống
        if (detailRes.data && detailRes.data.status === "success") {
            const gigRealData = detailRes.data.data; 
            setGig(gigRealData);
            
            if (gigRealData.media && gigRealData.media.mainImage) {
                setCurrentImage(gigRealData.media.mainImage);
            }
        }
        
        if (similarRes.data && similarRes.data.status === "success") {
            const similarRealData = similarRes.data.data; 
            setSimilarGigs(similarRealData.similarGigs || similarRealData || []);
        } else {
            setSimilarGigs([]);
        }

      } catch (error) {
        console.warn("⚠️ Cảnh báo: Không thể kết nối API Backend. Tự động chuyển sang Mock Data mẫu.", error.message);
        
        const currentId = MOCK_GIG_DETAILS[id] ? id : "1";
        const targetGig = MOCK_GIG_DETAILS[currentId];
        
        setGig(targetGig);
        setSimilarGigs(MOCK_SIMILAR_GIGS.content);
        if (targetGig && targetGig.media) {
          setCurrentImage(targetGig.media.mainImage);
        }
      } finally {
        setLoading(false);
        setActiveTab(0); 
      }
    };

    loadData();
    window.scrollTo(0, 0); 
  }, [id]);

  // Hàm xử lý gọi API khởi tạo đơn hàng nháp khi chọn gói dịch vụ
  const handleContinueOrder = async (packageType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Vui lòng đăng nhập hệ thống để thực hiện đặt đơn hàng!");
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/orders',
        {
          gigId: id === 'test-local' ? 1 : parseInt(id), 
          packageType: packageType.toUpperCase(),       
          quantity: 1
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.status === "success") {
        const orderId = response.data.data.orderId;
        navigate(`/checkout/${orderId}`);
      } else {
        throw new Error(response.data.message || "Không thể khởi tạo phiên đơn hàng.");
      }
    } catch (error) {
      console.warn("⚠️ Lỗi hệ thống hoặc lỗi kết nối Server API đơn hàng. Tự động chuyển sang Mock Đơn Hàng để test UI.");
      console.log("🚨 Chi tiết lỗi API:", error.response ? error.response.data : error.message);
  
      console.warn("⚠️ Lỗi hệ thống hoặc lỗi kết nối Server API đơn hàng. Tự động chuyển sang Mock Đơn Hàng để test UI.");
      // ... phần điều hướng mock data tiếp theo ..
      const fallbackId = `mock-${id === 'test-local' ? '1' : id}-${packageType.toLowerCase()}`;
      navigate(`/checkout/${fallbackId}`);
    }
  };

  if (loading) {
    return <div className="gig-detail-loading">Đang tải cấu trúc thông tin dịch vụ...</div>;
  }

  if (!gig) {
    return <div className="gig-detail-error">Không tìm thấy dữ liệu mẫu cho bài đăng này.</div>;
  }

  const selectedPackage = gig.packages && gig.packages[activeTab] ? gig.packages[activeTab] : null;

  return (
    <div className="gig-detail-view-container">
      <div className="container gig-detail-layout">
        
        {/* === KHỐI BÊN TRÁI: CHI TIẾT BÀI ĐĂNG === */}
        <div className="gig-detail-main-content">
          
          <div className="breadcrumb-nav">
            <span onClick={() => navigate('/')}>Trang chủ</span> <ChevronRight size={14} />
            <span onClick={() => navigate('/search')}>Dịch vụ nổi bật</span> <ChevronRight size={14} />
            <span className="active-path">{gig.title}</span>
          </div>

          <h1 className="gig-title-header">
            {gig.isFeatured && <span className="featured-badge-tag">Nổi bật</span>}
            {gig.title}
          </h1>

          <div className="top-seller-info-row">
            {gig.seller && (
              <>
                <img src={gig.seller.avatarUrl} alt={gig.seller.fullName} className="seller-mini-avatar" />
                <div className="seller-meta-text">
                  <span className="seller-name-bold">{gig.seller.fullName}</span>
                  {gig.seller.isVerified && <span className="verified-text">| Chuyên gia xác thực</span>}
                  <span className="seller-role-badge">{gig.seller.role || "Freelancer"}</span>
                </div>
              </>
            )}
            {gig.stats && (
              <div className="rating-summary-box">
                <Star size={16} fill="#ffb33e" stroke="#ffb33e" />
                <span className="rating-num-bold">{(gig.stats.rating ?? 0).toFixed(1)}</span>
                <span className="review-count-gray">({gig.stats.reviewCount ?? 0} đánh giá)</span>
                <span className="sales-separator">|</span>
                <span className="sales-count-text">{gig.stats.salesCount ?? 0} đơn hàng đã đặt</span>
              </div>
            )}
          </div>

          <div className="image-gallery-section">
            <div className="main-display-image-wrapper">
              <img src={currentImage || (gig.media && gig.media.mainImage)} alt="Main view" className="main-display-image" />
            </div>
            {gig.media && gig.media.gallery && gig.media.gallery.length > 1 && (
              <div className="gallery-thumbnails-list">
                {gig.media.gallery.map((imgUrl, index) => (
                  <div 
                    key={index} 
                    className={`thumb-item-wrapper ${currentImage === imgUrl ? 'active-thumb' : ''}`}
                    onClick={() => setCurrentImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="detail-section-card description-card">
            <h3>Thông tin chi tiết dịch vụ</h3>
            <div 
              className="paragraph-content" 
              dangerouslySetInnerHTML={{ __html: gig.description }} 
            />
          </div>

          {gig.skills && gig.skills.length > 0 && (
            <div className="detail-section-card skills-tags-card">
              <h3>Kỹ năng liên quan</h3>
              <div className="skills-tags-flex">
                {gig.skills.map((skill, index) => (
                  <span key={index} className="skill-tag-item">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {gig.seller && (
            <div className="detail-section-card seller-profile-long-card">
              <h3>Thông tin về người bán</h3>
              <div className="seller-profile-flex-box">
                <img src={gig.seller.avatarUrl} alt={gig.seller.fullName} className="seller-large-avatar" />
                <div className="seller-profile-right">
                  <h4>{gig.seller.fullName}</h4>
                  <p className="seller-title-sub">{gig.seller.role || "Professional Freelancer"}</p>
                  <div className="seller-stats-line">
                    <span className="star-span">
                      <Star size={14} fill="#ffb33e" stroke="#ffb33e" /> {(gig.seller.rating ?? 0).toFixed(1)} ({gig.seller.reviewCount ?? 0} đánh giá)
                    </span>
                  </div>
                  <button className="contact-seller-btn-outline" onClick={() => alert('Chức năng liên hệ chat sẽ kết nối ở bước sau!')}>Liên hệ tôi</button>
                </div>
              </div>

              <div className="seller-extra-details-grid">
                <div className="extra-item">
                  <span className="label-gray">Đến từ</span>
                  <span className="val-bold">{gig.seller.location || "Chưa cập nhật"}</span>
                </div>
                <div className="extra-item">
                  <span className="label-gray">Ngôn ngữ</span>
                  <span className="val-bold">{gig.seller.languages ? gig.seller.languages.join(', ') : "English"}</span>
                </div>
                <div className="extra-item">
                  <span className="label-gray">Ngày tham gia</span>
                  <span className="val-bold">Tháng 9, 2024</span>
                </div>
              </div>
            </div>
          )}

          {similarGigs && similarGigs.length > 0 && (
            <div className="similar-gigs-section">
              <h3>Dịch vụ tương tự dành cho bạn</h3>
              <div className="similar-gigs-grid">
                {similarGigs.map((simGig) => (
                  <div 
                    key={simGig.id} 
                    className="similar-gig-mini-card"
                    onClick={() => navigate(`/gigs/${simGig.id}`)}
                  >
                    <img src={simGig.thumbnailUrl} alt={simGig.title} className="sim-thumbnail" />
                    <div className="sim-card-body">
                      {simGig.seller && (
                        <div className="sim-seller-row">
                          <img src={simGig.seller.avatarUrl} alt={simGig.seller.fullName} className="sim-avatar" />
                          <span>{simGig.seller.fullName}</span>
                        </div>
                      )}
                      <h5 className="sim-title">{simGig.title}</h5>
                      {simGig.stats && (
                        <div className="sim-rating-row">
                          <Star size={12} fill="#ffb33e" stroke="#ffb33e" />
                          <span>{(simGig.stats.rating ?? 0).toFixed(1)}</span>
                        </div>
                      )}
                      <div className="sim-footer-row">
                        <span className="price-label-gray">Giá từ:</span>
                        <span className="price-value-green">${simGig.startingPrice}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* === KHỐI BÊN PHẢI: BẢNG GIÁ VÀ CÁC GÓI DỊCH VỤ === */}
        <div className="gig-detail-side-sidebar">
          
          <div className="pricing-packages-sticky-card">
            {gig.packages && gig.packages.length > 0 && (
              <div className="packages-tabs-header">
                {gig.packages.map((pkg, idx) => (
                  <button 
                    key={idx} 
                    className={`tab-btn-item ${activeTab === idx ? 'active-tab-btn' : ''}`}
                    onClick={() => setActiveTab(idx)}
                  >
                    {pkg.type}
                  </button>
                ))}
              </div>
            )}

            {selectedPackage && (
              <div className="package-details-body">
                <div className="price-header-row">
                  <span className="pkg-type-title">{selectedPackage.type} Package</span>
                  <span className="pkg-price-amount">${selectedPackage.price}</span>
                </div>
                
                <p className="pkg-short-description">{selectedPackage.shortDescription}</p>

                <div className="pkg-delivery-meta">
                  <span className="meta-time"><Clock size={16} /> giao hàng trong {selectedPackage.deliveryDays} ngày</span>
                  <span className="meta-revisions">
                    <RefreshCw size={14} /> {selectedPackage.revisions === -1 ? 'Sửa đổi vô hạn' : `${selectedPackage.revisions} lần sửa đổi`}
                  </span>
                </div>

                {selectedPackage.features && (
                  <div className="pkg-features-checklist-box">
                    {Object.entries(selectedPackage.features).map(([featureName, isSupported], fIdx) => (
                      <div key={fIdx} className={`feature-check-line ${isSupported ? 'supported' : 'not-supported'}`}>
                        <Check size={16} className="check-icon" />
                        <span>{featureName}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  className="continue-order-submit-btn" 
                  onClick={() => handleContinueOrder(selectedPackage.type)}
                >
                  Tiếp tục với ({selectedPackage.price}$)
                </button>
              </div>
            )}

            <div className="sidebar-footer-security-note">
              <ShieldCheck size={16} /> <span>Hệ thống thanh toán bảo mật Escrow</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default GigDetailPage;