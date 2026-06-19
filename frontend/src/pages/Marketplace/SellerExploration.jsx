// src/pages/Marketplace/SellerExploration.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, User, MapPin, Globe, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const SellerExploration = () => {
    const navigate = useNavigate();

    // 📦 State lưu danh sách Seller (Gốc từ API hoặc Fallback Mock Data)
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔍 State quản lý các tiêu chí bộ lọc tìm kiếm
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [sortBy, setSortBy] = useState('all'); // Các tùy chọn: 'all', 'best_rating', 'multi_skills'

    // 📄 State quản lý phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; // 🌟 ĐÃ SỬA: Hiển thị tối đa 9 profile seller trong 1 trang

    // State phục vụ hiệu ứng ẩn/hiện chữ khi hover cho dropdown
    const [hoverSort, setHoverSort] = useState(false);
    const [focusSort, setFocusSort] = useState(false);
    const [hoverCountry, setHoverCountry] = useState(false);
    const [focusCountry, setFocusCountry] = useState(false);

    // Danh sách 20 quốc gia phục vụ bộ lọc (Khớp dữ liệu bảng Profile của bạn)
    const popularCountries = [
        "Vietnam", "United States", "United Kingdom", "Singapore", "Japan",
        "South Korea", "Australia", "Canada", "France", "Germany",
        "Thailand", "Malaysia", "Indonesia", "Philippines", "India",
        "China", "Netherlands", "Sweden", "Switzerland", "New Zealand"
    ];

    // ⚡ Giả lập Mock Data mở rộng (12 Sellers) để test giao diện phân trang (> 9 dòng) và bộ lọc
    const MOCK_SELLERS = [
        { id: 1, fullname: "Phan Trung Kiên", title: "Fullstack Java Developer", country: "Vietnam", bio: "Chuyên gia xây dựng hệ thống Backend Spring Boot 3x, tối ưu hóa cơ sở dữ liệu MySQL và tích hợp bảo mật JWT/Spring Security.", rating: 5.0, skills: ["Java", "Spring Boot", "MySQL"] },
        { id: 2, fullname: "Alex Johnson", title: "UI/UX Expert & Frontend Engineer", country: "United States", bio: "Thiết kế giao diện người dùng hiện đại với Figma, phát triển ứng dụng SPA chuẩn ReactJS, tối ưu hóa hiệu năng và Responsive.", rating: 4.9, skills: ["ReactJS", "Figma", "Tailwind CSS"] },
        { id: 3, fullname: "Minh Tuấn", title: "DevOps & Cloud Engineer", country: "Vietnam", bio: "Triển khai CI/CD, đóng gói Docker, quản lý container Kubernetes và vận hành hệ thống AWS Cloud bảo mật cao.", rating: 4.8, skills: ["Docker", "AWS", "CI/CD"] },
        { id: 4, fullname: "Emily Smith", title: "Content Strategist & Copywriter", country: "United Kingdom", bio: "Xây dựng chiến lược nội dung chuẩn SEO, viết bài blog, kịch bản video và tối ưu hóa chuyển đổi cho landing page tiếng Anh.", rating: 5.0, skills: ["SEO", "Content", "Copywriting"] },
        { id: 5, fullname: "Kenji Sato", title: "Mobile App Developer (Flutter)", country: "Japan", bio: "Phát triển ứng dụng di động đa nền tảng iOS & Android với Flutter hiệu năng cao, mượt mà và giao diện tối giản.", rating: 4.7, skills: ["Flutter", "Dart", "Firebase"] },
        { id: 6, fullname: "David Lee", title: "Data Analyst & Business Intelligence", country: "Singapore", bio: "Phân tích dữ liệu kinh doanh, xây dựng Dashboard trực quan trên Tableau/PowerBI và tối ưu hóa phễu chuyển đổi doanh thu.", rating: 4.9, skills: ["Python", "Tableau", "SQL"] },
        { id: 7, fullname: "Sarah Connor", title: "Cyber Security Specialist", country: "Canada", bio: "Đánh giá an ninh mạng, kiểm thử lỗ hổng bảo mật hệ thống web/API và tư vấn giải pháp phòng chống tấn công DDoS.", rating: 4.6, skills: ["Security", "Linux", "Penetration Test"] },
        { id: 8, fullname: "Nguyễn Hoàng", title: "Node.js Backend Developer", country: "Vietnam", bio: "Xây dựng hệ thống real-time chat, ứng dụng microservices tốc độ cao sử với Express, NestJS và NoSQL MongoDB.", rating: 4.9, skills: ["Node.js", "Express", "MongoDB"] },
        { id: 9, fullname: "Jessica Taylor", title: "Digital Marketing Manager", country: "United States", bio: "Chuyên gia tối ưu chi phí quảng cáo Facebook Ads, Google Ads và xây dựng thương hiệu số toàn diện cho doanh nghiệp.", rating: 4.5, skills: ["Facebook Ads", "Google Ads", "Marketing"] },
        { id: 10, fullname: "Trần Long", title: "AI & Machine Learning Engineer", country: "Vietnam", bio: "Nghiên cứu và tích hợp các mô hình xử lý ngôn ngữ tự nhiên NLP, thị giác máy tính Computer Vision vào phần mềm thực tế.", rating: 5.0, skills: ["Python", "PyTorch", "AI"] },
        { id: 11, fullname: "Sophia Müller", title: "Graphic Designer & Illustrator", country: "United Kingdom", bio: "Thiết kế bộ nhận diện thương hiệu, logo doanh nghiệp, vẽ minh họa digital art độc quyền mang phong cách châu Âu.", rating: 4.8, skills: ["Photoshop", "Illustrator", "Branding"] },
        { id: 12, fullname: "Michael Chang", title: "Golang Microservices Developer", country: "Singapore", bio: "Thiết kế hệ thống chịu tải lớn, xử lý đồng thì cực mạnh với ngôn ngữ Go và quản lý tin nhắn thông qua Kafka.", rating: 4.9, skills: ["Golang", "Kafka", "Docker"] }
    ];

    useEffect(() => {
        fetchSellerList();
    }, []);

    // Mỗi khi thay đổi từ khóa hoặc bộ lọc, tự động đưa trang hiện tại về trang 1
    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword, selectedCountry, sortBy]);

    // 🔍 Hàm lấy danh sách Seller từ Backend API công khai
    const fetchSellerList = async () => {
        setLoading(true);
        
        try {
            const response = await fetch('http://localhost:8080/api/v1/sellers');
            const result = await response.json(); // Đổi tên biến thành result cho rõ ràng

            console.log("👉 Dữ liệu nhận được từ API:", result);

            // Truy cập đúng vào result.data (là mảng 301 phần tử)
            if (result && Array.isArray(result.data)) {
                setSellers(result.data);
            } else {
                console.warn("Cấu trúc API không chứa mảng data, dùng Mock Data.");
                setSellers(MOCK_SELLERS);
            }
        } catch (error) {
            console.error("🚩 Lỗi API, chuyển sang dùng Mock Data:", error);
            setSellers(MOCK_SELLERS);
        } finally {
            setLoading(false);
        }
    };

    // ⚙️ Logic xử lý lọc dữ liệu kết hợp đồng thời trên Frontend
    const filteredSellers = sellers.filter(seller => {
        const matchesSearch =
            seller.fullname?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            seller.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            seller.skills?.some(skill => skill.toLowerCase().includes(searchKeyword.toLowerCase()));

        const matchesCountry = selectedCountry === '' || seller.country === selectedCountry;

        return matchesSearch && matchesCountry;
    });

    // 📊 Thực hiện Sắp xếp/Lọc dựa theo lựa chọn nâng cao
    const sortedAndFilteredSellers = [...filteredSellers].sort((a, b) => {
        if (sortBy === 'best_rating') {
            return b.rating - a.rating; // Sắp xếp đánh giá từ cao xuống thấp
        }
        if (sortBy === 'multi_skills') {
            return (b.skills?.length || 0) - (a.skills?.length || 0); // Ưu tiên seller có nhiều kỹ năng nhất
        }
        return 0; // Giữ nguyên thứ tự mặc định của API/Mock data
    });

    // ✂️ Chia mảng dữ liệu để lấy danh sách tương ứng với trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSellersInPage = sortedAndFilteredSellers.slice(indexOfFirstItem, indexOfLastItem);

    // Tính toán tổng số trang dựa trên dữ liệu sau khi đã lọc
    const totalPages = Math.ceil(sortedAndFilteredSellers.length / itemsPerPage);

    return (
        <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: "'Inter', sans-serif" }}>

            {/* TIÊU ĐỀ TRANG KHÁM PHÁ */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#222', marginBottom: '8px' }}>Khám phá các Chuyên gia (Sellers)</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>Tìm kiếm và kết nối với các Freelancer tài năng phù hợp cho dự án của bạn.</p>
            </div>

            {/* THANH BỘ LỌC TÌM KIẾM CHI TIẾT ĐÃ TÍCH HỢP */}
            <div style={{
                display: 'flex', gap: '15px', backgroundColor: '#fff', padding: '16px',
                borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '30px',
                flexWrap: 'wrap', alignItems: 'center'
            }}>
                {/* Ô Nhập từ khóa tìm kiếm */}
                <div style={{ flex: '1', minWidth: '250px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, chức danh hoặc kỹ năng (Java, React...)..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 12px 10px 40px', borderRadius: '6px',
                            border: '1px solid #dddbd6', fontSize: '14px', outline: 'none',
                            backgroundColor: '#f9f9f9', color: '#222'
                        }}
                    />
                </div>

                {/* Dropdown Lọc nâng cao theo Seller tốt nhất */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={18} style={{ color: '#666' }} />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        onMouseEnter={() => setHoverSort(true)}
                        onMouseLeave={() => setHoverSort(false)}
                        onFocus={() => setFocusSort(true)}
                        onBlur={() => setFocusSort(false)}
                        style={{
                            padding: '10px 16px', borderRadius: '6px', border: '1px solid #dddbd6',
                            backgroundColor: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer',
                            color: '#222222',
                            transition: 'color 0.2s ease'
                        }}
                    >
                        <option value="all" style={{ color: '#222' }}>Tất cả chuyên gia</option>
                        <option value="best_rating" style={{ color: '#222' }}>Chuyên gia tốt nhất (Rating)</option>
                        <option value="multi_skills" style={{ color: '#222' }}>Kỹ năng đa dạng nhất</option>
                    </select>
                </div>

                {/* Dropdown Lọc Quốc gia */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={18} style={{ color: '#666' }} />
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        onMouseEnter={() => setHoverCountry(true)}
                        onMouseLeave={() => setHoverCountry(false)}
                        onFocus={() => setFocusCountry(true)}
                        onBlur={() => setFocusCountry(false)}
                        style={{
                            padding: '10px 16px', borderRadius: '6px', border: '1px solid #dddbd6',
                            backgroundColor: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer',
                            color: '#222222',
                            transition: 'color 0.2s ease'
                        }}
                    >
                        <option value="" style={{ color: '#222' }}>Tất cả quốc gia</option>
                        {popularCountries.map(country => (
                            <option key={country} value={country} style={{ color: '#222' }}>{country}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* DANH SÁCH HIỂN THỊ CÁC SELLER (GRID LAYOUT) */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải danh sách hồ sơ...</div>
            ) : currentSellersInPage.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888', border: '1px dashed #dddbd6', borderRadius: '8px' }}>
                    Không tìm thấy Seller nào phù hợp với yêu cầu lọc của bạn.
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                        {currentSellersInPage.map((seller) => (
                            <div
                                key={seller.id}
                                style={{
                                    backgroundColor: '#fff', border: '1px solid #eae9e6', borderRadius: '8px',
                                    padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)', transition: 'transform 0.2s'
                                }}
                            >
                                {/* Khối thông tin trên */}
                                <div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f0f0f0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555'
                                        }}>
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#222' }}>{seller.fullname}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666' }}>
                                                <MapPin size={12} /> <span>{seller.country}</span>
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '13px', fontWeight: 'bold', color: '#ffb33e' }}>
                                            <Star size={14} fill="#ffb33e" color="#ffb33e" /> <span>{seller.rating.toFixed(1)}</span>
                                        </div>
                                    </div>

                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1dbf73', fontWeight: '600' }}>{seller.title}</h4>
                                    <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#555', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {seller.bio || "Chưa có bài giới thiệu bản thân."}
                                    </p>
                                </div>

                                {/* Khối kỹ năng & nút bấm bên dưới */}
                                <div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
                                        {seller.skills?.map((skill, idx) => (
                                            <span key={idx} style={{ backgroundColor: '#f5f5f5', color: '#444', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => navigate(`/seller/${seller.id}`)}
                                        style={{
                                            width: '100%', padding: '10px', backgroundColor: '#222', color: '#fff',
                                            border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}
                                    >
                                        View Profile <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* THANH ĐIỀU HƯỚNG PHÂN TRANG (PAGINATION) */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '8px', borderRadius: '6px', border: '1px solid #dddbd6',
                                    backgroundColor: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    color: currentPage === 1 ? '#ccc' : '#555'
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        style={{
                                            padding: '8px 14px', borderRadius: '6px',
                                            border: '1px solid',
                                            borderColor: currentPage === pageNumber ? '#1dbf73' : '#dddbd6',
                                            backgroundColor: currentPage === pageNumber ? '#1dbf73' : '#fff',
                                            color: currentPage === pageNumber ? '#fff' : '#555',
                                            fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                                        }}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '8px', borderRadius: '6px', border: '1px solid #dddbd6',
                                    backgroundColor: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    color: currentPage === totalPages ? '#ccc' : '#555'
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SellerExploration;