// src/pages/Profile/MyProfile.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Plus, PenSquare, ArrowUpRight, Check, X, CreditCard, RefreshCw } from 'lucide-react';
import './MyProfile.css';

const MyProfile = () => {
    // 🎭 Trạng thái vai trò hệ thống: Tự động cập nhật dựa theo tài khoản đăng nhập
    const [userRole, setUserRole] = useState('buyer');
    
    // 🔄 State phục vụ tính năng liên kết ngân hàng (Stripe Connect)
    const [bankLoading, setBankLoading] = useState(false);

    // Trạng thái kết nối ngân hàng thực tế từ API Contract
    const [accountStatus, setAccountStatus] = useState({
        linkedBank: false,
        verified: false
    });

    // State lưu ảnh đại diện (mặc định dùng ảnh mock data)
    const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60");

    // 🔧 Đọc trực tiếp từ key 'role' riêng lẻ trong LocalStorage để nhận diện vai trò
    useEffect(() => {
        const storedRole = localStorage.getItem('role'); 
        if (storedRole) {
            const normalizedRole = storedRole.toLowerCase();
            if (normalizedRole.includes('seller')) {
                setUserRole('seller');
            } else {
                setUserRole('buyer');
            }
        }
        // Gọi hàm tải dữ liệu hồ sơ từ API khi component mount
        fetchProfileData();
    }, []);

    // Danh sách 20 quốc gia phổ biến phục vụ chạy Mock Data trực tiếp cho ô Select
    const popularCountries = [
        "Vietnam", "United States", "United Kingdom", "Singapore", "Japan", 
        "South Korea", "Australia", "Canada", "France", "Germany",
        "Thailand", "Malaysia", "Indonesia", "Philippines", "India",
        "China", "Netherlands", "Sweden", "Switzerland", "New Zealand"
    ];

    // ==========================================
    // STATE QUẢN LÝ DỮ LIỆU HỒ SƠ CHÍNH (PROFILE STATE)
    // ==========================================
    const [isEditingBasic, setIsEditingBasic] = useState(false);
    // State phụ để lưu trữ dữ liệu gốc trước khi sửa
    const [tempBasicInfo, setTempBasicInfo] = useState(null);
    const [basicInfo, setBasicInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        country: 'Vietnam',
        city: '', 
        bio: ''
    });

    // Danh sách dữ liệu động cho Học vấn và Kinh nghiệm việc làm
    const [educations, setEducations] = useState([]);
    const [experiences, setExperiences] = useState([]);

    // State phục vụ việc Đổi mật khẩu
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // ==========================================
    // HÀM GỌI API ĐỂ TẢI DỮ LIỆU (FETCH PROFILE & FALLBACK)
    // ==========================================
    const fetchProfileData = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/profile/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const result = await response.json();
            
            console.log(">>> [DEBUG] fetchProfileData Result:", result);

            if (response.ok && result.status === 'success') {
                localStorage.setItem('profileData', JSON.stringify(result));
                const data = result.data;
                const info = data.basicInfo || {};
    

                setBasicInfo({
                    fullName: info.username || '',
                    email: info.email || '',
                    phone: info.phone || '',
                    country: info.country || 'Vietnam',
                    city: info.city || '', 
                    bio: info.description || ''
                });
                if (info.avatar) {
                    setAvatarUrl(info.avatar);
                }
                
                // Map lại dữ liệu từ TimelineDTO (id, duration, title, subtitle, description) 
                // sang state (id, year, degree, school, description)
                setEducations((data.education || []).map(edu => ({
                    id: edu.id,
                    year: edu.duration,    // TimelineDTO.duration -> frontend.year
                    degree: edu.title,     // TimelineDTO.title -> frontend.degree
                    school: edu.subtitle,  // TimelineDTO.subtitle -> frontend.school
                    description: edu.description, // TimelineDTO.description -> frontend.description
                    isEditing: false
                })));
                setExperiences((data.experience || []).map(exp => ({
                    id: exp.id,
                    duration: exp.duration,
                    role: exp.title,
                    company: exp.subtitle,
                    description: exp.description,
                    isEditing: false
                })));
                setAccountStatus({
                    // Dòng console.log đã được di chuyển ra ngoài object literal
                    // Sửa lại key: Jackson tự động bỏ tiền tố 'is' của boolean
                    // isLinkedBank -> linkedBank, isVerified -> verified
                    linkedBank: data.accountStatus?.linkedBank || false,
                    verified: data.accountStatus?.verified || false
                });
            } else {
                throw new Error("Không thể lấy dữ liệu từ API, chuyển sang Mock Data.");
            }
        } catch (error) {
            console.warn("🚩 API Profile Error hoặc chưa bật Backend:", error.message);
            
            // KÍCH HOẠT FALLBACK MOCK DATA ĐỂ ĐẢM BẢO GIAO DIỆN HIỂN THỊ ĐẸP MẮT
            setBasicInfo({
                fullName: 'Nguyễn Kiên Thức',
                email: 'kienthuc.dev@gmail.com',
                phone: '0987654321',
                country: 'Vietnam',
                city: 'Hồ Chí Minh',
                bio: 'Đam mê xây dựng các hệ thống backend web hiệu năng cao, xử lý luồng dữ liệu mượt mà bằng Java Spring Boot kết hợp tối ưu trải nghiệm giao diện người dùng chuyên nghiệp.'
            });

            // Đã bổ sung trường description vào Mock Data Học vấn
            setEducations([
                { id: 101, school: 'Đại học Bách Khoa', degree: 'Kỹ sư Phần mềm', year: '2021 - 2025', description: 'Tốt nghiệp loại giỏi, hoàn thành đồ án xuất sắc về chủ đề kiến trúc Microservices.', isEditing: false },
                { id: 102, school: 'FPT Aptech', degree: 'Chứng chỉ Lập trình viên Quốc tế', year: '2019 - 2021', description: 'Học chuyên sâu về lập trình hướng đối tượng OOP và cơ sở dữ liệu quan hệ.', isEditing: false }
            ]);

            setExperiences([
                { id: 201, company: 'FPT Software', role: 'Java Backend Developer', duration: '2024 - Hiện tại', description: 'Phát triển hệ thống microservices và tích hợp cổng thanh toán giao dịch tự động.', isEditing: false },
                { id: 202, company: 'VNG Corporation', role: 'Fullstack Web Intern', duration: '6 tháng năm 2023', description: 'Hỗ trợ thiết kế giao diện bảng điều khiển quản trị bằng ReactJS và xây dựng RESTful API.', isEditing: false }
            ]);
        }
    };

    // ==========================================
    // LOGIC TÍCH HỢP API: UPLOAD AVATAR
    // ==========================================
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/api/v1/profile/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setAvatarUrl(result.data); 
                alert(result.message || "Cập nhật ảnh đại diện thành công!");
            } else {
                throw new Error(result.message || "Lỗi xử lý tải ảnh lên từ phía máy chủ.");
            }
        } catch (error) {
            console.warn("🚩 API Avatar Error - Kích hoạt Mock Data Fallback:", error.message);
            const previewUrl = URL.createObjectURL(file);
            setAvatarUrl(previewUrl);
            alert("Đã cập nhật ảnh đại diện cục bộ (Chạy Mock Fallback do chưa có kết nối API).");
        }
    };

    const triggerAvatarUpload = () => {
        document.getElementById('avatar-file-input').click();
    };

    // ==========================================
    // XỬ LÝ LOGIC NGHIỆP VỤ CHO PHẦN EDUCATION (ĐÃ THÊM DESCRIPTION)
    // ==========================================
    const handleAddEducationRow = () => {
        const newItem = {
            id: null,
            school: '',
            degree: '',
            year: '',
            description: '', // Đã bổ sung trường description mới
            isEditing: true
        };
        setEducations([...educations, newItem]);
    };

    const handleSaveEducationItem = async (index) => {
        const item = educations[index];
        if (!item.school.trim() || !item.degree.trim() || !item.year.trim()) {
            alert("Vui lòng nhập đầy đủ Tên trường học, Bằng cấp và Niên khóa trước khi lưu!");
            return;
        }

        try {
            const method = item.id ? 'PUT' : 'POST';
            const url = item.id 
                ? `http://localhost:8080/api/v1/profile/education/${item.id}` 
                : 'http://localhost:8080/api/v1/profile/education';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    school: item.school,
                    degree: item.degree,
                    duration: item.year, // Sửa từ 'year' thành 'duration' để khớp với Backend
                    description: item.description // Gửi kèm mô tả lên API hệ thống
                })
            });

            const result = await response.json(); // Parse response once
            if (response.ok && result.status === 'success') {
                console.log(">>> [DEBUG] handleSaveEducationItem Response Body:", result); // This will now contain the full TimelineDTO

                const updatedList = [...educations];
                // Map TimelineDTO fields back to frontend state fields
                updatedList[index] = { 
                    id: result.data.id,
                    school: result.data.subtitle, // TimelineDTO.subtitle -> frontend.school
                    degree: result.data.title,     // TimelineDTO.title -> frontend.degree
                    year: result.data.duration,    // TimelineDTO.duration -> frontend.year
                    description: result.data.description, // TimelineDTO.description -> frontend.description
                    isEditing: false 
                };
                setEducations(updatedList);
                alert("Đã cập nhật thông tin Học vấn thành công!");
            } else {
                const updatedList = [...educations];
                updatedList[index].id = item.id || Date.now();
                updatedList[index].isEditing = false;
                setEducations(updatedList);
                alert("Lưu offline thành công (Backend chưa có API phản hồi).");
            }
        } catch (error) {
            console.error("Lỗi khi kết nối API Education:", error);
            const updatedList = [...educations];
            updatedList[index].id = item.id || Date.now();
            updatedList[index].isEditing = false;
            setEducations(updatedList);
            alert("Lưu dữ liệu cục bộ thành công!");
        }
    };

    const handleDeleteEducationItem = async (index) => {
        const item = educations[index];
        if (!item.id) {
            setEducations(educations.filter((_, idx) => idx !== index));
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn mục học vấn này không?")) return;

        try {
            const response = await fetch(`http://localhost:8080/api/v1/profile/education/${item.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setEducations(educations.filter((_, idx) => idx !== index));
                alert("Xóa học vấn thành công!");
            } else {
                setEducations(educations.filter((_, idx) => idx !== index));
                alert("Đã xóa mục trên giao diện.");
            }
        } catch (error) {
            console.error("Lỗi API khi xóa education:", error);
            setEducations(educations.filter((_, idx) => idx !== index));
        }
    };

    // ==========================================
    // XỬ LÝ LOGIC NGHIỆP VỤ CHO PHẦN EXPERIENCE
    // ==========================================
    const handleAddExperienceRow = () => {
        const newItem = {
            id: null,
            company: '',
            role: '',
            duration: '',
            description: '',
            isEditing: true
        };
        setExperiences([...experiences, newItem]);
    };

    const handleSaveExperienceItem = async (index) => {
        const item = experiences[index];
        if (!item.company.trim() || !item.role.trim() || !item.duration.trim()) {
            alert("Vui lòng điền đầy đủ Tên công ty, Vị trí và Thời gian làm việc!");
            return;
        }

        try {
            const method = item.id ? 'PUT' : 'POST';
            const url = item.id 
                ? `http://localhost:8080/api/v1/profile/experience/${item.id}` 
                : 'http://localhost:8080/api/v1/profile/experience';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    company: item.company,
                    role: item.role,
                    duration: item.duration,
                    description: item.description
                })
            });

            const result = await response.json();
            console.log(">>> [DEBUG] handleSaveExperienceItem Result:", result);

            if (response.ok && result.status === 'success') {
                const updatedList = [...experiences];
                // Map TimelineDTO fields back to frontend state fields
                updatedList[index] = { 
                    id: result.data.id,
                    company: result.data.subtitle, // TimelineDTO.subtitle -> frontend.company
                    role: result.data.title,       // TimelineDTO.title -> frontend.role
                    duration: result.data.duration, // TimelineDTO.duration -> frontend.duration
                    description: result.data.description, // TimelineDTO.description -> frontend.description
                    isEditing: false 
                };
                setExperiences(updatedList);
                alert("Cập nhật Kinh nghiệm làm việc thành công!");
            } else {
                const updatedList = [...experiences];
                updatedList[index].id = item.id || Date.now();
                updatedList[index].isEditing = false;
                setExperiences(updatedList);
                alert("Lưu offline kinh nghiệm thành công.");
            }
        } catch (error) {
            console.error("Lỗi API Experience:", error);
            const updatedList = [...experiences];
            updatedList[index].id = item.id || Date.now();
            updatedList[index].isEditing = false;
            setExperiences(updatedList);
            alert("Lưu dữ liệu cục bộ thành công!");
        }
    };

    const handleDeleteExperienceItem = async (index) => {
        const item = experiences[index];
        if (!item.id) {
            setExperiences(experiences.filter((_, idx) => idx !== index));
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn gỡ bỏ mục kinh nghiệm việc làm này?")) return;

        try {
            const response = await fetch(`http://localhost:8080/api/v1/profile/experience/${item.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setExperiences(experiences.filter((_, idx) => idx !== index));
                alert("Đã xóa bản ghi kinh nghiệm làm việc!");
            } else {
                setExperiences(experiences.filter((_, idx) => idx !== index));
                alert("Đã gỡ bỏ khỏi giao diện.");
            }
        } catch (error) {
            console.error("Lỗi API khi xóa experience:", error);
            setExperiences(experiences.filter((_, idx) => idx !== index));
        }
    };

    const toggleInlineEdit = (type, index, value) => {
        if (type === 'edu') {
            const updated = [...educations];
            updated[index].isEditing = value;
            setEducations(updated);
        } else if (type === 'exp') {
            const updated = [...experiences];
            updated[index].isEditing = value;
            setExperiences(updated);
        }
    };

    const handleInlineChange = (type, index, field, value) => {
        if (type === 'edu') {
            const updated = [...educations];
            updated[index][field] = value;
            setEducations(updated);
        } else if (type === 'exp') {
            const updated = [...experiences];
            updated[index][field] = value;
            setExperiences(updated);
        }
    };

    // ==========================================
    // CÁC HÀM XỬ LÝ HÀNH ĐỘNG KHÁC (GIỮ NGUYÊN LOGIC)
    // ==========================================
    const handleSaveBasicInfo = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/profile/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    phone: basicInfo.phone,
                    country: basicInfo.country,
                    city: basicInfo.city,
                    description: basicInfo.bio
                })
            });
            if (response.ok) {
                alert("Đã lưu thông tin cơ bản thành công!");
                setIsEditingBasic(false);
            }
        } catch (error) {
            console.error("Lỗi cập nhật profile:", error);
        } finally {
            setIsEditingBasic(false);
        }
    };

    const handleConnectStripeBilling = async () => {
        setBankLoading(true);
        try {
            if (accountStatus.linkedBank) {
                // TRƯỜNG HỢP 1: Đã liên kết, thực hiện đồng bộ (Verify)
                const response = await fetch('http://localhost:8080/api/v1/profile/me/verify-bank', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    alert("Đồng bộ trạng thái định danh Stripe thành công!");
                    fetchProfileData(); // Gọi lại để cập nhật trạng thái linkedBank và verified
                } else {
                    alert(result.message || "Bạn chưa hoàn tất xác thực trên trang Stripe.");
                }
            } else {
                // TRƯỜNG HỢP 2: Chưa liên kết, khởi tạo link Onboarding
                const response = await fetch('http://localhost:8080/api/v1/profile/me/bank-setup', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const result = await response.json();
                if (response.ok && result.data?.onboardingUrl) {
                    window.location.href = result.data.onboardingUrl;
                } else {
                    alert(result.message || "Lỗi thiết lập ngân hàng");
                }
            }
        } catch (error) {
            console.error("Stripe Error:", error);
            alert("Lỗi kết nối máy chủ Stripe.");
        } finally {
            setBankLoading(false);
        }
    };

    // ==========================================
    // LOGIC TÍCH HỢP API: THAY ĐỔI MẬT KHẨU
    // ==========================================
    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        
        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            alert("Vui lòng điền đầy đủ các thông tin mật khẩu!");
            return;
        }

        // Kiểm tra độ mạnh của mật khẩu mới (Tiêu chuẩn: 8+ ký tự, Hoa, Thường, Số, Ký tự đặc biệt)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(passwordData.newPassword)) {
            alert("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt (@$!%*?&).");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Mật khẩu xác nhận không trùng khớp!");
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword,
                    confirmNewPassword: passwordData.confirmPassword
                })
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                alert(result.message || "Đổi mật khẩu thành công!");
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                // Hiển thị thông báo lỗi cụ thể từ Backend (ví dụ: "Mật khẩu cũ không chính xác!")
                alert(result.message || "Đã có lỗi xảy ra trong quá trình đổi mật khẩu.");
            }
        } catch (error) {
            console.error("🚩 Lỗi API Change Password:", error.message);
            alert("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
        }
    };

    return (
        <div className="my-profile-container-layout">
            
            {/* KHỐI 1: GRID PHÍA TRÊN (AVATAR & THÔNG TIN CƠ BẢN) */}
            <div className="profile-grid-top-card-wrapper">
                
                {/* Khối bên trái: Ảnh Đại Diện */}
                <div className="avatar-upload-segment-box">
                    <div className="avatar-circle-display">
                        <img 
                            src={avatarUrl} 
                            alt="User Avatar Preview" 
                        />
                        <input 
                            type="file"
                            id="avatar-file-input"
                            hidden
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                        <div className="avatar-edit-overlay-btn" onClick={triggerAvatarUpload} title="Tải ảnh mới lên">
                            <Upload size={16} />
                        </div>
                    </div>
                    <h2>{basicInfo.fullName || "Họ và Tên"}</h2>
                    <span className="role-tag-pill">
                        {userRole === 'seller' ? 'Chuyên gia (Seller)' : 'Khách hàng (Buyer)'}
                    </span>
                </div>

                {/* Khối bên phải: Thông tin cơ bản dạng form */}
                <div className="basic-info-fields-segment-box">
                    <div className="segment-header-action-row">
                        <h3>Thông tin tài khoản</h3>
                        {isEditingBasic ? (
                            <div className="edit-mode-action-buttons-group">
                                <button className="btn-save-check" onClick={handleSaveBasicInfo} title="Lưu lại">
                                    <Check size={16} />
                                </button>
                                <button 
                                    className="btn-cancel-x" 
                                    onClick={() => {
                                        // Khôi phục lại dữ liệu cũ từ bản sao tạm thời
                                        setBasicInfo(tempBasicInfo);
                                        setIsEditingBasic(false);
                                    }} 
                                    title="Hủy bỏ"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button className="btn-trigger-edit" onClick={() => {
                                // Lưu lại bản sao của dữ liệu hiện tại trước khi cho phép sửa
                                setTempBasicInfo({...basicInfo});
                                setIsEditingBasic(true);
                            }}>
                                <PenSquare size={14} /> Chỉnh sửa
                            </button>
                        )}
                    </div>

                    <div className="basic-profile-form-grid">
                        <div className="form-group">
                            <label>Họ và tên</label>
                            <input 
                                type="text" 
                                disabled={!isEditingBasic}
                                value={basicInfo.fullName}
                                onChange={(e) => setBasicInfo({...basicInfo, fullName: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ Email</label>
                            <input 
                                type="email" 
                                disabled={true} 
                                value={basicInfo.email}
                                placeholder="example@domain.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input 
                                type="text" 
                                disabled={!isEditingBasic}
                                value={basicInfo.phone}
                                onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Thành phố</label>
                            <input 
                                type="text" 
                                placeholder="Ví dụ: Hà Nội, Hồ Chí Minh"
                                disabled={!isEditingBasic}
                                value={basicInfo.city}
                                onChange={(e) => setBasicInfo({...basicInfo, city: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Quốc gia cư trú</label>
                            <select 
                                disabled={!isEditingBasic}
                                value={basicInfo.country}
                                onChange={(e) => setBasicInfo({...basicInfo, country: e.target.value})}
                            >
                                {popularCountries.map((c, i) => <option key={i} value={c}>{c}</option>)}
                            </select>
                        </div>
                        
                        {/* 🔒 ĐIỀU KIỆN: Chỉ hiển thị ô Giới thiệu bản thân khi tài khoản là SELLER */}
                        {userRole === 'seller' && (
                            <div className="form-group full-row-item">
                                <label>Giới thiệu bản thân (Bio)</label>
                                <textarea 
                                    rows={5} 
                                    className="bio-textarea-control"
                                    placeholder="Viết mô tả ngắn về năng lực, kinh nghiệm cá nhân của bạn..."
                                    disabled={!isEditingBasic}
                                    value={basicInfo.bio}
                                    onChange={(e) => setBasicInfo({...basicInfo, bio: e.target.value})}
                                />
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* 🔒 ĐIỀU KIỆN: Chỉ hiển thị khối cổng tài chính STRIPE CONNECT khi tài khoản là SELLER */}
            {userRole === 'seller' && (
                <div className="profile-section-card-block stripe-billing-card-highlight">
                    <div className="stripe-flex-box-content">
                        <div>
                            <div className="title-with-icon-row">
                                <CreditCard className="billing-icon" size={20} />
                                <h3>Cổng liên kết rút tiền & Thanh toán quốc tế (Stripe)</h3>
                            </div>
                            <p className="billing-description-text">
                                Hệ thống Freelance Marketplace kết nối trực tiếp với cổng tài chính Stripe để tự động hóa xử lý dòng tiền, rút doanh thu bảo mật cao.
                            </p>
                            <div className="stripe-status-badges-group">
                                <span className={`status-badge-pill ${accountStatus.linkedBank ? 'active' : 'inactive'}`}>
                                    {accountStatus.linkedBank ? '● Đã liên kết tài khoản' : '○ Chưa kết nối ví'}
                                </span>
                                {accountStatus.verified && (
                                    <span className="status-badge-pill verified">✓ Định danh hồ sơ thành công</span>
                                )}
                            </div>
                        </div>
                        <button 
                            type="button" 
                            className="btn-stripe-connect-action" 
                            onClick={handleConnectStripeBilling}
                            disabled={bankLoading}
                        >
                            {bankLoading ? <RefreshCw className="animate-spin" size={14} /> : <ArrowUpRight size={14} />}
                            {accountStatus.linkedBank ? 'Đồng bộ trạng thái Stripe' : 'Bắt đầu thiết lập liên kết'}
                        </button>
                    </div>
                </div>
            )}

            {/* 🔒 ĐIỀU KIỆN: Chỉ hiển thị khối danh mục lưới 2 cột HỌC VẤN & KINH NGHIỆM khi tài khoản là SELLER */}
            {userRole === 'seller' && (
                <div className="profile-two-column-flex-grid">
                    
                    {/* CỘT TRÁI: HỌC VẤN VÀ BẰNG CẤP (EDUCATION - ĐÃ CẬP NHẬT TRƯỜNG DESCRIPTION) */}
                    <div className="profile-section-card-block flex-item-card">
                        <div className="segment-header-action-row">
                            <h3>Học vấn & Bằng cấp</h3>
                            <button type="button" className="btn-add-new-row" onClick={handleAddEducationRow}>
                                <Plus size={14} /> Thêm trường
                            </button>
                        </div>

                        <div className="profile-list-vertical-stack">
                            {educations.length === 0 ? (
                                <p className="empty-fallback-text-style">Chưa cập nhật thông tin học vấn nào.</p>
                            ) : (
                                educations.map((edu, index) => (
                                    <div key={edu.id || index} className="dynamic-data-row-item">
                                        {edu.isEditing ? (
                                            <div className="inline-edit-form-wrapper-grid">
                                                <input 
                                                    type="text" 
                                                    placeholder="Tên trường học (e.g. Đại học Bách Khoa)" 
                                                    value={edu.school}
                                                    onChange={(e) => handleInlineChange('edu', index, 'school', e.target.value)}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Chuyên ngành / Bằng cấp (e.g. Cử nhân CNTT)" 
                                                    value={edu.degree}
                                                    onChange={(e) => handleInlineChange('edu', index, 'degree', e.target.value)}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Niên khóa (e.g. 2020 - 2024)" 
                                                    value={edu.year}
                                                    onChange={(e) => handleInlineChange('edu', index, 'year', e.target.value)}
                                                />
                                                {/* 🆕 Ô NHẬP MÔ TẢ MỚI ĐƯỢC THÊM CHO PHẦN HỌC VẤN */}
                                                <input 
                                                    type="text" 
                                                    placeholder="Mô tả ngắn gọn về thành tích hoặc đồ án của bạn" 
                                                    value={edu.description || ''}
                                                    onChange={(e) => handleInlineChange('edu', index, 'description', e.target.value)}
                                                />
                                                <div className="row-item-action-footer-buttons">
                                                    <button type="button" className="btn-save-inline-item" onClick={() => handleSaveEducationItem(index)}>
                                                        Lưu dòng
                                                    </button>
                                                    <button type="button" className="btn-delete-row-item text-red" onClick={() => handleDeleteEducationItem(index)}>
                                                        Hủy / Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="static-display-data-row">
                                                <div className="data-row-left-content" onClick={() => toggleInlineEdit('edu', index, true)} style={{cursor: 'pointer'}} title="Click để chỉnh sửa">
                                                    <h4>{edu.school}</h4>
                                                    <p className="subtitle-content-text">{edu.degree} ({edu.year})</p>
                                                    {/* 🆕 HIỂN THỊ MÔ TẢ ĐÃ LƯU CỦA HỌC VẤN */}
                                                    <p className="desc-content-text-muted">{edu.description}</p>
                                                </div>
                                                <button type="button" className="btn-icon-only-delete" onClick={() => handleDeleteEducationItem(index)}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* CỘT PHẢI: KINH NGHIỆM LÀM VIỆC (EXPERIENCE) */}
                    <div className="profile-section-card-block flex-item-card">
                        <div className="segment-header-action-row">
                            <h3>Kinh nghiệm làm việc</h3>
                            <button type="button" className="btn-add-new-row" onClick={handleAddExperienceRow}>
                                <Plus size={14} /> Thêm vị trí
                            </button>
                        </div>

                        <div className="profile-list-vertical-stack">
                            {experiences.length === 0 ? (
                                <p className="empty-fallback-text-style">Chưa cập nhật kinh nghiệm làm việc.</p>
                            ) : (
                                experiences.map((exp, index) => (
                                    <div key={exp.id || index} className="dynamic-data-row-item">
                                        {exp.isEditing ? (
                                            <div className="inline-edit-form-wrapper-grid">
                                                <input 
                                                    type="text" 
                                                    placeholder="Tên công ty / Doanh nghiệp" 
                                                    value={exp.company}
                                                    onChange={(e) => handleInlineChange('exp', index, 'company', e.target.value)}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Vị trí đảm nhiệm (e.g. Project Manager)" 
                                                    value={exp.role}
                                                    onChange={(e) => handleInlineChange('exp', index, 'role', e.target.value)}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Thời gian làm việc (e.g. 2022 - 2024)" 
                                                    value={exp.duration}
                                                    onChange={(e) => handleInlineChange('exp', index, 'duration', e.target.value)}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Mô tả công việc đạt được ngắn gọn" 
                                                    value={exp.description}
                                                    onChange={(e) => handleInlineChange('exp', index, 'description', e.target.value)}
                                                />
                                                <div className="row-item-action-footer-buttons">
                                                    <button type="button" className="btn-save-inline-item" onClick={() => handleSaveExperienceItem(index)}>
                                                        Lưu dòng
                                                    </button>
                                                    <button type="button" className="btn-delete-row-item text-red" onClick={() => handleDeleteExperienceItem(index)}>
                                                        Hủy / Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="static-display-data-row">
                                                <div className="data-row-left-content" onClick={() => toggleInlineEdit('exp', index, true)} style={{cursor: 'pointer'}} title="Click để chỉnh sửa">
                                                    <h4>{exp.company}</h4>
                                                    <p className="subtitle-content-text">{exp.role} ({exp.duration})</p>
                                                    <p className="desc-content-text-muted">{exp.description}</p>
                                                </div>
                                                <button type="button" className="btn-icon-only-delete" onClick={() => handleDeleteExperienceItem(index)}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            )}

            {/* KHỐI TẬP TRUNG CUỐI CÙNG: ĐỔI MẬT KHẨU (CẢ BUYER VÀ SELLER ĐỀU THẤY) */}
            <div className="profile-section-card-block">
                <div className="segment-header-action-row">
                    <h3>Bảo mật & Thay đổi mật khẩu</h3>
                </div>
                <form onSubmit={handlePasswordChangeSubmit}>
                    <div className="basic-profile-form-grid stack-column-form">
                        <div className="form-group">
                            <label>Mật khẩu hiện tại</label>
                            <input 
                                type="password" 
                                placeholder="********" 
                                value={passwordData.oldPassword} 
                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu mới</label>
                            <input 
                                type="password" 
                                placeholder="********" 
                                value={passwordData.newPassword} 
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Xác nhận mật khẩu mới</label>
                            <input 
                                type="password" 
                                placeholder="********" 
                                value={passwordData.confirmPassword} 
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-submit-action">Đổi mật khẩu <ArrowUpRight size={16} /></button>
                </form>
            </div>

        </div>
    );
};

export default MyProfile;