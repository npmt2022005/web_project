// src/pages/Orders/ManageSellerOrders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ShoppingBag } from 'lucide-react';
import './ManageSellerOrders.css'; 

const ManageSellerOrders = () => {
    const navigate = useNavigate();
    
    // Quản lý tab hiện tại đang được chọn (Ứng với trạng thái đơn hàng của hệ thống)
    const [activeTab, setActiveTab] = useState('active');
    
    // State quản lý danh sách đơn hàng thực tế đổ về từ Backend API
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Định nghĩa danh sách các tab hiển thị ở thanh điều hướng phụ
    const tabs = [
        { id: 'active', label: 'Đang hoạt động' },
        { id: 'pending', label: 'Chờ xử lý' },
        { id: 'ongoing', label: 'Đang tiến hành' },
        { id: 'completed', label: 'Đã hoàn thành' },
        { id: 'cancelled', label: 'Đã hủy đơn' }
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
                const backendStatusParam = activeTab.toUpperCase();

                const response = await fetch(`http://localhost:8080/api/v1/orders?role=SELLER&status=${backendStatusParam}`, {
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

    return (
        <div className="manage-orders-container">
            <div className="manage-orders-header">
                <div className="header-left">
                    <h1>Quản lý đơn hàng (Seller)</h1>
                </div>
            </div>

            <div className="orders-card-wrapper">
                <div className="orders-tabs-bar">
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

                <div className="orders-table-container">
                    {isLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#62646a', fontWeight: 500 }}>
                            Đang tải dữ liệu đơn hàng từ hệ thống...
                        </div>
                    ) : orders.length > 0 ? (
                        <table className="orders-data-table">
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
                                                className="order-info-cell" 
                                                onClick={() => handleViewOrderDetail(order.orderId || order.id)}
                                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                                            >
                                                <img 
                                                    src={order.gigThumbnail || 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg'} 
                                                    alt={order.gigTitle} 
                                                    className="order-thumb-img" 
                                                    style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                                <div className="order-details-text">
                                                    <h4 className="order-title-link" style={{ margin: '0 0 4px 0', color: '#1dbf73' }}>
                                                        {order.gigTitle || "Dịch vụ Freelancer"}
                                                    </h4>
                                                    <span style={{ fontSize: '12px', color: '#95979d' }}>
                                                        Mã đơn: #{order.orderId || order.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td>
                                            <span className="buyer-text-badge" style={{ padding: '4px 8px', background: '#f4f4f4', color: '#333', fontWeight: 600, borderRadius: '4px', fontSize: '13px' }}>
                                                {order.partnerName || order.buyerName || "Khách hàng hệ thống"}
                                            </span>
                                        </td>
                                        
                                        <td>
                                            <span className="order-cost-bold" style={{ color: '#222', fontWeight: 600 }}>
                                                ${(order.totalAmount || order.price || 0).toFixed(2)} 
                                                <span style={{ fontSize: '12px', color: '#74767e', fontWeight: 400 }}>
                                                    / {order.packageSelected || "Cơ bản"}
                                                </span>
                                            </span>
                                        </td>
                                        
                                        <td style={{ textAlign: 'center' }}>
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
                                Không tìm thấy đơn hàng nào được giao cho bạn ở danh mục này.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageSellerOrders;