// src/pages/Orders/OrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, DollarSign, ArrowLeft, ShieldCheck, User, AlertCircle } from 'lucide-react';
import './Orders.css';

const FALLBACK_MOCK_DETAIL = {
    orderId: "ORD-9921",
    status: "IN_PROGRESS",
    gigTitle: "I will build secure backend REST APIs using Spring Boot",
    gigDescription: "Thiết kế kiến trúc cơ sở dữ liệu MySQL, xây dựng các api endpoints bảo mật với Spring Security và JWT, xử lý phân quyền phân vai đầy đủ cho hệ thống thương mại điện tử.",
    deliveryDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), 
    partnerAvatar: "",
    partnerName: "kien_phan",
    packageSelected: "Gói Cao Cấp (Premium Pack)",
    createdAt: new Date().toISOString(),
    totalAmount: 350,
    currency: "USD"
};

const translateStatus = (status) => {
    switch (status ? status.toUpperCase() : '') {
        case 'PENDING': return 'CHỜ XỬ LÝ';
        case 'IN_PROGRESS': return 'ĐANG THỰC HIỆN';
        case 'DELIVERED': return 'ĐÃ BÀN GIAO';
        case 'COMPLETED': return 'HOÀN THÀNH';
        default: return status || 'CHỜ XỬ LÝ';
    }
};

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [isUsingMock, setIsUsingMock] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                setIsUsingMock(false);
                
                const response = await fetch(`http://localhost:8080/api/v1/orders/${orderId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const resData = await response.json();

                if (response.ok && resData.status === 'success') {
                    setOrder(resData.data);
                } else {
                    throw new Error(resData.message || 'Có lỗi xảy ra');
                }
            } catch (err) {
                console.warn(`[API] Lỗi tải chi tiết đơn #${orderId}. Tự động kích hoạt hiển thị giao diện Mockup.`);
                setOrder({ ...FALLBACK_MOCK_DETAIL, orderId: orderId });
                setIsUsingMock(true);
            } finally {
                setLoading(false);
            }
        };

        if (orderId && token) {
            fetchOrderDetail();
        } else {
            setOrder({ ...FALLBACK_MOCK_DETAIL, orderId: orderId || "ORD-TEST" });
            setIsUsingMock(true);
            setLoading(false);
        }
    }, [orderId, token]);

    useEffect(() => {
        if (!order || !order.deliveryDeadline) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const deadline = new Date(order.deliveryDeadline).getTime();
            const distance = deadline - now;

            if (distance < 0) {
                setTimeLeft('Đã quá hạn bàn giao!');
                clearInterval(interval);
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${days} ngày ${hours} giờ ${minutes} phút`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [order]);

    if (loading) return <div className="order-loading">Đang tải thông tin đơn hàng...</div>;
    if (error) return <div className="order-error-card"><p>{error}</p><button onClick={() => navigate(-1)}><ArrowLeft size={16}/> Quay lại</button></div>;
    if (!order) return null;

    return (
        <div className="order-detail-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <button className="back-to-list-btn" onClick={() => navigate(-1)} style={{ margin: 0 }}>
                    <ArrowLeft size={16} /> Quay lại danh sách
                </button>
            </div>

            <div className="order-workspace-grid">
                <div className="workspace-main-card">
                    <div className="order-main-header">
                        {/* ĐÃ SỬA: Nhãn trạng thái hiển thị Tiếng Việt */}
                        <span className={`status-tag badge-${order.status ? order.status.toLowerCase() : 'pending'}`}>
                            {translateStatus(order.status)}
                        </span>
                        <p className="order-id-label">Mã đơn hàng: #{order.orderId}</p>
                        <h1>{order.gigTitle}</h1>
                        <p className="gig-desc-preview">{order.gigDescription}</p>
                    </div>

                    <div className="order-progress-stepper">
                        <div className={`step-item ${['PENDING', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'].includes(order.status) ? 'active' : ''}`}>Khởi tạo</div>
                        <div className={`step-item ${['IN_PROGRESS', 'DELIVERED', 'COMPLETED'].includes(order.status) ? 'active' : ''}`}>Đang thực hiện</div>
                        <div className={`step-item ${['DELIVERED', 'COMPLETED'].includes(order.status) ? 'active' : ''}`}>Đã bàn giao</div>
                        <div className={`step-item ${order.status === 'COMPLETED' ? 'active' : ''}`}>Hoàn thành</div>
                    </div>

                    <div className="workspace-chat-mock">
                        <h3>Không gian làm việc (Workspace)</h3>
                        <div className="mock-chat-box">
                            <p className="chat-system-text">Hệ thống: Đơn hàng đã được thiết lập thành công. Hãy bắt đầu trao đổi công việc tại đây.</p>
                        </div>
                    </div>
                </div>

                <div className="workspace-sidebar">
                    {order.status === 'IN_PROGRESS' && (
                        <div className="sidebar-widget countdown-widget">
                            <h4><Clock size={16} /> Thời gian còn lại</h4>
                            <div className="countdown-clock-box">{timeLeft}</div>
                        </div>
                    )}

                    <div className="sidebar-widget info-summary-widget">
                        <h4>Thông tin tóm tắt</h4>
                        <hr />
                        <div className="partner-profile-mini">
                            {order.partnerAvatar ? (
                                <img src={order.partnerAvatar} alt="Đối tác" />
                            ) : (
                                <div className="avatar-placeholder"><User size={16}/></div>
                            )}
                            <div>
                                <p className="partner-role-title">Đối tác liên hệ</p>
                                <strong>{order.partnerName}</strong>
                            </div>
                        </div>
                        <hr />
                        <div className="info-row-item">
                            <span>Gói dịch vụ:</span>
                            <strong>{order.packageSelected}</strong>
                        </div>
                        <div className="info-row-item">
                            <span>Ngày đặt:</span>
                            <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                        <hr />
                        <div className="total-price-box">
                            <span>Tổng chi phí:</span>
                            <span className="price-text"><DollarSign size={20}/>{order.totalAmount} {order.currency || 'USD'}</span>
                        </div>
                        <hr />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', fontSize: '12px', color: '#74767e' }}>
                            <ShieldCheck size={18} color="#1dbf73" style={{ flexShrink: 0 }} /> 
                            <span>Giao dịch được bảo hộ an toàn hệ thống.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;