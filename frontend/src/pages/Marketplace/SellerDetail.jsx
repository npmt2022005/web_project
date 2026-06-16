// src/pages/Marketplace/SellerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, MapPin, Star, ArrowLeft, Mail, Calendar, CheckCircle, GraduationCap, Briefcase, CreditCard } from 'lucide-react';
import './SellerDetail.css'; 

const SellerDetail = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);

    // 📦 HỆ THỐNG MOCK DATA CHUẨN - PHỤC VỤ CHẾ ĐỘ XEM TRƯỚC VÀ KIỂM THỬ GIAO DIỆN
    const MOCK_SELLERS = [
        { 
            id: 1, 
            fullname: "Phan Trung Kiên", 
            title: "Fullstack Java Developer", 
            country: "Vietnam", 
            city: "Hồ Chí Minh",
            bio: "Chuyên gia xây dựng hệ thống Backend Spring Boot 3x, tối ưu hóa cơ sở dữ liệu MySQL và tích hợp bảo mật JWT/Spring Security. Đã có hơn 5 năm kinh nghiệm làm việc với các hệ thống lớn, chịu tải cao và kiến trúc Microservices.", 
            rating: 5.0, 
            skills: ["Java", "Spring Boot", "MySQL", "JWT", "RESTful API"], 
            email: "kien.phan@example.com", 
            joinedDate: "Tháng 01/2024",
            linkedBank: true, // Đồng bộ trạng thái liên kết ví tài chính thành công
            educations: [
                { id: 101, school: 'Đại học Bách Khoa', degree: 'Kỹ sư Phần mềm', year: '2021 - 2025', description: 'Tốt nghiệp loại giỏi, hoàn thành đồ án xuất sắc về chủ đề kiến trúc Microservices.' },
                { id: 102, school: 'FPT Aptech', degree: 'Chứng chỉ Lập trình viên Quốc tế', year: '2019 - 2021', description: 'Học chuyên sâu về lập trình hướng đối tượng OOP và cơ sở dữ liệu quan hệ.' }
            ],
            experiences: [
                { id: 201, company: 'FPT Software', role: 'Java Backend Developer', duration: '2024 - Hiện tại', description: 'Phát triển hệ thống microservices và tích hợp cổng thanh toán giao dịch tự động.' },
                { id: 202, company: 'VNG Corporation', role: 'Fullstack Web Intern', duration: '6 tháng năm 2023', description: 'Hỗ trợ thiết kế giao diện bảng điều khiển quản trị bằng ReactJS và xây dựng RESTful API.' }
            ],
            reviews: [
                { id: 1, buyerName: "Trần Văn A", rating: 5, date: "12/05/2026", comment: "Sản phẩm bàn giao đúng hạn, code backend chạy rất mượt và cấu trúc rõ ràng. Sẽ tiếp tục hợp tác lâu dài!" },
                { id: 2, buyerName: "Lê Thị B", rating: 5, date: "28/04/2026", comment: "Chuyên gia tư vấn rất nhiệt tình, tối ưu hóa database MySQL xong hệ thống chạy nhanh hơn hẳn." }
            ]
        },
        { 
            id: 2, 
            fullname: "Alex Johnson", 
            title: "UI/UX Expert & Frontend Engineer", 
            country: "United States", 
            city: "New York",
            bio: "Thiết kế giao diện người dùng hiện đại với Figma, phát triển ứng dụng SPA chuẩn ReactJS, tối ưu hóa hiệu năng và Responsive.", 
            rating: 4.9, 
            skills: ["ReactJS", "Figma", "Tailwind CSS"], 
            email: "alex.j@example.com", 
            joinedDate: "Tháng 03/2024",
            linkedBank: false, // Chưa liên kết thanh toán
            educations: [
                { id: 103, school: 'Stanford University', degree: 'Bachelor of Computer Science', year: '2018 - 2022', description: 'Focused on Human-Computer Interaction and UI/UX paradigms.' }
            ],
            experiences: [
                { id: 203, company: 'Google Inc', role: 'UI/UX Designer', duration: '2022 - 2025', description: 'Designed wireframes and interactive prototypes for core application modules.' }
            ],
            reviews: [
                { id: 3, buyerName: "Michael Khương", rating: 4.9, date: "01/06/2026", comment: "Giao diện Figma thiết kế đỉnh cao, đúng chuẩn UI/UX hiện đại." }
            ]
        }
    ];

    useEffect(() => {
        const loadMockSellerData = () => {
            setLoading(true);
            // Lọc tìm Seller theo ID trên thanh điều hướng URL, mặc định lấy seller đầu tiên nếu không khớp id
            const found = MOCK_SELLERS.find(s => s.id === parseInt(id));
            setSeller(found || MOCK_SELLERS[0]);
            setLoading(false);
        };

        loadMockSellerData();
    }, [id]);

    if (loading) {
        return <div className="seller-detail-loading">Đang tải thông tin chuyên gia...</div>;
    }

    if (!seller) {
        return <div className="seller-detail-error">Không tìm thấy thông tin freelancer này.</div>;
    }

    return (
        <div className="seller-detail-container">
            {/* Nút quay lại */}
            <button onClick={() => navigate(-1)} className="seller-detail-back-btn">
                <ArrowLeft size={16} /> Quay lại trang trước
            </button>

            {/* Khung thông tin chính */}
            <div className="seller-detail-card">
                {/* Phần Header Profile */}
                <div className="seller-detail-header">
                    <div className="seller-detail-avatar">
                        <User size={40} />
                    </div>
                    
                    <div className="seller-detail-info">
                        <div className="seller-detail-name-wrapper">
                            <h1 className="seller-detail-fullname">{seller.fullname}</h1>
                            <span className="seller-detail-badge">
                                <CheckCircle size={12} fill="#1dbf73" color="#fff" /> Đã xác minh
                            </span>
                        </div>
                        
                        <p className="seller-detail-title">{seller.title}</p>
                        
                        <div className="seller-detail-meta">
                            <span className="seller-detail-meta-item">
                                <MapPin size={14} /> {seller.city ? `${seller.city}, ${seller.country}` : seller.country}
                            </span>
                            <span className="seller-detail-meta-item">
                                <Calendar size={14} /> Đã tham gia: {seller.joinedDate || "Tháng 01/2024"}
                            </span>
                            {/* Hiển thị huy hiệu trạng thái thanh toán tài chính */}
                            {seller.linkedBank && (
                                <span className="seller-detail-meta-item seller-stripe-badge" style={{ color: '#1dbf73', fontWeight: '500' }}>
                                    <CreditCard size={14} /> Bảo chứng cổng Stripe
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Điểm đánh giá */}
                    <div className="seller-detail-rating-box">
                        <div className="seller-detail-rating-score">
                            <Star size={18} fill="#ffb33e" color="#ffb33e" /> {seller.rating?.toFixed(1)}
                        </div>
                        <span className="seller-detail-rating-label">
                            {seller.reviews ? `${seller.reviews.length} Đánh giá` : "Đánh giá chung"}
                        </span>
                    </div>
                </div>

                <hr className="seller-detail-divider" />

                {/* Phần giới thiệu bản thân */}
                <div className="seller-detail-section">
                    <h3 className="seller-detail-section-title">Giới thiệu bản thân</h3>
                    <p className="seller-detail-bio">
                        {seller.bio}
                    </p>
                </div>

                {/* Phần danh sách kỹ năng */}
                <div className="seller-detail-section">
                    <h3 className="seller-detail-section-title">Kỹ năng chuyên môn</h3>
                    <div className="seller-detail-skills-list">
                        {seller.skills?.map((skill, idx) => (
                            <span key={idx} className="seller-detail-skill-item">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <hr className="seller-detail-divider" />

                {/* KHỐI HIỂN THỊ ĐỘNG 2 CỘT: HỌC VẤN & KINH NGHIỆM TƯƠNG THÍCH VỚI HỒ SƠ */}
                <div className="seller-detail-history-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', margin: '24px 0' }}>
                    
                    {/* Khối Học vấn */}
                    <div className="seller-detail-history-section">
                        <h3 className="seller-detail-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <GraduationCap size={18} color="#1dbf73" /> Học vấn & Bằng cấp
                        </h3>
                        <div className="seller-detail-history-list" style={{ marginTop: '12px' }}>
                            {!seller.educations || seller.educations.length === 0 ? (
                                <p style={{ color: '#74767e', fontSize: '14px' }}>Chưa cập nhật thông tin học vấn.</p>
                            ) : (
                                seller.educations.map((edu, idx) => (
                                    <div key={edu.id || idx} style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f4f5f7' }}>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#222325' }}>{edu.school}</h4>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#62646a', fontWeight: '500' }}>{edu.degree} ({edu.year})</p>
                                        <p style={{ margin: '0', fontSize: '13px', color: '#74767e', fontStyle: 'italic' }}>{edu.description}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Khối Kinh nghiệm việc làm */}
                    <div className="seller-detail-history-section">
                        <h3 className="seller-detail-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Briefcase size={18} color="#1dbf73" /> Kinh nghiệm làm việc
                        </h3>
                        <div className="seller-detail-history-list" style={{ marginTop: '12px' }}>
                            {!seller.experiences || seller.experiences.length === 0 ? (
                                <p style={{ color: '#74767e', fontSize: '14px' }}>Chưa cập nhật kinh nghiệm làm việc.</p>
                            ) : (
                                seller.experiences.map((exp, idx) => (
                                    <div key={exp.id || idx} style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f4f5f7' }}>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#222325' }}>{exp.company}</h4>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#62646a', fontWeight: '500' }}>{exp.role} ({exp.duration})</p>
                                        <p style={{ margin: '0', fontSize: '13px', color: '#74767e' }}>{exp.description}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                <hr className="seller-detail-divider" />

                {/* KHỐI PHẢN HỒI & ĐÁNH GIÁ (REVIEWS & COMMENTS) CỦA NGƯỜI MUA */}
                <div className="seller-detail-section seller-reviews-container" style={{ margin: '24px 0' }}>
                    <h3 className="seller-detail-section-title" style={{ marginBottom: '16px' }}>
                        Đánh giá từ khách hàng ({seller.reviews?.length || 0})
                    </h3>
                    <div className="seller-reviews-stack" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {!seller.reviews || seller.reviews.length === 0 ? (
                            <p style={{ color: '#74767e', fontSize: '14px', fontStyle: 'italic' }}>Chuyên gia chưa nhận được đánh giá nào từ các đơn hàng.</p>
                        ) : (
                            seller.reviews.map((rev, idx) => (
                                <div key={rev.id || idx} className="review-comment-card" style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #e4e5e7' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e4e5e7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={16} color="#62646a" />
                                            </div>
                                            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#222325' }}>{rev.buyerName}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#74767e' }}>
                                            <div style={{ display: 'flex', color: '#ffb33e' }}>
                                                {[...Array(Math.floor(rev.rating))].map((_, i) => (
                                                    <Star key={i} size={14} fill="#ffb33e" color="#ffb33e" />
                                                ))}
                                            </div>
                                            <span>• {rev.date}</span>
                                        </div>
                                    </div>
                                    <p style={{ margin: '0', fontSize: '14px', color: '#404145', lineHeight: '1.5' }}>{rev.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <hr className="seller-detail-divider" />

                {/* Khối liên hệ nhanh */}
                <div className="seller-detail-footer">
                    <div className="seller-detail-contact">
                        <span className="seller-detail-contact-label">Địa chỉ Email công việc</span>
                        <span className="seller-detail-contact-value">
                            <Mail size={14} /> {seller.email || "Liên hệ qua hệ thống"}
                        </span>
                    </div>
                    <button className="seller-detail-contact-btn">
                        Liên hệ công việc
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellerDetail;