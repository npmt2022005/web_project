// src/pages/Gigs/CreateGigPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation để nhận state dữ liệu từ ManageServices
import { Plus, Trash, Save, Image, Folder, DollarSign, FileText, Upload, Loader2 } from 'lucide-react';
import './CreateGigPage.css';

const CreateGigPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Khởi tạo hook để bóc tách editGigData
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  // State nhận diện xem đây là chế độ SỬA dịch vụ hay TẠO MỚI dịch vụ
  const isEditMode = !!location.state?.editGigData;
  const editGigId = location.state?.editGigData?.id || null;

  // State lưu danh sách categories gốc từ Backend API
  const [backendCategories, setBackendCategories] = useState([]);
  // State quản lý danh mục cha được chọn hiện tại trên UI
  const [selectedParentId, setSelectedParentId] = useState('');
  // State lưu danh sách sub-categories (con) lọc ra từ danh mục cha
  const [subCategories, setSubCategories] = useState([]);

  // State lưu danh sách tất cả các Tags hệ thống (Hiện tại đang dùng Mock Data)
  const [availableTags, setAvailableTags] = useState([]);

  // State mới: Lưu danh sách các tính năng (features) có thể có cho các gói
  const [availableFeatures, setAvailableFeatures] = useState([]);

  // === STATE TỔNG QUAN (OVERVIEW), MÔ TẢ & HÌNH ẢNH ===
  const [generalInfo, setGeneralInfo] = useState({
    title: '',         // Chỉ nhập vế sau của "I will..."
    categoryId: '',    // Lưu Id danh mục được chọn từ API (ID của danh mục con cuối cùng)
    description: '',   // Mô tả chi tiết 
  });

  // Quản lý State cho danh sách kỹ năng tags đã chọn của bài đăng
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');

  // Quản lý trạng thái danh sách ảnh đính kèm
  const [uploadedImages, setUploadedImages] = useState([]);

  // === STATE CẤU HÌNH 3 GÓI DỊCH VỤ (SCOPE & PRICING) ===
  const [packages, setPackages] = useState([
    {
      type: 'BASIC',
      shortDescription: '',
      deliveryDays: 3,
      revisions: 1,
      price: 50,
      features: {}
    },
    {
      type: 'STANDARD',
      shortDescription: '',
      deliveryDays: 5,
      revisions: 3,
      price: 100,
      features: {}
    },
    {
      type: 'PREMIUM',
      shortDescription: '',
      deliveryDays: 7,
      revisions: -1, // -1 đại diện cho Unlimited Revisions theo mẫu thiết kế
      price: 150,
      features: {}
    }
  ]);

  // === STATE QUẢN LÝ REQUIREMENTS (CÂU HỎI YÊU CẦU ĐỐI VỚI KHÁCH HÀNG) ===
  const [requirements, setRequirements] = useState([
    { question: '', answerType: 'TEXT', isMandatory: true }
  ]);
  const fetchAvailableFeatures = async (catId) => {
    try {
      // Trong tương lai, bạn có thể truyền categoryId vào đây
      const response = await fetch(`/api/v1/gigs/features?categoryId=${catId}`);
      const result = await response.json();
      if (result.status === 'success' && Array.isArray(result.data)) {
        const newFeatures = result.data;
        setAvailableFeatures(result.data);
        // Đồng thời, khởi tạo các features cho package với giá trị mặc định là false
        // 2. Cập nhật mảng packages để đồng bộ cấu trúc mới
        setPackages(prev => prev.map(pkg => ({
          ...pkg,
          features: newFeatures.reduce((acc, featureName) => {
            // Giữ lại giá trị cũ nếu đã có, nếu chưa có thì mặc định là false
            acc[featureName] = pkg.features && pkg.features.hasOwnProperty(featureName)
              ? pkg.features[featureName]
              : false;
            return acc;
          }, {})
        })));
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách features:", err);
      setAvailableFeatures(["Source Code", "Commercial Use", "24/7 Support"]); // Fallback data
    }
  };
  // ==========================================================================
  // EFFECT: KIỂM TRA PHÂN QUYỀN TRUY CẬP & TÍNH ĐẦY ĐỦ CỦA HỒ SƠ SELLER (ĐÃ SỬA LỖI CHẶN)
  // ==========================================================================
  useEffect(() => {
    // 1. Kiểm tra quyền truy cập cơ bản
    const storedRole = localStorage.getItem('role');
    if (!storedRole || (storedRole.toUpperCase() !== 'ROLE_SELLER' && storedRole.toLowerCase() !== 'seller')) {
      alert("Bạn không có quyền truy cập vào chức năng này. Vui lòng đăng nhập với tài khoản Seller!");
      navigate('/');
      return;
    }

    // 2. Chỉ thực hiện chặn điền thông tin khi ở chế độ "TẠO MỚI" dịch vụ (Tránh chặn khi đang sửa bài cũ)
    if (!isEditMode) {
      const rawProfile = localStorage.getItem('mockProfileData') || localStorage.getItem('profileData');
      console.log("Dữ liệu lấy từ localStorage:", rawProfile);
      let isProfileComplete = false;
      let missingFields = [];

      // if (rawProfile) {
      //   try {
      //     const profile = JSON.parse(rawProfile);

      //     // Kiểm tra thông tin cơ bản bắt buộc chu đáo
      //     if (!profile.phone || String(profile.phone).trim() === '') missingFields.push("Số điện thoại");
      //     if (!profile.city || String(profile.city).trim() === '') missingFields.push("Thành phố");
      //     if (!profile.description || String(profile.description).trim() === '') missingFields.push("Giới thiệu bản thân (Introduce Yourself)");
      //     if (!profile.bio || profile.bio.trim() === '') missingFields.push("Mô tả bản thân (Bio)");
      //     // SỬA ĐỔI: Sử dụng Optional Chaining nhằm tránh lỗi đọc thuộc tính undefined
      //     const profileSkills = profile?.skills;
      //     const profileEducation = profile?.education;
      //     const profileExperience = profile?.experience;

      //     // SỬA ĐỔI: Nới lỏng điều kiện kiểm tra mảng. Chỉ chặn khi mảng được định nghĩa cụ thể nhưng rỗng [].
      //     if (Array.isArray(profileSkills) && profileSkills.length === 0) missingFields.push("Kỹ năng (Cần ít nhất 1 Kỹ năng)");
      //     if (Array.isArray(profileEducation) && profileEducation.length === 0) missingFields.push("Học vấn (Cần ít nhất 1 Học vấn)");
      //     if (Array.isArray(profileExperience) && profileExperience.length === 0) missingFields.push("Kinh nghiệm làm việc (Cần ít nhất 1 Kinh nghiệm)");

      //     if (missingFields.length === 0) {
      //       isProfileComplete = true;
      //     }
      //   } catch (e) {
      //     // Nếu có lỗi parse JSON, cho phép qua nếu thông tin phân quyền hợp lệ hoặc tạm thời gán false để bảo vệ luồng dữ liệu
      //     console.error("Lỗi parse Profile dữ liệu", e);
      //     isProfileComplete = true; 
      //   }
      // } else {
      //   // Nếu không có cả 2 key lưu trữ trong localStorage, tạm thời bỏ qua bước check nghiêm ngặt này để tránh lỗi chặn nhầm do API
      //   missingFields.push("Toàn bộ hồ sơ chưa được cập nhật");
      //   isProfileComplete = true;
      // }

      // // Nếu thực sự thiếu thông tin năng lực cốt lõi thì mới cảnh báo và điều hướng
      // if (!isProfileComplete && missingFields.length > 0) {
      //   alert(`⚠️ Hồ sơ của bạn thiếu các thông tin bắt buộc để đảm bảo uy tín và năng lực làm việc:\n- ${missingFields.join('\n- ')}\n\nVui lòng hoàn thiện đầy đủ hồ sơ trước khi đăng tải sản phẩm/dịch vụ (Gig) mới!`);
      //   navigate('/profile'); 
      // }
    }
  }, [navigate, isEditMode]);

  // ==========================================================================
  // EFFECT: GỌI API LẤY DANH SÁCH DANH MỤC & CÀI ĐẶT MOCK DATA CHO TAGS
  // ==========================================================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/v1/categories', {
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
          {
            id: 1, name: "Lập trình & Công nghệ", subCategories: [
              { id: 5, name: "Spring Boot & React" },
              { id: 6, name: "Phát triển Website" }
            ]
          },
          {
            id: 2, name: "Thiết kế & Đồ họa", subCategories: [
              { id: 7, name: "Thiết kế Logo" },
              { id: 8, name: "UI/UX Mobile" }
            ]
          }
        ]);
      }
    };

    const fetchTags = async () => {
      setAvailableTags([
        { id: 1, name: "Spring Boot" },
        { id: 2, name: "ReactJS" },
        { id: 3, name: "MySQL" },
        { id: 4, name: "Java" },
        { id: 5, name: "NodeJS" },
        { id: 6, name: "Python" },
        { id: 7, name: "Figma" },
        { id: 8, name: "Tailwind CSS" }
      ]);
    };

    // Hàm gọi API lấy danh sách các features mặc định


    fetchCategories();
    fetchTags();
  }, []);
  useEffect(() => {
    // Chỉ gọi API nếu categoryId tồn tại và không phải là chuỗi rỗng
    if (generalInfo.categoryId && generalInfo.categoryId !== '') {
      console.log("👉 Đang tải features cho danh mục:", generalInfo.categoryId);
      fetchAvailableFeatures(generalInfo.categoryId);
    }
  }, [generalInfo.categoryId]);
  // ==========================================================================
  // EFFECT TÍCH HỢP: ĐIỀN NGƯỢC DỮ LIỆU TỪ BACKEND KHI ẤN SỬA (ĐÃ SỬA LỖI ĐỔ FORM)
  // ==========================================================================
  useEffect(() => {
    // Hàm để điền dữ liệu vào form
    const populateFormWithData = (gigData) => {
      setIsPopulating(true);
      if (!gigData || backendCategories.length === 0) return;

      const targetGig = gigData;

      // Xử lý loại bỏ tiền tố "I will " hoặc "Tôi sẽ " nếu có ở tiêu đề
      let cleanTitle = targetGig.title || '';
      cleanTitle = cleanTitle.replace(/^I will\s+/i, '').replace(/^Tôi sẽ\s+/i, '');

      // Tìm kiếm danh mục dựa vào categoryId hoặc tên category được truyền qua
      let finalCategoryId = targetGig.categoryId ? targetGig.categoryId.toString() : '';
      let matchedParentId = '';

      for (const parent of backendCategories) {
        const subList = parent.subCategories || parent.children || [];
        const isMatched = subList.some(sub =>
          sub.id.toString() === finalCategoryId ||
          sub.name === targetGig.categoryName ||
          sub.name === targetGig.category
        );

        if (isMatched) {
          const foundSub = subList.find(sub =>
            sub.id.toString() === finalCategoryId ||
            sub.name === targetGig.categoryName ||
            sub.name === targetGig.category
          );
          matchedParentId = parent.id.toString();
          finalCategoryId = foundSub.id.toString();
          setSubCategories(subList);
          break;
        }
      }

      setSelectedParentId(matchedParentId);

      // ĐÃ SỬA: Lấy mô tả chi tiết chuẩn xác từ DB mà không bị bộ lọc regex chặn làm mất chữ
      let rawDescription = targetGig.description || '';
      rawDescription = rawDescription.replace(/<\/p>/g, '\n').replace(/<\/?p>/g, '').trim();
      console.log("👉 [DEBUG POPULATE] Dữ liệu vừa đổ vào generalInfo:", {
        title: cleanTitle,
        categoryId: finalCategoryId,
        description: rawDescription
      });
      setGeneralInfo({
        title: cleanTitle,
        categoryId: finalCategoryId,
        description: rawDescription
      });

      // ĐÃ SỬA: Map đúng cấu trúc mảng gói (packages) trả về từ cơ sở dữ liệu thật
      if (targetGig.packages && Array.isArray(targetGig.packages) && targetGig.packages.length > 0) {
        const sortedPackages = [...targetGig.packages].sort((a, b) => {
          const order = { 'BASIC': 1, 'STANDARD': 2, 'PREMIUM': 3 };
          return (order[a.type] || 9) - (order[b.type] || 9);
        });

        // Set packages trước mà không dùng availableFeatures (sẽ được cập nhật sau)
        setPackages(sortedPackages.map(pkg => ({
          type: pkg.type || 'BASIC',
          shortDescription: pkg.shortDescription || pkg.description || '',
          deliveryDays: pkg.deliveryDays || 3,
          revisions: pkg.revisions ?? 1,
          price: pkg.price || 0,
          features: pkg.features || {}
        })));
      }

      // ĐÃ SỬA: ĐỒNG BỘ ĐỔ LẠI DANH SÁCH CÂU HỎI YÊU CẦU (REQUIREMENTS) CŨ TỪ CƠ SỞ DỮ LIỆU
      if (targetGig.requirements && Array.isArray(targetGig.requirements) && targetGig.requirements.length > 0) {
        setRequirements(targetGig.requirements.map(req => ({
          question: req.question || '',
          answerType: req.answerType || 'TEXT',
          isMandatory: req.isMandatory ?? true
        })));
      }

      // Phục hồi tags dữ liệu
      if (targetGig.tags && targetGig.tags.length > 0) {
        setSkills(targetGig.tags);
      } else if (targetGig.categoryName || targetGig.category) {
        setSkills([targetGig.categoryName || targetGig.category]);
      }

      // Phục hồi danh sách ảnh hiển thị từ API
      if (targetGig.galleryUrls && Array.isArray(targetGig.galleryUrls) && targetGig.galleryUrls.length > 0) {
        setUploadedImages(targetGig.galleryUrls.map((url, index) => ({
          id: `db-img-${index}-${Date.now()}`,
          previewUrl: url,
          remoteUrl: url,
          isUploading: false
        })));
      } else if (targetGig.thumbnailUrl || targetGig.thumbnail) {
        const thumb = targetGig.thumbnailUrl || targetGig.thumbnail;
        setUploadedImages([
          {
            id: 'db-img-thumb',
            previewUrl: thumb,
            remoteUrl: thumb,
            isUploading: false
          }
        ]);
      }
      setIsPopulating(false); // Tắt
    };

    // Logic chính: Ưu tiên lấy dữ liệu mới nhất từ API nếu ở chế độ sửa
    if (isEditMode && editGigId) {
      const fetchGigDetailsForEdit = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/v1/gigs/${editGigId}`);
          const result = await response.json();
          if (response.ok && result.status === 'success') {
            // Gọi hàm điền form với dữ liệu mới nhất từ API
            populateFormWithData(result.data);
          } else {
            // Nếu API lỗi, fallback về dữ liệu từ location.state (nếu có)
            console.warn("Không thể fetch chi tiết Gig, fallback về location.state");
            populateFormWithData(location.state?.editGigData);
          }
        } catch (error) {
          console.error("Lỗi fetch chi tiết Gig:", error);
          populateFormWithData(location.state?.editGigData);
        } finally {
          setLoading(false);
        }
      };
      fetchGigDetailsForEdit();
    } else if (location.state?.editGigData) {
      // Trường hợp cũ, vẫn giữ để tương thích
      populateFormWithData(location.state.editGigData);
    }

  }, [isEditMode, editGigId, location.state, backendCategories]);

  // EFFECT MỚI: Đồng bộ availableFeatures vào packages sau khi form được populate
  // Điều này tránh được vòng lặp dependency mà vẫn giữ các feature được cập nhật đúng cách
  useEffect(() => {
    if (!isPopulating && generalInfo.categoryId && availableFeatures.length > 0) {
      setPackages(prev => prev.map(pkg => ({
        ...pkg,
        features: availableFeatures.reduce((acc, featureName) => {
          // Giữ lại giá trị cũ nếu đã có, nếu chưa có thì mặc định là false
          acc[featureName] = pkg.features && pkg.features.hasOwnProperty(featureName)
            ? pkg.features[featureName]
            : false;
          return acc;
        }, {})
      })));
    }
  }, [availableFeatures, isPopulating]);

  // Xử lý khi thay đổi Category cha
  const handleParentCategoryChange = (e) => {
    const parentId = e.target.value;
    // Ghi lại Stack Trace để biết ai là người gọi hàm này
    console.group("👉 DEBUG: handleParentCategoryChange");
    console.log("Parent ID:", parentId);
    console.trace("Lịch sử gọi hàm (Stack Trace):");
    console.groupEnd();

    if (parentId !== selectedParentId) {
      setSelectedParentId(parentId);
      const selectedCategory = backendCategories.find(cat => cat.id === parseInt(parentId));
      if (selectedCategory && (selectedCategory.subCategories || selectedCategory.children)) {
        setSubCategories(selectedCategory.subCategories || selectedCategory.children || []);
      } else {
        setSubCategories([]);
      }

      if (!isPopulating) {
        setGeneralInfo(prev => ({ ...prev, categoryId: '' }));
      } else {
      }
    }
  };

  // Xử lý thay đổi Input thông tin chung
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGeneralInfo(prev => ({ ...prev, [name]: value }));
    if (name === 'categoryId') {
    }
  };

  // Xử lý kỹ năng (Tags) chọn từ danh sách dropdown
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
  // LUỒNG XỬ LÝ: UPLOAD HÌNH ẢNH (ĐÃ BỔ SUNG HEADER AUTHORIZATION TRÁNH LỖI 403)
  // ==========================================================================
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setError('');

    // Lấy Token từ LocalStorage để đính kèm vào phân quyền upload ảnh
    const token = localStorage.getItem('token') || localStorage.getItem('JWT_TOKEN');

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
        const response = await fetch('/api/v1/uploads/image', {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: formData
        });

        if (!response.ok) throw new Error('Upload ảnh thất bại từ Server');

        const result = await response.json();

        if (result.status === "success" && result.data) {
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
        setError('Có lỗi xảy ra trong quá trình tải ảnh lên hệ thống. Kiểm tra lại dung lượng hoặc thư mục uploads.');
        setUploadedImages(prev => prev.filter(img => img.id !== localId));
      }
    }
    e.target.value = '';
  };

  const handleRemoveUploadedImage = (idToRemove) => {
    setUploadedImages(prev => prev.filter(img => img.id !== idToRemove));
  };

  const handlePackageChange = (packageIdx, field, value) => {
    setPackages(prevPackages => {
      const updated = [...prevPackages];

      let finalValue = value;
      if (field === 'price') {
        finalValue = value === '' ? '' : (parseFloat(value) || 0);
      } else if (field === 'revisions' || field === 'deliveryDays') {
        finalValue = value === '' ? '' : (parseInt(value) || 0);
      }

      updated[packageIdx] = { ...updated[packageIdx], [field]: finalValue };
      return updated;
    });
  };

  const handleStartingPriceChange = (val) => {
    const numericValue = val === '' ? '' : (parseFloat(val) || 0);
    setPackages(prevPackages => {
      const updated = [...prevPackages];
      if (updated[0]) {
        updated[0].price = numericValue;
      }
      return updated;
    });
  };

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
  // XỬ LÝ LOGIC CHO KHỐI CÂU HỎI REQUIREMENTS
  // ==========================================================================
  const handleAddRequirement = () => {
    setRequirements([...requirements, { question: '', answerType: 'TEXT', isMandatory: true }]);
  };

  const handleRemoveRequirement = (index) => {
    if (requirements.length === 1) {
      setRequirements([{ question: '', answerType: 'TEXT', isMandatory: true }]);
    } else {
      setRequirements(requirements.filter((_, idx) => idx !== index));
    }
  };

  const handleRequirementChange = (index, field, value) => {
    const updatedRequirements = [...requirements];
    updatedRequirements[index][field] = value;
    setRequirements(updatedRequirements);
  };

  // ==========================================================================
  // THAO TÁC CUỐI CÙNG: ĐĂNG BÀI DỊCH VỤ HOẶC CẬP NHẬT (CREATE / UPDATE GIG)
  // ==========================================================================
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (!generalInfo.title || !generalInfo.categoryId) {
      setError('Vui lòng nhập tiêu đề dịch vụ và lựa chọn đầy đủ danh mục chính.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!generalInfo.description) {
      setError('Vui lòng viết mô tả chi tiết nội dung dịch vụ của bạn.');
      return;
    }
    const readyUrls = uploadedImages.filter(img => !img.isUploading && img.remoteUrl).map(img => img.remoteUrl);
    if (readyUrls.length === 0) {
      setError('Vui lòng tải lên ít nhất 1 hình ảnh đại diện cho dịch vụ của bạn!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const validRequirements = requirements
      .filter(req => req.question.trim() !== '')
      .map(req => ({
        question: req.question.trim(),
        answerType: req.answerType,
        isMandatory: req.isMandatory
      }));

    const thumbnailUrl = readyUrls.length > 0 ? readyUrls[0] : "https://res.cloudinary.com/your-project/image/upload/v12345/gig-thumb.jpg";
    const galleryUrls = readyUrls.length > 0 ? readyUrls : [thumbnailUrl];
    console.log("👉 Giá trị categoryId đang gửi lên:", generalInfo.categoryId);
    const finalPayload = {
      title: `I will ${generalInfo.title.replace(/^I will\s+/i, '')}`,
      categoryId: parseInt(generalInfo.categoryId),
      tags: skills.length > 0 ? skills : ["Web Development"],
      description: generalInfo.description,
      thumbnailUrl: thumbnailUrl,
      galleryUrls: galleryUrls,
      packages: packages.map(pkg => ({
        type: pkg.type,
        price: parseFloat(pkg.price) || 0,
        shortDescription: pkg.shortDescription || `Mô tả ngắn mặc định dành cho gói dịch vụ ${pkg.type}`,
        deliveryDays: parseInt(pkg.deliveryDays) || 1,
        revisions: parseInt(pkg.revisions),
        features: pkg.features
      })),
      requirements: validRequirements
    };

    const token = localStorage.getItem('token') || localStorage.getItem('JWT_TOKEN');

    const apiUrl = isEditMode
      ? `/api/v1/gigs/update/${editGigId}`
      : '/api/v1/gigs/create_gig';

    const apiMethod = isEditMode ? 'PUT' : 'POST';

    try {
      setLoading(true);
      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(finalPayload)
      });

      if (!response.ok) throw new Error(isEditMode ? 'Yêu cầu cập nhật dịch vụ không thành công' : 'Yêu cầu tạo bài đăng dịch vụ không thành công');

      const result = await response.json();

      if (result.status === "success") {
        alert(isEditMode ? "Cập nhật thông tin dịch vụ thành công!" : "Đăng dịch vụ mới thành công!");
        navigate('/manage-services');
      } else {
        setError(result.message || 'Thao tác lưu thất bại từ hệ thống phản hồi.');
      }
    } catch (err) {
      console.error("Lỗi khi gọi API lưu dữ liệu:", err);
      setError('Kết nối Backend thất bại. Vui lòng kiểm tra lại cấu hình Server Spring Boot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-gig-container continuous-flow">
      <div className="create-gig-header-section">
        <div className="header-left">
          <h2>{isEditMode ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}</h2>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-save-publish-top"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : (isEditMode ? 'Cập nhật dịch vụ' : 'Lưu & Đăng tải')} <span className="arrow-icon">↗</span>
        </button>
      </div>

      {error && <div className="create-error-message fixed-error" style={{ color: 'red', padding: '10px', backgroundColor: '#fff0f0', marginBottom: '15px', borderRadius: '4px' }}>{error}</div>}

      <div className="create-gig-form-layout single-column-flow">

        {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
        <div className="form-section-card visual-card">
          <div className="section-title-line">
            <h4>Thông Tin Cơ Bản</h4>
          </div>

          <div className="form-row-grid two-columns">
            <div className="form-group">
              <label>Tiêu Đề Dịch Vụ *</label>
              <div className="prefix-input-container standard-input-ui">
                <span className="title-prefix-fix">tôi sẽ</span>
                <input
                  type="text"
                  name="title"
                  value={generalInfo.title}
                  onChange={handleInputChange}
                  maxLength={80}
                  placeholder="xây dựng một ứng dụng Spring Boot và React custom theo yêu cầu"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Giá Khởi Điểm (Gói Cơ Bản) *</label>
              <div className="prefix-input-container standard-input-ui">
                <span className="title-prefix-fix">$</span>
                <input
                  type="number"
                  name="startingPrice"
                  value={packages[0]?.price === '' ? '' : (packages[0]?.price ?? '')}
                  onChange={(e) => handleStartingPriceChange(e.target.value)}
                  placeholder="50"
                  min="5"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row-grid two-columns" style={{ marginTop: '15px' }}>
            <div className="form-group">
              <label>Danh Mục Chính *</label>
              <select
                value={selectedParentId}
                onChange={handleParentCategoryChange}
                required
              >
                <option value="">-- Chọn Danh Mục Chính --</option>
                {backendCategories.map((cat) => (
                  <option key={`parent-${cat.id}`} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Danh Mục Phụ *</label>
              <select
                name="categoryId"
                value={generalInfo.categoryId}
                onChange={handleInputChange}
                disabled={!selectedParentId}
                required
              >
                <option value="">-- Chọn Danh Mục Phụ --</option>
                {subCategories.map((sub) => (
                  <option key={`sub-${sub.id}`} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>Kỹ Năng & Thẻ Tags (Chọn và Thêm)</label>
            <div className="skills-input-wrapper-ui">
              <select
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">-- Lựa chọn kỹ năng từ hệ thống --</option>
                {availableTags.map((tag) => (
                  <option key={`tag-opt-${tag.id}`} value={tag.name}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleAddSkill} className="btn-add-tag-inline">Thêm</button>
            </div>
            <div className="skills-tags-preview inline-tags">
              {skills.map((skill, index) => (
                <span key={`skill-${index}`} className="form-skill-tag">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(index)}>&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* KHỐI 2: CHI TIẾT DỊCH VỤ */}
        <div className="form-section-card visual-card">
          <div className="section-title-line">
            <h4>Chi Tiết Nội Dung Dịch Vụ</h4>
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

        {/* KHỐI 3: CẤU HÌNH CÁC GÓI GIÁ */}
        <div className="form-section-card visual-card no-padding-mobile">
          <div className="section-title-line" style={{ padding: '0 24px' }}>
            <h4>Ma Trận Cấu Hình Gói Dịch Vụ & Giá Cả</h4>
          </div>

          <div className="packages-table-responsive-container">
            <table className="packages-pricing-grid-table alternative-style">
              <thead>
                <tr>
                  <th width="25%">Phân loại gói</th>
                  {packages.map((pkg, idx) => (
                    <th key={`pkg-th-${idx}`} width="25%">
                      <div className="pkg-header-cell-edit">
                        <span className="pkg-title-bold text-green">
                          {pkg.type === 'BASIC' ? 'CƠ BẢN (BASIC)' : pkg.type === 'STANDARD' ? 'TIÊU CHUẨN (STANDARD)' : 'CAO CẤP (PREMIUM)'}
                        </span>
                        <textarea
                          value={pkg.shortDescription}
                          placeholder={`Mô tả ngắn gọn đặc điểm của gói ${pkg.type.toLowerCase()}...`}
                          className="inline-edit-pkg-desc"
                          onChange={(e) => handlePackageChange(idx, 'shortDescription', e.target.value)}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* === Dựng các hàng Feature một cách linh động === */}
                {availableFeatures.map((featureName) => (
                  <tr key={featureName}>
                    <td className="row-header-label">{featureName}</td>
                    {packages.map((pkg, idx) => (
                      <td key={`${featureName}-${idx}`} className="text-center">
                        <input
                          type="checkbox"
                          checked={pkg.features?.[featureName] || false}
                          onChange={() => handleFeatureToggle(idx, featureName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="row-header-label">Số lần sửa đổi (Revisions)</td>
                  {packages.map((pkg, idx) => (
                    <td key={`rev-${idx}`} className="text-center">
                      <div className="inline-numeric-edit">
                        <input
                          type="number"
                          value={pkg.revisions}
                          onChange={(e) => handlePackageChange(idx, 'revisions', e.target.value)}
                        />
                      </div>
                      <span style={{ fontSize: '11px', display: 'block', color: '#777' }}>
                        {pkg.revisions === -1 ? 'Vô hạn' : 'Lần'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="row-header-label">Thời gian bàn giao (Delivery Days)</td>
                  {packages.map((pkg, idx) => (
                    <td key={`del-${idx}`} className="text-center">
                      <div className="inline-numeric-edit">
                        <input
                          type="number"
                          value={pkg.deliveryDays}
                          onChange={(e) => handlePackageChange(idx, 'deliveryDays', e.target.value)}
                        />
                      </div>
                      <span style={{ fontSize: '11px', display: 'block', color: '#777' }}>Ngày</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="row-header-label font-bold">Tổng chi phí gói</td>
                  {packages.map((pkg, idx) => (
                    <td key={`price-${idx}`} className="text-center font-bold text-green">
                      <div className="price-input-table-container">
                        <span>$</span>
                        <input
                          type="number"
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

        {/* KHỐI 4: THƯ VIỆN ẢNH */}
        <div className="form-section-card visual-card">
          <div className="section-title-line">
            <h4>Thư Viện Hình Ảnh Dịch Vụ</h4>
          </div>

          <div className="gallery-upload-grid-flow">
            {uploadedImages.map((img, index) => (
              <div key={img.id} className="gallery-preview-item-box" style={{ position: 'relative' }}>
                <img src={img.previewUrl} alt="Hình ảnh sản phẩm preview" />
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
                  onClick={() => handleRemoveUploadedImage(img.id)}
                  disabled={img.isUploading}
                >
                  &times;
                </button>
                {index === 0 && <span className="thumbnail-badge">Ảnh Đại Diện</span>}
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
                <span>Tải ảnh lên</span>
              </div>
            </label>
          </div>
        </div>

        {/* KHỐI 5: BUYER REQUIREMENTS */}
        <div className="form-section-card visual-card">
          <div className="section-title-line">
            <h4>Yêu Cầu Đối Với Người Mua (Buyer Requirements)</h4>
          </div>

          <div className="requirements-list-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {requirements.map((req, idx) => (
              <div key={`req-${idx}`} className="requirement-item-row" style={{ border: '1px solid #e4e5e7', padding: '15px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: '#404145' }}>Yêu cầu câu hỏi #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                  >
                    <Trash size={14} /> Xóa câu hỏi
                  </button>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500' }}>Nội dung câu hỏi yêu cầu *</label>
                  <input
                    type="text"
                    value={req.question}
                    onChange={(e) => handleRequirementChange(idx, 'question', e.target.value)}
                    placeholder="Ví dụ: Vui lòng gửi tài liệu đặc tả thiết kế hệ thống..."
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', marginTop: '5px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500' }}>Hình thức trả lời</label>
                    <select
                      value={req.answerType}
                      onChange={(e) => handleRequirementChange(idx, 'answerType', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', marginTop: '5px' }}
                    >
                      <option value="TEXT">Đoạn văn bản tự do (Free Text)</option>
                      <option value="ATTACHMENT">Đính kèm tập tin (Attachment File)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                    <input
                      type="checkbox"
                      id={`mandatory-${idx}`}
                      checked={req.isMandatory}
                      onChange={(e) => handleRequirementChange(idx, 'isMandatory', e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor={`mandatory-${idx}`} style={{ fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                      Bắt buộc người mua phải trả lời (Mandatory)
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddRequirement}
            style={{
              marginTop: '15px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#fff',
              border: '1px dashed #1dbf73',
              color: '#1dbf73',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            <Plus size={14} /> Thêm câu hỏi yêu cầu mới
          </button>
        </div>

        <div className="form-bottom-sticky-action-bar">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-submit-green-save"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : (isEditMode ? 'Cập nhật ngay' : 'Lưu lại')} <span className="arrow-icon">↗</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateGigPage;