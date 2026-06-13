// src/pages/Orders/MyOrders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, AlertCircle } from 'lucide-react';
import './Orders.css';

const FALLBACK_MOCK_ORDERS = [
    {
        orderId: "ORD-9921",
        gigTitle: "I will build secure backend REST APIs using Spring Boot",
        gigThumbnail: "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg",
        partnerName: "kien_phan",
        packageSelected: "Gói Cao Cấp (Premium)",
        totalAmount: 350,
        status: "PENDING"
    },
    {
        orderId: "ORD-5541",
        gigTitle: "I will design modern websites in figma or adobe xd",
        gigThumbnail: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
        partnerName: "design_pro",
        packageSelected: "Gói Tiêu Chuẩn (Standard)",
        totalAmount: 500,
        status: "IN_PROGRESS"
    },
    {
        orderId: "ORD-1120",
        gigTitle: "Fix bugs and deploy Spring Boot application to AWS",
        gigThumbnail: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
        partnerName: "dev_master",
        packageSelected: "Gói Cơ Bản (Basic)",
        totalAmount: 150,
        status: "COMPLETED"
    }
];

// Hàm bổ trợ hiển thị tên Trạng thái Tiếng Việt trên giao diện
const translateStatus = (status) => {
    switch (status ? status.toUpperCase() : '') {
        case 'PENDING': return 'CHỜ XỬ LÝ';
        case 'IN_PROGRESS': return 'ĐANG THỰC HIỆN';
        case 'DELIVERED': return 'ĐÃ GIAO';
        case 'COMPLETED': return 'HOÀN THÀNH';
        case 'CANCELLED': return 'ĐÃ HỦY ĐƠN'; // 🆕 Bổ sung hỗ trợ dịch trạng thái đơn bị Seller từ chối
        default: return status || 'CHỜ XỬ LÝ';
    }
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [isUsingMock, setIsUsingMock] = useState(false); 
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchBuyerOrders = async () => {
            try {
                setLoading(true);
                setIsUsingMock(false);
                
                let url = `http://localhost:8080/api/v1/orders?role=BUYER`;
                if (statusFilter) {
                    url += `&status=${statusFilter}`;
                }

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const resData = await response.json();
                
                if (response.ok && Array.isArray(resData)) {
                    setOrders(resData);
                } else if (response.ok && resData.data) {
                    setOrders(resData.data);
                } else {
                    throw new Error("Lỗi phản hồi từ hệ thống");
                }
            } catch (error) {
                console.warn("[API] Lỗi lấy danh sách đơn mua hoặc lỗi hệ thống. Tự động chuyển sang Mock Data.");
                if (statusFilter === '') {
                    setOrders(FALLBACK_MOCK_ORDERS);
                } else {
                    setOrders(FALLBACK_MOCK_ORDERS.filter(o => o.status === statusFilter));
                }
                setIsUsingMock(true);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchBuyerOrders();
        } else {
            if (statusFilter === '') {
                setOrders(FALLBACK_MOCK_ORDERS);
            } else {
                setOrders(FALLBACK_MOCK_ORDERS.filter(o => o.status === statusFilter));
            }
            setIsUsingMock(true);
            setLoading(false);
        }
    }, [statusFilter, token]);

    return (
        <div className="my-orders-container">
            <div className="page-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Đơn hàng của tôi</h1>
                    <p>Theo dõi và quản lý toàn bộ dịch vụ bạn đã đặt mua.</p>
                </div>
            </div>

            <div className="filter-tabs-row">
                <button className={statusFilter === '' ? 'tab-btn active' : 'tab-btn'} onClick={() => setStatusFilter('')}>Tất cả</button>
                <button className={statusFilter === 'PENDING' ? 'tab-btn active' : 'tab-btn'} onClick={() => setStatusFilter('PENDING')}>Chờ xử lý</button>
                <button className={statusFilter === 'IN_PROGRESS' ? 'tab-btn active' : 'tab-btn'} onClick={() => setStatusFilter('IN_PROGRESS')}>Đang thực hiện</button>
                <button className={statusFilter === 'DELIVERED' ? 'tab-btn active' : 'tab-btn'} onClick={() => setStatusFilter('DELIVERED')}>Đã giao</button>
                <button className={statusFilter === 'COMPLETED' ? 'tab-btn active' : 'tab-btn'} onClick={() => setStatusFilter('COMPLETED')}>Hoàn thành</button>
                <button className={statusFilter === 'CANCELLED' ? 'tab-btn active' : 'tab-btn'} onClick={() => setStatusFilter('CANCELLED')}>Đã hủy</button> {/* 🆕 Bổ sung tab lọc đơn hàng bị hủy */}
            </div>

            {loading ? (
                <div className="order-loading">Đang tải danh sách đơn hàng...</div>
            ) : orders.length === 0 ? (
                <div className="empty-orders-view">
                    <ShoppingBag size={48} />
                    <p>Bạn chưa thực hiện giao dịch mua nào trong trạng thái này.</p>
                </div>
            ) : (
                <div className="orders-table-wrapper">
                    <table className="orders-data-table">
                        <thead>
                            <tr>
                                <th>Chi tiết đơn dịch vụ</th>
                                <th>Người bán</th>
                                <th>Gói</th>
                                <th>Giá tiền</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.orderId}>
                                    <td>
                                        <div className="table-gig-info">
                                            <img src={order.gigThumbnail || 'https://via.placeholder.com/150'} alt="Thumbnail" />
                                            <div>
                                                <strong>{order.gigTitle}</strong>
                                                <span className="order-date-sub">Mã đơn: #{order.orderId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{order.partnerName}</td>
                                    <td><span className="package-badge">{order.packageSelected}</span></td>
                                    <td><strong>${order.totalAmount}</strong></td>
                                    <td>
                                        <span className={`status-pill pill-${order.status ? order.status.toLowerCase() : 'pending'}`}>
                                            {translateStatus(order.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="view-detail-action-btn" onClick={() => navigate(`/orders/${order.orderId}`)}>
                                            <Eye size={14} /> xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyOrders;