// src/pages/Services/ManageServices.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Eye, ShoppingBag } from 'lucide-react';
import './ManageServices.css';

const ManageServices = () => {
    const navigate = useNavigate();
    
    // Quản lý tab hiện tại đang được chọn (Ứng với trạng thái đơn hàng của hệ thống)
    const [activeTab, setActiveTab] = useState('active');
    
    // State quản lý danh sách đơn hàng thực tế đổ về từ Backend API
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Định nghĩa danh sách các tab hiển thị ở thanh điều hướng phụ - Đã dịch sang Tiếng Việt
    const tabs = [
        { id: 'active', label: 'Đang hoạt động' },
        { id: 'pending', label: 'Chờ xử lý' },
        { id: 'ongoing', label: 'Đang tiến hành' },
        { id: 'completed', label: 'Đã hoàn thành' },
        { id: 'canceled', label: 'Đã hủy đơn' }
    ];

    // MOCK DATA DỰ PHÒNG: Tự động kích hoạt hiển thị khi API lỗi để test luồng Workspace
    const getMockOrdersByStatus = (status) => {
        const allMocks = [
            {
                id: "ORD-9921",
                orderId: "ORD-9921",
                gigTitle: "I will design modern websites in figma or adobe xd",
                gigThumbnail: "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg",
                partnerName: "Trung Kiên (Buyer Mock)",
                buyerName: "Trung Kiên (Buyer Mock)",
                totalAmount: 500.00,
                price: 500.00,
                packageSelected: "Gói Cao Cấp (Premium)",
                status: "active"
            },
            {
                id: "ORD-8843",
                orderId: "ORD-8843",
                gigTitle: "I will build secure backend REST APIs using Spring Boot",
                gigThumbnail: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
                partnerName: "Phan Kiên (Buyer Mock)",
                buyerName: "Phan Kiên (Buyer Mock)",
                totalAmount: 350.00,
                price: 350.00,
                packageSelected: "Gói Cố Định/Tiêu Chuẩn",
                status: "active"
            },
            {
                id: "ORD-1122",
                orderId: "ORD-1122",
                gigTitle: "Website Deployment & Cloud Optimization Service",
                gigThumbnail: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
                partnerName: "Alex Minh",
                buyerName: "Alex Minh",
                totalAmount: 150.00,
                price: 150.00,
                packageSelected: "Cài Đặt Cơ Bản",
                status: "pending"
            }
        ];
        // Lọc dữ liệu theo tab trạng thái đang chọn, nếu danh mục đó trống thì trả về bản ghi mặc định để test
        const filtered = allMocks.filter(o => o.status === status);
        return filtered.length > 0 ? filtered : [
            {
                id: `ORD-MOCK-${status.toUpperCase()}`,
                orderId: `ORD-MOCK-${status.toUpperCase()}`,
                gigTitle: `Dịch vụ thử nghiệm thuộc mục [${status.toUpperCase()}]`,
                gigThumbnail: "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg",
                partnerName: "Khách Hàng Giả Lập",
                buyerName: "Khách Hàng Giả Lập",
                totalAmount: 200.00,
                price: 200.00,
                packageSelected: "Gói Thử Nghiệm",
                status: status
            }
        ];
    };

    // 🌟 TÍCH HỢP API: Gọi dữ liệu đơn hàng động dựa trên Tab trạng thái đang chọn
    useEffect(() => {
        const fetchSellerOrders = async () => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.warn("Không tìm thấy Access Token. Hệ thống tự động chuyển sang chế độ Mock Data.");
                setOrders(getMockOrdersByStatus(activeTab));
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch(`http://localhost:8080/api/v1/orders?role=SELLER&status=${activeTab}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const resData = await response.json();
                
                if (response.ok) {
                    if (Array.isArray(resData)) {
                        setOrders(resData.length > 0 ? resData : getMockOrdersByStatus(activeTab));
                    } else if (resData.data && Array.isArray(resData.data)) {
                        setOrders(resData.data.length > 0 ? resData.data : getMockOrdersByStatus(activeTab));
                    } else {
                        setOrders(getMockOrdersByStatus(activeTab));
                    }
                } else {
                    console.error(`API trả về mã lỗi ${response.status}. Khởi động Mock Data cứu hộ.`);
                    setOrders(getMockOrdersByStatus(activeTab));
                }
            } catch (error) {
                console.error("Lỗi khi kết nối API lấy danh sách đơn hàng -> Đang kích hoạt Mock Data:", error);
                setOrders(getMockOrdersByStatus(activeTab));
            } finally {
                setIsLoading(false);
            }
        };

        fetchSellerOrders();
    }, [activeTab]);

    const handleViewOrderDetail = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    const handleAddNewService = () => {
        navigate('/create-gig'); 
    };

    return (
        <div className="manage-services-container">
            <div className="manage-services-header">
                <div className="header-left">
                    <h1>Quản lý dịch vụ</h1>
                </div>
                <button className="btn-add-service-trigger" onClick={handleAddNewService}>
                    Thêm dịch vụ <ArrowUpRight size={16} />
                </button>
            </div>

            <div className="services-card-wrapper">
                <div className="services-tabs-bar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-item-btn ${activeTab === tab.id ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="services-table-container">
                    {isLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#62646a', fontWeight: 500 }}>
                            Đang tải dữ liệu từ hệ thống...
                        </div>
                    ) : orders.length > 0 ? (
                        <table className="services-data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '45%' }}>Thông tin dịch vụ / Đơn hàng</th>
                                    <th style={{ width: '25%' }}>Khách hàng (Người mua)</th>
                                    <th style={{ width: '15%' }}>Gói dịch vụ / Chi phí</th>
                                    <th style={{ width: '15%', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.orderId || order.id}>
                                        <td>
                                            <div 
                                                className="service-info-cell" 
                                                onClick={() => handleViewOrderDetail(order.orderId || order.id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img 
                                                    src={order.gigThumbnail || 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg'} 
                                                    alt={order.gigTitle} 
                                                    className="service-thumb-img" 
                                                />
                                                <div className="service-details-text">
                                                    <h4 className="service-title-link" style={{ margin: '0 0 4px 0', color: '#1dbf73' }}>
                                                        {order.gigTitle || "Dịch vụ Freelancer"}
                                                    </h4>
                                                    <span style={{ fontSize: '12px', color: '#95979d' }}>
                                                        Mã đơn: #{order.orderId || order.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td>
                                            <span className="category-text-badge" style={{ background: '#f4f4f4', color: '#333', fontWeight: 600 }}>
                                                {order.partnerName || order.buyerName || "Khách hàng hệ thống"}
                                            </span>
                                        </td>
                                        
                                        <td>
                                            <span className="cost-text-bold" style={{ color: '#222' }}>
                                                ${(order.totalAmount || order.price || 0).toFixed(2)} 
                                                <span style={{ fontSize: '12px', color: '#74767e', fontWeight: 400 }}>
                                                    / {order.packageSelected || "Cơ bản"}
                                                </span>
                                            </span>
                                        </td>
                                        
                                        <td style={{ textAlign: 'center' }}>
                                            {/* ĐÃ SỬA: Loại bỏ bớt class xung đột CSS ẩn chữ, ép kiểu hiển thị inline-flex với padding rõ ràng */}
                                            <button 
                                                onClick={() => handleViewOrderDetail(order.orderId || order.id)}
                                                title="Xem chi tiết phòng làm việc của đơn hàng"
                                                style={{ 
                                                    padding: '6px 14px', 
                                                    minWidth: '120px',
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    gap: '6px', 
                                                    borderRadius: '4px',
                                                    backgroundColor: '#fff0f6',
                                                    color: '#f4511e',
                                                    border: '1px solid #ffccbc',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Eye size={16} /> 
                                                <span style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>Xem chi tiết</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#74767e' }}>
                            <ShoppingBag size={44} style={{ color: '#b5b6ba', marginBottom: '12px' }} />
                            <p style={{ margin: 0, fontSize: '15px' }}>
                                Không tìm thấy đơn hàng nào thuộc danh mục hiển thị này.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ManageServices;