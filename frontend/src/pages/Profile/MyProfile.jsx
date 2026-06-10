// src/pages/Profile/MyProfile.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Plus, PenSquare, ArrowUpRight } from 'lucide-react';
import './MyProfile.css';

const MyProfile = () => {
    // 🎭 Trạng thái vai trò hệ thống: Tự động cập nhật dựa theo tài khoản đăng nhập
    const [userRole, setUserRole] = useState('buyer');

    // 🔧 ĐÃ SỬA: Đọc trực tiếp từ key 'role' riêng lẻ trong LocalStorage để khớp với ảnh F12
    useEffect(() => {
        const storedRole = localStorage.getItem('role'); // Lấy trực tiếp chuỗi "ROLE_SELLER" hoặc "ROLE_BUYER"
        if (storedRole) {
            const normalizedRole = storedRole.toLowerCase();
            if (normalizedRole.includes('seller')) {
                setUserRole('seller');
            } else {
                setUserRole('buyer');
            }
        }
    }, []);

    // 📦 MOCK DATA: Thông tin cơ bản chung
    const [profileData, setProfileData] = useState({
        username: 'kien_developer',
        email: 'thuckien@example.com',
        phone: '0987654321',
        tagline: 'Fullstack Web & Mobile Developer',
        country: 'Vietnam',
        city: 'Ho Chi Minh',
        description: 'I am a passionate software engineer with experience building secure backend systems and modern frontend user interfaces.',
        avatar: 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg'
    });

    // 📦 MOCK DATA: Phần Kỹ năng (Chỉ dành cho Seller)
    const [skills, setSkills] = useState([
        { id: 1, name: 'Developer', point: '90' },
        { id: 2, name: 'Designer', point: '60' }
    ]);

    // 📦 MOCK DATA: Phần Học vấn (Chỉ dành cho Seller)
    const [education, setEducation] = useState([
        { id: 1, duration: '2012 - 2014', degree: 'Bachelors in Computer Science', school: 'Harvard University', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' }
    ]);

    // 📦 MOCK DATA: Phần Kinh nghiệm (Chỉ dành cho Seller)
    const [experience, setExperience] = useState([
        { id: 1, duration: '2022 - Present', role: 'UX Designer', company: 'Dropbox', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' }
    ]);

    // 📦 MOCK DATA: Đổi mật khẩu
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN GIẢ LẬP (MOCK ACTIONS) ---
    const handleInputChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSaveBasicInfo = (e) => {
        e.preventDefault();
        alert('Saved basic profile details successfully! (Mock Data)');
    };

    const handleSaveSkills = (e) => {
        e.preventDefault();
        alert('Saved skills inventory successfully! (Mock Data)');
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        alert('Password updated successfully! (Mock Data)');
    };

    return (
        <div className="my-profile-container">
            {/* Header Tiêu đề Trang */}
            <div className="profile-page-header">
                <div>
                    <h1>My Profile</h1>
                    <p>Manage your account settings and profile information.</p>
                </div>
                <div className="role-switcher">
                    <span className="role-badge">Role Mode: <strong>{userRole.toUpperCase()}</strong></span>
                </div>
            </div>

            {/* SECTION 1: PROFILE DETAILS (CHUNG CHO CẢ BUYER VÀ SELLER) */}
            <div className="profile-section-card">
                <h3>Profile Details</h3>
                <hr className="section-divider" />
                <form onSubmit={handleSaveBasicInfo}>
                    <div className="avatar-upload-wrapper">
                        <img src={profileData.avatar} alt="Avatar" className="profile-preview-avatar" />
                        <div className="avatar-actions">
                            <button type="button" className="btn-upload-img"><Upload size={14} /> Upload Images</button>
                            <button type="button" className="btn-delete-img"><Trash2 size={14} /></button>
                            <p className="upload-hint">Max file size is 1MB, Minimum dimension: 330x300. Suitable files are .jpg & .png</p>
                        </div>
                    </div>

                    <div className="profile-form-grid">
                        <div className="form-group">
                            <label>Username</label>
                            <input type="text" name="username" value={profileData.username} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={profileData.email} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="text" name="phone" value={profileData.phone} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Tagline</label>
                            <input type="text" name="tagline" value={profileData.tagline} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <select name="country" value={profileData.country} onChange={handleInputChange}>
                                <option value="Vietnam">Vietnam</option>
                                <option value="Turkey">Turkey</option>
                                <option value="USA">United States</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>City</label>
                            <input type="text" name="city" value={profileData.city} onChange={handleInputChange} />
                        </div>
                    </div>

                    {/* Ô Introduce Yourself chỉ xuất hiện nếu là Seller */}
                    {userRole === 'seller' && (
                        <div className="form-group full-width-group" style={{ marginTop: '20px' }}>
                            <label>Introduce Yourself</label>
                            <textarea name="description" rows="5" value={profileData.description} onChange={handleInputChange} placeholder="Description"></textarea>
                        </div>
                    )}

                    <button type="submit" className="btn-submit-action">Save <ArrowUpRight size={16} /></button>
                </form>
            </div>

            {/* 🔴 ĐIỀU KIỆN PHÂN QUYỀN: CHỈ SELLER MỚI HIỂN THỊ CÁC SECTION DƯỚI ĐÂY */}
            {userRole === 'seller' && (
                <>
                    {/* SECTION 2: SKILLS (SELLER ONLY) */}
                    <div className="profile-section-card">
                        <h3>Skills</h3>
                        <hr className="section-divider" />
                        <form onSubmit={handleSaveSkills}>
                            {skills.map((skill, index) => (
                                <div className="profile-form-grid key-value-row" key={skill.id}>
                                    <div className="form-group">
                                        <label>Skills {index + 1}</label>
                                        <select defaultValue={skill.name}>
                                            <option value="Developer">Developer</option>
                                            <option value="Designer">Designer</option>
                                            <option value="Video Editor">Video Editor</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Point</label>
                                        <select defaultValue={skill.point}>
                                            <option value="90">90</option>
                                            <option value="75">75</option>
                                            <option value="60">60</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                            <button type="submit" className="btn-submit-action">Save <ArrowUpRight size={16} /></button>
                        </form>
                    </div>

                    {/* SECTION 3: EDUCATION (SELLER ONLY) */}
                    <div className="profile-section-card">
                        <div className="section-card-header">
                            <h3>Education</h3>
                            <button type="button" className="btn-add-timeline-item"><Plus size={14} /> Add Education</button>
                        </div>
                        <hr className="section-divider" />
                        <div className="timeline-list">
                            {education.map((edu) => (
                                <div className="timeline-item" key={edu.id}>
                                    <div className="timeline-badge-year">{edu.duration}</div>
                                    <div className="timeline-content-body">
                                        <h4>{edu.degree}</h4>
                                        <h5 className="timeline-sub-institution">{edu.school}</h5>
                                        <p>{edu.desc}</p>
                                    </div>
                                    <div className="timeline-item-actions">
                                        <button className="action-circle-btn edit-btn"><PenSquare size={14} /></button>
                                        <button className="action-circle-btn delete-btn"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="btn-submit-action">Save <ArrowUpRight size={16} /></button>
                    </div>

                    {/* SECTION 4: WORK & EXPERIENCE (SELLER ONLY) */}
                    <div className="profile-section-card">
                        <div className="section-card-header">
                            <h3>Work & Experience</h3>
                            <button type="button" className="btn-add-timeline-item"><Plus size={14} /> Add Experience</button>
                        </div>
                        <hr className="section-divider" />
                        <div className="timeline-list">
                            {experience.map((exp) => (
                                <div className="timeline-item" key={exp.id}>
                                    <div className="timeline-badge-year">{exp.duration}</div>
                                    <div className="timeline-content-body">
                                        <h4>{exp.role}</h4>
                                        <h5 className="timeline-sub-institution">{exp.company}</h5>
                                        <p>{exp.desc}</p>
                                    </div>
                                    <div className="timeline-item-actions">
                                        <button className="action-circle-btn edit-btn"><PenSquare size={14} /></button>
                                        <button className="action-circle-btn delete-btn"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="btn-submit-action">Save <ArrowUpRight size={16} /></button>
                    </div>
                </>
            )}

            {/* SECTION 5: CHANGE PASSWORD (CHUNG CHO CẢ HAI VAI TRÒ) */}
            <div className="profile-section-card">
                <h3>Change password</h3>
                <hr className="section-divider" />
                <form onSubmit={handlePasswordChange}>
                    <div className="password-form-stack">
                        <div className="form-group">
                            <label>Old Password</label>
                            <input 
                                type="password" 
                                placeholder="********" 
                                value={passwordData.oldPassword} 
                                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input 
                                type="password" 
                                placeholder="********" 
                                value={passwordData.newPassword} 
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input 
                                type="password" 
                                placeholder="********" 
                                value={passwordData.confirmPassword} 
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-submit-action">Change Password <ArrowUpRight size={16} /></button>
                </form>
            </div>
        </div>
    );
};

export default MyProfile;