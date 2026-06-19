// src/pages/Services/ManageServices.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ShoppingBag, Edit3, Trash2 } from 'lucide-react';
import apiClient from '../../services/apiClient';
import './ManageServices.css';

// MOCK DATA PHỤC VỤ FALLBACK KHI BACKEND BỊ LỖI HOẶC KHÔNG KẾT NỐI ĐƯỢC
const MOCK_GIGS_DATA = [
    {
        id: 101,
        title: "Thiết kế giao diện Web chuyên nghiệp (ReactJS / Tailwind CSS)",
        gigCode: "GIG-UXUI-01",
        deliveryDays: 3,
        categoryName: "Web Development",
        startingPrice: 49.00,
        thumbnailUrl: "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg"
    },
    {
        id: 102,
        title: "Xây dựng hệ thống Backend RESTful API bằng Spring Boot",
        gigCode: "GIG-JAVA-02",
        deliveryDays: 5,
        categoryName: "Backend Development",
        startingPrice: 99.00,
        thumbnailUrl: ""
    },
    {
        id: 103,
        title: "Tối ưu hóa Cơ sở dữ liệu MySQL và Cấu trúc truy vấn",
        gigCode: "GIG-DBA-03",
        deliveryDays: 2,
        categoryName: "Database Services",
        startingPrice: 35.00,
        thumbnailUrl: ""
    }
];

const ManageServices = () => {
    const navigate = useNavigate();
    
    // Quản lý danh sách dịch vụ (Gigs) từ API backend
    const [gigs, setGigs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Trạng thái phục vụ phân trang (Đồng bộ trực tiếp với API Spring Boot)
    const [currentPage, setCurrentPage] = useState(1); // Giao diện hiển thị từ trang 1
    const [totalPages, setTotalPages] = useState(0);
    const gigsPerPage = 5; // Cấu hình hiển thị 5 dịch vụ/trang để test theo nhu cầu

    // Biến kích hoạt reload dữ liệu ổn định sau khi thao tác xóa thành công
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Trạng thái điều khiển Modal xóa chính giữa màn hình
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        gigId: null
    });

    // ==========================================================================
    // HÀM GỌI API LẤY DANH SÁCH GIGS CỦA SELLER
    // ==========================================================================
    const fetchGigsFromServer = useCallback(async () => {
        setIsLoading(true);
        try {
            // SỬA ĐỔI AN TOÀN: Kiểm tra token từ cả 'token' hoặc 'JWT_TOKEN' để tránh bị thiếu thông tin xác thực
            const token = localStorage.getItem('token') || localStorage.getItem('JWT_TOKEN'); 
            
            // Backend Spring Boot nhận trang bắt đầu từ 0, nên cần (currentPage - 1)
            const apiPage = currentPage - 1;
            
            // SỬA ĐỔI: Đồng bộ tham số sortDir thành 'DESC' (viết hoa) để tránh lỗi 400 từ bộ lọc JPA Spring
            const response = await apiClient.get(`/v1/gigs/me?page=${apiPage}&size=${gigsPerPage}&sortBy=createdAt&sortDir=DESC`);

            // Axios automatically throws for non-2xx status codes, so if we reach here it's successful
            const result = response.data;
            if (result.status === 'success' && result.data) {
                setGigs(result.data.content || []);
                setTotalPages(result.data.totalPages || 0);
            } else {
                // Fallback sang Mock Data nếu cấu trúc JSON trả về không thành công
                console.warn("API không trả về trạng thái success. Đang kích hoạt dữ liệu Mock Data.");
                setGigs(MOCK_GIGS_DATA);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách gigs:", error);
            setGigs(MOCK_GIGS_DATA);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, gigsPerPage]);

    // Gọi API nạp dữ liệu khi component được mount, khi đổi trang hoặc khi có yêu cầu làm mới
    useEffect(() => {
        fetchGigsFromServer();
    }, [fetchGigsFromServer, refreshTrigger]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // ==========================================================================
    // HÀM XỬ LÝ THAO TÁC (SỬA, XÓA, XEM, THÊM MỚI)
    // ==========================================================================
    
    const handleViewGigDetail = (gig) => {
        // ĐÃ SỬA: Thay đổi URL điều hướng sang trang chi tiết gig phù hợp với GigDetailPage thay vì OrderDetailPage
        navigate(`/gigs/${gig.id}`, { state: { detailGigData: gig } });
    };

    const handleAddNewService = () => {
        navigate('/create-gig'); 
    };

    const handleEditGig = (gig) => {
        // Truyền dữ liệu thật qua state để component đích nhận diện chế độ Edit
        navigate('/create-gig', { state: { editGigData: gig } });
    };

    // Bước 1: Kích hoạt hiển thị modal tùy chỉnh và lưu lại Long ID
    const handleDeleteGig = (gigId) => {
        setDeleteModal({
            isOpen: true,
            gigId: gigId
        });
    };

    // Bước 2: Nhấn xác nhận trên giao diện Modal để gọi API Xóa thực tế từ Backend
    const confirmDeleteGig = async () => {
        const gigId = deleteModal.gigId;
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('JWT_TOKEN');
            
            const response = await apiClient.delete(`/v1/gigs/delete_gig/${gigId}`);

            if (response.data && response.data.status === 'success') {
                // Đóng modal và tiến hành tải lại danh sách mới từ server để cập nhật UI mượt mà
                setDeleteModal({ isOpen: false, gigId: null });
                
                // Kiểm tra xem trang hiện tại có phải trang cuối cùng và chỉ còn 1 phần tử hay không
                if (gigs.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                } else {
                    setRefreshTrigger(prev => prev + 1);
                }
            } else {
                const errorResult = response.data || {};
                alert(errorResult.message || "Xóa dịch vụ thất bại. Vui lòng kiểm tra lại quyền sở hữu!");
                setDeleteModal({ isOpen: false, gigId: null });
            }
        } catch (error) {
            console.error("Lỗi khi kết nối API xóa dịch vụ:", error);
            
            // Hỗ trợ xử lý xóa trực tiếp trên State của Mock Data trong môi trường offline/lỗi mạng
            const isMockData = MOCK_GIGS_DATA.some(mock => mock.id === gigId);
            if (isMockData) {
                setGigs(prev => prev.filter(g => g.id !== gigId));
                setDeleteModal({ isOpen: false, gigId: null });
            } else {
                alert("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
                setDeleteModal({ isOpen: false, gigId: null });
            }
        }
    };

    return (
        <div className="manage-services-container">
            <div className="manage-services-header">
                <div className="header-left">
                    <h1>Quản lý dịch vụ đăng bán</h1>
                </div>
                <button className="btn-add-service-trigger" onClick={handleAddNewService}>
                    Thêm dịch vụ <ArrowUpRight size={16} />
                </button>
            </div>

            <div className="services-card-wrapper">
                <div className="services-table-container">
                    {isLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#62646a', fontWeight: 500 }}>
                            Đang tải danh sách dịch vụ của bạn...
                        </div>
                    ) : gigs.length > 0 ? (
                        <>
                            <table className="services-data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '45%' }}>Thông tin dịch vụ / Gói thầu</th>
                                        <th style={{ width: '20%' }}>Danh mục chính</th>
                                        <th style={{ width: '15%' }}>Giá khởi điểm</th>
                                        <th style={{ width: '20%', textAlign: 'center' }}>Thao tác điều khiển</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gigs.map((gig) => (
                                        <tr key={gig.id}>
                                            <td>
                                                <div 
                                                    className="service-info-cell" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewGigDetail(gig);
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <img 
                                                        src={gig.thumbnailUrl || 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg'} 
                                                        alt={gig.title} 
                                                        className="service-thumb-img" 
                                                    />
                                                    <div className="service-details-text">
                                                        <h4 className="service-title-link" style={{ margin: '0 0 4px 0', color: '#1dbf73' }}>
                                                            {gig.title}
                                                        </h4>
                                                        <span style={{ fontSize: '12px', color: '#95979d' }}>
                                                            Mã dịch vụ: {gig.gigCode || `#GIG-${gig.id}`} | Thời gian: {gig.deliveryDays} ngày
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td>
                                                <span className="category-text-badge" style={{ background: '#f4f4f4', color: '#333', fontWeight: 600 }}>
                                                    {gig.categoryName}
                                                </span>
                                            </td>
                                            
                                            <td>
                                                <span className="cost-text-bold" style={{ color: '#222' }}>
                                                    ${gig.startingPrice ? gig.startingPrice.toFixed(2) : '0.00'} 
                                                    <span style={{ fontSize: '12px', color: '#74767e', fontWeight: 400 }}>
                                                        / Khởi điểm
                                                    </span>
                                                </span>
                                            </td>
                                            
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditGig(gig);
                                                        }}
                                                        title="Chỉnh sửa nội dung dịch vụ này"
                                                        style={{ 
                                                            padding: '6px 10px', 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            gap: '4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: '#e8f5e9',
                                                            color: '#2e7d32',
                                                            border: '1px solid #c8e6c9',
                                                            cursor: 'pointer',
                                                            fontWeight: 600,
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        <Edit3 size={14} /> Sửa
                                                    </button>

                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteGig(gig.id);
                                                        }}
                                                        title="Xóa vĩnh viễn dịch vụ này"
                                                        style={{ 
                                                            padding: '6px 10px', 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            gap: '4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: '#ffebee',
                                                            color: '#c62828',
                                                            border: '1px solid #ffcdd2',
                                                            cursor: 'pointer',
                                                            fontWeight: 600,
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        <Trash2 size={14} /> Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* BANNER THANH SỐ PHÂN TRANG ĐIỀU HƯỚNG CHẠY THEO TOTAL PAGES TỪ BACKEND */}
                            {totalPages > 1 && (
                                <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', padding: '10px' }}>
                                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                        <button
                                            key={`page-btn-${pageNumber}`}
                                            onClick={() => handlePageChange(pageNumber)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                border: '1px solid #e0e0e0',
                                                backgroundColor: currentPage === pageNumber ? '#1dbf73' : '#fff',
                                                color: currentPage === pageNumber ? '#fff' : '#333',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#74767e' }}>
                            <ShoppingBag size={44} style={{ color: '#b5b6ba', marginBottom: '12px' }} />
                            <p style={{ margin: 0, fontSize: '15px' }}>
                                Bạn chưa đăng bán dịch vụ nào trên hệ thống. Hãy nhấn nút "Thêm dịch vụ" ở góc trên để bắt đầu!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* GIAO DIỆN MODAL XÓA DỊCH VỤ */}
            {deleteModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 9999, backdropFilter: 'blur(2px)'
                }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '24px', borderRadius: '8px',
                        width: '450px', maxWidth: '90%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', color: '#222', fontSize: '18px', fontWeight: 700 }}>
                            Xác nhận xóa dịch vụ
                        </h3>
                        <p style={{ margin: '0 0 24px 0', color: '#62646a', fontSize: '14px', lineHeight: '1.5' }}>
                            Bạn có chắc chắn muốn xóa vĩnh viễn dịch vụ có ID hệ thống <strong style={{color: '#c62828'}}>#{deleteModal.gigId}</strong> không? Thao tác này không thể hoàn tác.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button 
                                onClick={() => setDeleteModal({ isOpen: false, gigId: null })}
                                style={{
                                    padding: '10px 20px', borderRadius: '4px', border: '1px solid #e0e0e0',
                                    backgroundColor: '#fff', color: '#62646a', fontWeight: 600,
                                    cursor: 'pointer', fontSize: '14px'
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={confirmDeleteGig}
                                style={{
                                    padding: '10px 20px', borderRadius: '4px', border: 'none',
                                    backgroundColor: '#c62828', color: '#fff', fontWeight: 600,
                                    cursor: 'pointer', fontSize: '14px'
                                }}
                            >
                                Đồng ý Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageServices;