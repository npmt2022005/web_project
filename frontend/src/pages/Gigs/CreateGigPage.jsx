// src/pages/Gigs/CreateGigPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, Save, Image, Folder, DollarSign, FileText, Upload, Loader2 } from 'lucide-react';
import './CreateGigPage.css'; 

const CreateGigPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State lưu danh sách categories lấy từ Backend API
  const [backendCategories, setBackendCategories] = useState([]);

  // === STATE TỔNG QUAN (OVERVIEW), MÔ TẢ & HÌNH ẢNH ===
  const [generalInfo, setGeneralInfo] = useState({
    title: '',         // Chỉ nhập vế sau của "I will..."
    categoryId: '',    // Lưu Id danh mục được chọn từ API
    description: '',   // Mô tả chi tiết 
    englishLevel: '',   
    responseTime: '',
    deliveryTime: '',
    country: 'Vietnam',
    city: 'HCMC',
  });

  // Quản lý State cho danh sách kỹ năng tags
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');

  // Quản lý trạng thái danh sách ảnh đính kèm
  // Mỗi item gồm: { previewUrl: '...', remoteUrl: '...', isUploading: false }
  const [uploadedImages, setUploadedImages] = useState([]);

  // === STATE CẤU HÌNH 3 GÓI DỊCH VỤ (SCOPE & PRICING) ===
  const [packages, setPackages] = useState([
    {
      type: 'BASIC',
      shortDescription: '',
      deliveryDays: 3,
      revisions: 1,
      price: 50,
      features: { "Source Code": true, "Commercial Use": false }
    },
    {
      type: 'STANDARD',
      shortDescription: '',
      deliveryDays: 5,
      revisions: 3,
      price: 100,
      features: { "Source Code": true, "Commercial Use": true }
    },
    {
      type: 'PREMIUM',
      shortDescription: '',
      deliveryDays: 7,
      revisions: -1, // -1 đại diện cho Unlimited Revisions theo mẫu thiết kế
      price: 150,
      features: { "Source Code": true, "Commercial Use": true }
    }
  ]);

  // ==========================================================================
  // EFFECT: KIỂM TRA PHÂN QUYỀN TRUY CẬP (Bảo vệ Route cho tài khoản Seller)
  // ==========================================================================
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    
    // Nếu không tồn tại role hoặc giá trị role không khớp với phân quyền Seller
    if (!storedRole || (storedRole.toUpperCase() !== 'ROLE_SELLER' && storedRole.toLowerCase() !== 'seller')) {
      alert("Bạn không có quyền truy cập vào chức năng này. Vui lòng đăng nhập với tài khoản Seller!");
      navigate('/'); // Điều hướng trả về trang chủ hệ thống
    }
  }, [navigate]);

  // ==========================================================================
  // EFFECT: GỌI API LẤY DANH SÁCH DANH MỤC KHI VỪA MỞ TRANG (Đã thêm địa chỉ Backend)
  // ==========================================================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/categories', {
          method: 'GET'
        });
        const result = await response.json();
        if (result.status === "success" || Array.isArray(result)) {
          const categoriesData = Array.isArray(result) ? result : result.data || [];
          setBackendCategories(categoriesData);
        }
      } catch (err) {
        console.error("Lỗi lấy danh mục danh mục từ hệ thống:", err);
        setBackendCategories([
          { id: 5, name: "Spring Boot & React" },
          { id: 6, name: "Web Development" },
          { id: 7, name: "Mobile Applications" }
        ]);
      }
    };
    fetchCategories();
  }, []);

  // Xử lý thay đổi Input thông tin chung
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGeneralInfo(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý kỹ năng (Tags)
  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };
  const handleRemoveSkill = (indexToRemove) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  // ==========================================================================
  // LUỒNG XỬ LÝ: UPLOAD HÌNH ẢNH (Đã thêm địa chỉ Backend)
  // ==========================================================================
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Reset lại lỗi cũ trước khi thực hiện tải loạt ảnh mới
    setError('');

    for (const file of files) {
      const localId = Date.now() + Math.random().toString(36).substr(2, 9);
      const temporaryItem = {
        id: localId,
        previewUrl: URL.createObjectURL(file),
        remoteUrl: '',
        isUploading: true
      };
      
      setUploadedImages(prev => [...prev, temporaryItem]);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:8080/api/v1/gigs/upload_image', {
          method: 'POST',
          body: formData 
        });

        if (!response.ok) throw new Error('Upload ảnh thất bại từ Server');
        
        const result = await response.json();
        
        if (result.status === "success" && result.data) {
          // Cập nhật đường dẫn URL trả về từ API Cloud vào item tương ứng
          setUploadedImages(prev => 
            prev.map(img => img.id === localId 
              ? { ...img, remoteUrl: result.data, isUploading: false } 
              : img
            )
          );
        } else {
          throw new Error(result.message || 'Cấu trúc dữ liệu phản hồi ảnh không hợp lệ');
        }
      } catch (err) {
        console.error("Lỗi khi đẩy ảnh lên server:", err);
        setError('Có lỗi xảy ra trong quá trình tải ảnh lên hệ thống.');
        // Loại bỏ ảnh bị lỗi khỏi danh sách xem trước trên UI
        setUploadedImages(prev => prev.filter(img => img.id !== localId));
      }
    }
    // Clear thẻ input để có thể chọn lại cùng một file ảnh nếu muốn
    e.target.value = '';
  };

  // Xóa ảnh khỏi danh sách gallery preview
  const handleRemoveUploadedImage = (indexToRemove) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Xử lý thay đổi dữ liệu trong các gói giá
  const handlePackageChange = (packageIdx, field, value) => {
    setPackages(prevPackages => {
      const updated = [...prevPackages];
      
      // Nếu là trường price và người dùng xóa trống, cho phép lưu chuỗi rỗng để không bị khóa số 0
      let finalValue = value;
      if (field === 'price') {
        finalValue = value === '' ? '' : (parseFloat(value) || 0);
      } else if (field === 'revisions' || field === 'deliveryDays') {
        finalValue = parseInt(value) || 0;
      }

      updated[packageIdx] = { ...updated[packageIdx], [field]: finalValue };
      return updated;
    });
  };

  // Xử lý thay đổi nhanh ô nhập giá "Starting Price" ở Khối 1 (Cho phép xóa trống)
  const handleStartingPriceChange = (val) => {
    const numericValue = val === '' ? '' : (parseFloat(val) || 0);
    setPackages(prevPackages => {
      const updated = [...prevPackages];
      if (updated[0]) {
        updated[0].price = numericValue; // Cập nhật trực tiếp vào gói BASIC
      }
      return updated;
    });
  };

  // Xử lý thay đổi checkbox tính năng phụ động trong gói giá
  const handleFeatureToggle = (packageIdx, featureKey) => {
    setPackages(prevPackages => {
      const updated = [...prevPackages];
      const updatedFeatures = { ...updated[packageIdx].features };
      if (typeof updatedFeatures[featureKey] === 'boolean') {
        updatedFeatures[featureKey] = !updatedFeatures[featureKey];
      }
      updated[packageIdx] = { ...updated[packageIdx], features: updatedFeatures };
      return updated;
    });
  };

  // ==========================================================================
  // THAO TÁC CUỐI CÙNG: ĐĂNG BÀI DỊCH VỤ (CREATE GIG - Đã thêm Token Auth bảo mật)
  // ==========================================================================
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (!generalInfo.title || !generalInfo.categoryId) {
      setError('Vui lòng nhập tiêu đề dịch vụ và lựa chọn danh mục chính.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!generalInfo.description) {
      setError('Vui lòng viết mô tả chi tiết nội dung dịch vụ của bạn.');
      return;
    }

    const readyUrls = uploadedImages.filter(img => !img.isUploading && img.remoteUrl).map(img => img.remoteUrl);
    const thumbnailUrl = readyUrls.length > 0 ? readyUrls[0] : "https://res.cloudinary.com/your-project/image/upload/v12345/gig-thumb.jpg";
    const galleryUrls = readyUrls.length > 0 ? readyUrls : [thumbnailUrl];

    const finalPayload = {
      title: `I will ${generalInfo.title.replace(/^I will\s+/i, '')}`,
      categoryId: parseInt(generalInfo.categoryId),
      tags: skills.length > 0 ? skills : ["Web Development"],
      description: `<p>${generalInfo.description}</p>`, 
      thumbnailUrl: thumbnailUrl,
      galleryUrls: galleryUrls,
      packages: packages.map(pkg => ({
        type: pkg.type,
        price: parseFloat(pkg.price) || 0,
        shortDescription: pkg.shortDescription || `Mô tả ngắn mặc định dành cho gói dịch vụ ${pkg.type}`,
        deliveryDays: parseInt(pkg.deliveryDays) || 1,
        revisions: parseInt(pkg.revisions),
        features: pkg.features
      }))
    };

    setLoading(true);
    SystemLogTest(finalPayload);

    // Lấy Token xác thực từ localStorage để đính kèm vào Header gửi lên hệ thống Spring Boot
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8080/api/v1/gigs/create_gig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Đính kèm token xác thực phiên làm việc của Seller
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(finalPayload)
      });

      if (!response.ok) throw new Error('Yêu cầu tạo bài đăng dịch vụ không thành công');
      
      const result = await response.json();
      
      if (result.status === "success") {
        navigate(`/gigs/${result.data}`);
      } else {
        setError(result.message || 'Đăng bài thất bại từ hệ thống phản hồi.');
      }
    } catch (err) {
      console.error("Lỗi khi gọi API lưu dữ liệu:", err);
      setError('Kết nối Backend thất bại. Vui lòng kiểm tra lại cấu hình Server Spring Boot.');
    } finally {
      setLoading(false);
    }
  };

  const SystemLogTest = (data) => {
    console.log("%c[Spring-API-Payload] === GỬI REQUEST BODY JSON ===", 'background: #111; color: #76b783; font-weight: bold;');
    console.log(JSON.stringify(data, null, 2));
  };

  return (
    <div className="create-gig-container continuous-flow">
      
      {/* HEADER: Tiêu đề trang và Nút Save chính ở góc trên */}
      <div className="create-gig-header-section">
        <div className="header-left">
          <h2>Add Services</h2>
          <p className="subtitle-text">Điền thông tin chi tiết dịch vụ freelance của bạn phía dưới.</p>
        </div>
        <button 
          type="button" 
          onClick={handleSubmit} 
          className="btn-save-publish-top"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : 'Save & Publish'} <span className="arrow-icon">↗</span>
        </button>
      </div>

      {error && <div className="create-error-message fixed-error" style={{ color: 'red', padding: '10px', backgroundColor: '#fff0f0', marginBottom: '15px', borderRadius: '4px' }}>{error}</div>}

      <div className="create-gig-form-layout single-column-flow">
        
        {/* KHỐI 1: BASIC INFORMATION */}
        <div className="form-section-card visual-card">
          <div className="section-title-line">
            <h4>Basic Information</h4>
          </div>
          
          <div className="form-row-grid two-columns">
            <div className="form-group">
              <label>Service Title *</label>
              <div className="prefix-input-container standard-input-ui">
                <span className="title-prefix-fix">i will</span>
                <input 
                  type="text" 
                  name="title"
                  value={generalInfo.title}
                  onChange={handleInputChange}
                  maxLength={80}
                  placeholder="build a custom Spring Boot and React application"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Starting Price (Basic Package) *</label>
              <div className="prefix-input-container standard-input-ui">
                <span className="title-prefix-fix">$</span>
                <input 
                  type="number" 
                  name="startingPrice"
                  // Cho phép ô input hiển thị trống hoàn toàn khi xóa sạch thay vì giữ lại số 0 cứng
                  value={packages[0]?.price === '' ? '' : (packages[0]?.price ?? '')}
                  onChange={(e) => handleStartingPriceChange(e.target.value)}
                  placeholder="50"
                  min="5"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row-grid two-columns">
            <div className="form-group">
              <label>Category *</label>
              <select 
                name="categoryId" 
                value={generalInfo.categoryId} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {backendCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>English Level</label>
              <select name="englishLevel" value={generalInfo.englishLevel} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="Basic">Basic</option>
                <option value="Conversational">Conversational</option>
                <option value="Fluent">Fluent</option>
                <option value="Native">Native</option>
              </select>
            </div>
          </div>

          <div className="form-row-grid two-columns">
            <div className="form-group">
              <label>Response Time</label>
              <select name="responseTime" value={generalInfo.responseTime} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="1h">Within 1 Hour</option>
                <option value="24h">Within 24 Hours</option>
              </select>
            </div>

            <div className="form-group">
              <label>Global Target Delivery</label>
              <select name="deliveryTime" value={generalInfo.deliveryTime} onChange={handleInputChange}>
                <option value="">Select</option>
                <option value="1d">1 Day</option>
                <option value="3d">3 Days</option>
                <option value="7d">7 Days</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Skills & Tags (Press Add or Enter)</label>
            <div className="skills-input-wrapper-ui">
              <input 
                type="text" 
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Nhập thẻ kỹ năng ví dụ: Spring Boot"
                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              />
              <button type="button" onClick={handleAddSkill} className="btn-add-tag-inline">Add</button>
            </div>
            <div className="skills-tags-preview inline-tags">
              {skills.map((skill, index) => (
                <span key={index} className="form-skill-tag">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(index)}>&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* KHỐI 2: SERVICES DETAIL */}
        <div className="form-section-card visual-card">
          <div className="section-title-line">
            <h4>Services Detail</h4>
          </div>
          <div className="form-group">
            <textarea 
              name="description"
              value={generalInfo.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả chi tiết đầy đủ về sản phẩm/dịch vụ bạn cung cấp tại đây..." 
              rows={8}
              required
            />
          </div>
        </div>

        {/* KHỐI 3: PACKAGES */}
        <div className="form-section-card visual-card no-padding-mobile">
          <div className="section-title-line" style={{ padding: '0 24px' }}>
            <h4>Packages Pricing Matrix</h4>
          </div>
          
          <div className="packages-table-responsive-container">
            <table className="packages-pricing-grid-table alternative-style">
              <thead>
                <tr>
                  <th width="25%">Phân loại gói</th>
                  {packages.map((pkg, idx) => (
                    <th key={idx} width="25%">
                      <div className="pkg-header-cell-edit">
                        <span className="pkg-title-bold text-green">{pkg.type}</span>
                        <textarea 
                          value={pkg.shortDescription} 
                          placeholder={`Mô tả ngắn cho gói ${pkg.type.toLowerCase()}...`}
                          className="inline-edit-pkg-desc"
                          onChange={(e) => handlePackageChange(idx, 'shortDescription', e.target.value)}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-header-label">Source Code</td>
                  {packages.map((pkg, idx) => (
                    <td key={idx} className="text-center">
                      <input 
                        type="checkbox" 
                        checked={pkg.features["Source Code"] || false}
                        onChange={() => handleFeatureToggle(idx, "Source Code")}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="row-header-label">Commercial Use</td>
                  {packages.map((pkg, idx) => (
                    <td key={idx} className="text-center">
                      <input 
                        type="checkbox" 
                        checked={pkg.features["Commercial Use"] || false}
                        onChange={() => handleFeatureToggle(idx, "Commercial Use")}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="row-header-label">Revisions</td>
                  {packages.map((pkg, idx) => (
                    <td key={idx} className="text-center">
                      <div className="inline-numeric-edit">
                        <input 
                          type="number" 
                          value={pkg.revisions}
                          onChange={(e) => handlePackageChange(idx, 'revisions', e.target.value)}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="row-header-label">Delivery Days</td>
                  {packages.map((pkg, idx) => (
                    <td key={idx} className="text-center">
                      <div className="inline-numeric-edit">
                        <input 
                          type="number" 
                          value={pkg.deliveryDays}
                          onChange={(e) => handlePackageChange(idx, 'deliveryDays', e.target.value)}
                        />
                        <span style={{ fontSize: '11px', display: 'block', color: '#777' }}>Days</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="row-header-label font-bold">Total Price</td>
                  {packages.map((pkg, idx) => (
                    <td key={idx} className="text-center font-bold text-green">
                      <div className="price-input-table-container">
                        <span>$</span>
                        <input 
                          type="number" 
                          // Cho phép ô nhập giá ở ma trận bảng giá hiển thị trống hoàn toàn khi người dùng xóa hết kí tự
                          value={pkg.price === '' ? '' : pkg.price}
                          className="table-price-clean-input"
                          onChange={(e) => handlePackageChange(idx, 'price', e.target.value)}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* KHỐI 4: GALLERY */}
        <div className="form-section-card visual-card">
          <div className="section-title-line">
            <h4>Gallery</h4>
          </div>
          
          <div className="gallery-upload-grid-flow">
            {uploadedImages.map((img, index) => (
              <div key={index} className="gallery-preview-item-box" style={{ position: 'relative' }}>
                <img src={img.previewUrl} alt="Product upload preview" />
                
                {img.isUploading && (
                  <div className="image-loading-overlay" style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Loader2 className="animate-spin" color="#76b783" />
                  </div>
                )}

                <button 
                  type="button" 
                  className="btn-delete-image-preview" 
                  onClick={() => handleRemoveUploadedImage(index)}
                  disabled={img.isUploading}
                >
                  &times;
                </button>
                {index === 0 && <span className="thumbnail-badge">Thumbnail</span>}
              </div>
            ))}

            <label className="gallery-upload-trigger-square">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ display: 'none' }} 
              />
              <div className="trigger-inner-content">
                <Upload size={22} color="#999" />
                <span>Upload</span>
              </div>
            </label>
          </div>
          <small className="form-tip" style={{ marginTop: '12px', display: 'block' }}>
            Hệ thống hỗ trợ ảnh .jpg & .png. Bức ảnh đầu tiên sẽ mặc định làm ảnh đại diện chính (Thumbnail).
          </small>
        </div>

        {/* FOOTER BUTTON ACTION */}
        <div className="form-bottom-sticky-action-bar">
          <button 
            type="button" 
            onClick={handleSubmit} 
            className="btn-submit-green-save"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : 'Save'} <span className="arrow-icon">↗</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateGigPage;