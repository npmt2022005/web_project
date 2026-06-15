// src/pages/Orders/OrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, DollarSign, ArrowLeft, ShieldCheck, User, AlertCircle, Upload, Link as LinkIcon, Star } from 'lucide-react';
import './Orders.css';

const FALLBACK_MOCK_DETAIL = {
    orderId: "ORD-9921",
    status: "PENDING", 
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
        case 'CANCELLED': return 'ĐÃ HỦY ĐƠN'; 
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
    
    // Khởi tạo state quản lý trạng thái loading khi đang bấm xử lý API duyệt đơn
    const [actionLoading, setActionLoading] = useState(false);

    // Khởi tạo các State phục vụ tính năng Deliver Order
    const [showDeliverForm, setShowDeliverForm] = useState(false);
    const [deliverFile, setDeliverFile] = useState(null);
    const [submissionLink, setSubmissionLink] = useState('');
    const [deliverNote, setDeliverNote] = useState('');
    const [deliverLoading, setDeliverLoading] = useState(false);

    // Khởi tạo các State phục vụ tính năng nghiệm thu & đánh giá dành cho Buyer
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [completeLoading, setCompleteLoading] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    // Khởi tạo các State phục vụ tính năng Yêu cầu chỉnh sửa (Revision) dành cho Buyer
    const [showRevisionForm, setShowRevisionForm] = useState(false);
    const [revisionFile, setRevisionFile] = useState(null);
    const [revisionNote, setRevisionNote] = useState('');
    const [revisionLoading, setRevisionLoading] = useState(false);

    const token = localStorage.getItem('token');
    const currentRole = (localStorage.getItem('role') || '').toUpperCase();
    const isBuyer = currentRole === 'ROLE_BUYER' || currentRole === 'BUYER';

    // Hàm fetch dữ liệu chi tiết từ API
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
            setOrder(prev => (prev && prev.orderId === orderId) ? prev : { ...FALLBACK_MOCK_DETAIL, orderId: orderId });
            setIsUsingMock(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId && token) {
            fetchOrderDetail();
        } else {
            setOrder({ ...FALLBACK_MOCK_DETAIL, orderId: orderId || "ORD-TEST" });
            setIsUsingMock(true);
            setLoading(false);
        }
    }, [orderId, token]);

    // Hàm xử lý tự động hủy đơn trễ hạn khi quá thời gian đếm ngược dành cho Buyer
    const handleAutoCancelLateOrder = async () => {
        if (isUsingMock || !token) {
            setOrder(prev => ({ ...prev, status: 'CANCELLED' }));
            alert("[Mockup] Đơn hàng đã quá hạn thực hiện! Hệ thống tự động hủy đơn và hoàn tiền cho Buyer.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/v1/orders/${orderId}/cancel-late`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const resData = await response.json();

            if (response.ok && resData.status === 'success') {
                alert(resData.message || 'Đơn hàng quá hạn đã tự động hủy. Tiền đã được hoàn lại.');
                await fetchOrderDetail(); 
            } else {
                console.warn("Hệ thống chưa thể xử lý tự động hủy đơn trễ hạn:", resData.message);
            }
        } catch (err) {
            console.error("Lỗi kết nối API cancel-late tự động:", err);
        }
    };

    useEffect(() => {
        if (!order || !order.deliveryDeadline) return;

        let hasTriggeredCancel = false;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const deadline = new Date(order.deliveryDeadline).getTime();
            const distance = deadline - now;

            if (distance < 0) {
                setTimeLeft('Đã quá hạn bàn giao!');
                clearInterval(interval);

                if (order.status === 'IN_PROGRESS' && isBuyer && !hasTriggeredCancel) {
                    hasTriggeredCancel = true;
                    handleAutoCancelLateOrder();
                }
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${days} ngày ${hours} giờ ${minutes} phút`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [order, isBuyer, orderId]);

    // Hàm xử lý tương tác gọi API Cập nhật trạng thái đơn hàng (Xác nhận / Từ chối)
    const handleProcessOrder = async (decision) => {
        const payloadStatus = decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
        const targetUIStatus = decision === 'ACCEPT' ? 'IN_PROGRESS' : 'CANCELLED';

        if (isUsingMock || !token) {
            setActionLoading(true);
            setTimeout(() => {
                setOrder(prev => ({ ...prev, status: targetUIStatus }));
                setActionLoading(false);
                alert(`[Mockup] Đã giả lập xử lý thành công trạng thái đơn sang: ${translateStatus(targetUIStatus)}`);
            }, 500);
            return;
        }

        try {
            setActionLoading(true);
            const response = await fetch(`http://localhost:8080/api/v1/orders/${orderId}/status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: payloadStatus })
            });

            const resData = await response.json();

            if (response.ok && resData.status === 'success') {
                alert(resData.message || 'Cập nhật trạng thái đơn hàng thành công.');
                await fetchOrderDetail();
            } else {
                alert(`Lỗi: ${resData.message || 'Không thể cập nhật trạng thái đơn hàng.'}`);
            }
        } catch (err) {
            console.error("Lỗi kết nối API status:", err);
            alert("Có lỗi xảy ra khi kết nối tới máy chủ cập nhật trạng thái.");
        } finally { 
            setActionLoading(false);
        }
    };

    // Hàm xử lý gửi sản phẩm (Deliver Order) bằng FormData lên API
    const handleDeliverOrderSubmit = async (e) => {
        e.preventDefault();

        if (!submissionLink && !deliverFile) {
            alert("Vui lòng đính kèm tệp sản phẩm hoặc cung cấp liên kết dẫn tới sản phẩm bàn giao.");
            return;
        }
        if (!deliverNote.trim()) {
            alert("Vui lòng nhập lời nhắn gửi kèm cho khách hàng.");
            return;
        }

        const formData = new FormData();
        if (deliverFile) {
            formData.append('file', deliverFile);
        }
        formData.append('submissionLink', submissionLink);
        formData.append('note', deliverNote);

        if (isUsingMock || !token) {
            setDeliverLoading(true);
            setTimeout(() => {
                setOrder(prev => ({ ...prev, status: 'DELIVERED' }));
                setDeliverLoading(false);
                setShowDeliverForm(false);
                alert(`[Mockup] Bàn giao sản phẩm giả lập thành công! Trạng thái: ĐÃ BÀN GIAO`);
            }, 800);
            return;
        }

        try {
            setDeliverLoading(true);
            const response = await fetch(`http://localhost:8080/api/v1/orders/${orderId}/deliver`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const resData = await response.json();

            if (response.ok && resData.status === 'success') {
                alert(resData.message || 'Nộp sản phẩm và giao hàng thành công.');
                setShowDeliverForm(false);
                setDeliverFile(null);
                setSubmissionLink('');
                setDeliverNote('');
                await fetchOrderDetail();
            } else {
                alert(`Lỗi: ${resData.message || 'Không thể gửi sản phẩm bàn giao.'}`);
            }
        } catch (err) {
            console.error("Lỗi kết nối API deliver:", err);
            alert("Có lỗi kết nối hệ thống khi đang nộp sản phẩm.");
        } finally {
            setDeliverLoading(false);
        }
    };

    // Hàm gọi API nghiệm thu hoàn thành đơn và lưu Review từ Buyer
    const handleCompleteOrderSubmit = async (e) => {
        e.preventDefault();

        if (!reviewComment.trim()) {
            alert("Bình luận đánh giá không được để trống!");
            return;
        }

        const reviewPayload = {
            rating: parseInt(rating),
            reviewComment: reviewComment.trim()
        };

        if (isUsingMock || !token) {
            setCompleteLoading(true);
            setTimeout(() => {
                setOrder(prev => ({ ...prev, status: 'COMPLETED' }));
                setCompleteLoading(false);
                setShowReviewModal(false);
                alert(`[Mockup] Nghiệm thu đơn hàng thành công! Cảm ơn bạn đã đánh giá ${rating} sao.`);
            }, 800);
            return;
        }

        try {
            setCompleteLoading(true);
            const response = await fetch(`http://localhost:8080/api/v1/orders/${orderId}/complete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewPayload)
            });

            let resData = {};
            try {
                resData = await response.json();
            } catch(e) {}

            if (response.ok && resData.status === 'success') {
                alert(resData.message || 'Nghiệm thu đơn hàng và gửi đánh giá thành công.');
                setShowReviewModal(false);
                setReviewComment('');
                setRating(5);
                await fetchOrderDetail();
            } else {
                console.warn(`[API Error] Mã lỗi ${response.status}. Tự động kích hoạt chuyển đổi giao diện cục bộ.`);
                setIsUsingMock(true);
                setOrder(prev => ({ ...prev, status: 'COMPLETED' }));
                setShowReviewModal(false);
                alert(`[Giả Lập Fallback] Hệ thống gặp lỗi xử lý từ máy chủ (${response.status}). Đã ép chuyển trạng thái đơn hàng sang: HOÀN THÀNH.`);
            }
        } catch (err) {
            console.warn("⚠️ [API Error] Lỗi kết nối API complete. Hệ thống tự động chuyển sang cơ chế giả lập Mock Data.");
            setIsUsingMock(true);
            setOrder(prev => ({ ...prev, status: 'COMPLETED' }));
            setShowReviewModal(false);
            alert(`[Mockup Giả Lập] Kết nối máy chủ thất bại, hệ thống đã cập nhật trạng thái cục bộ: HOÀN THÀNH`);
        } finally {
            setCompleteLoading(false);
        }
    };

    // Hàm xử lý gửi yêu cầu sửa đổi sản phẩm (Request Revision) từ Buyer lên API
    const handleRevisionSubmit = async (e) => {
        e.preventDefault();

        if (!revisionNote.trim()) {
            alert("Vui lòng nhập nội dung yêu cầu chỉnh sửa chi tiết.");
            return;
        }

        const formData = new FormData();
        formData.append('revisionNote', revisionNote.trim());
        if (revisionFile) {
            formData.append('file', revisionFile);
        }

        if (isUsingMock || !token) {
            setRevisionLoading(true);
            setTimeout(() => {
                setOrder(prev => ({ ...prev, status: 'IN_PROGRESS' }));
                setRevisionLoading(false);
                setShowRevisionForm(false);
                setRevisionNote('');
                setRevisionFile(null);
                alert("[Mockup] Đã gửi yêu cầu chỉnh sửa thành công! Trạng thái đơn chuyển về: ĐANG THỰC HIỆN.");
            }, 800);
            return;
        }

        try {
            setRevisionLoading(true);
            const response = await fetch(`http://localhost:8080/api/v1/orders/${orderId}/revision`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            let resData = {};
            try {
                resData = await response.json();
            } catch(e) {}

            if (response.ok && resData.status === 'success') {
                alert(resData.message || 'Đã gửi yêu cầu chỉnh sửa đến người bán.');
                setShowRevisionForm(false);
                setRevisionNote('');
                setRevisionFile(null);
                await fetchOrderDetail();
            } else {
                console.warn(`[API Error] Mã lỗi ${response.status}. Tự động kích hoạt chuyển đổi giao diện cục bộ.`);
                setIsUsingMock(true);
                setOrder(prev => ({ ...prev, status: 'IN_PROGRESS' }));
                setShowRevisionForm(false);
                setRevisionNote('');
                setRevisionFile(null);
                alert(`[Giả Lập Fallback] Hệ thống gặp lỗi xử lý từ máy chủ (${response.status}). Đã ép chuyển trạng thái đơn hàng sang: ĐANG THỰC HIỆN.`);
            }
        } catch (err) {
            console.warn("⚠️ [API Error] Lỗi kết nối API revision. Hệ thống tự động chuyển sang cơ chế giả lập Mock Data.");
            setIsUsingMock(true);
            setOrder(prev => ({ ...prev, status: 'IN_PROGRESS' }));
            setShowRevisionForm(false);
            setRevisionNote('');
            setRevisionFile(null);
            alert("[Mockup Giả Lập] Kết nối máy chủ thất bại, hệ thống đã cập nhật cục bộ đơn hàng về: ĐANG THỰC HIỆN.");
        } finally {
            setRevisionLoading(false);
        }
    };

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
                            {order.status === 'CANCELLED' && (
                                <p className="chat-system-text" style={{ color: '#ff4d4f', fontWeight: 'bold' }}>Hệ thống: Đơn hàng đã bị hủy bỏ hoặc hoàn tiền do quá hạn nộp sản phẩm.</p>
                            )}
                            {order.status === 'DELIVERED' && (
                                <p className="chat-system-text" style={{ color: '#1dbf73', fontWeight: 'bold' }}>Hệ thống: Người bán đã nộp sản phẩm bàn giao thành công. Chờ người mua xác nhận hoàn thành.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="workspace-sidebar">
                    {/* KHU VỰC NÚT DUYỆT ĐƠN DÀNH CHO SELLER */}
                    {order.status === 'PENDING' && !isBuyer && (
                        <div className="sidebar-widget seller-action-widget" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e4e5e7', marginBottom: '16px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: '#222325' }}>Yêu cầu đơn hàng mới</h4>
                            <p style={{ fontSize: '13px', color: '#62646a', margin: '0 0 16px 0', lineHeight: '1.4' }}>Buyer đã hoàn tất thanh toán và gửi yêu cầu. Vui lòng xác nhận thực hiện.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <button 
                                    onClick={() => handleProcessOrder('ACCEPT')} 
                                    disabled={actionLoading}
                                    style={{ width: '100%', padding: '10px', backgroundColor: '#1dbf73', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                                    type="button">
                                    {actionLoading ? 'Đang xử lý...' : 'Chấp nhận đơn hàng'}
                                </button>
                                <button 
                                    onClick={() => handleProcessOrder('REJECT')} 
                                    disabled={actionLoading}
                                    style={{ width: '100%', padding: '10px', backgroundColor: '#fff', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                                    type="button">
                                    {actionLoading ? 'Đang xử lý...' : 'Từ chối đơn hàng'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* KHU VỰC HÀNH ĐỘNG GIAO HÀNG KHI ĐƠN Ở TRẠNG THÁI IN_PROGRESS */}
                    {order.status === 'IN_PROGRESS' && (
                        <React.Fragment>
                            <div className="sidebar-widget countdown-widget">
                                <h4><Clock size={16} /> Thời gian còn lại</h4>
                                <div className="countdown-clock-box">{timeLeft}</div>
                            </div>

                            {!isBuyer && (
                                <div className="sidebar-widget deliver-action-widget" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e4e5e7', marginBottom: '16px' }}>
                                    <h4><Upload size={16} /> Bàn giao dịch vụ</h4>
                                    <p style={{ fontSize: '13px', color: '#62646a', margin: '8px 0 12px 0' }}>Bấm nút dưới đây để tải lên sản phẩm hoặc cung cấp link hoàn thành công việc gửi cho khách hàng.</p>
                                    
                                    {!showDeliverForm ? (
                                        <button 
                                            onClick={() => setShowDeliverForm(true)}
                                            style={{ width: '100%', padding: '10px', backgroundColor: '#1dbf73', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                                            type="button">
                                            Giao sản phẩm (Delivery Work)
                                        </button>
                                    ) : (
                                        <form onSubmit={handleDeliverOrderSubmit} className="deliver-embedded-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Tệp đính kèm (Tùy chọn):</label>
                                                <span style={{ display: 'block', fontSize: '11px', color: '#74767e', marginBottom: '6px', fontStyle: 'italic' }}>
                                                    * Nếu có nhiều file, vui lòng nén thành định dạng .zip hoặc .rar
                                                </span>
                                                <input 
                                                    type="file" 
                                                    onChange={(e) => setDeliverFile(e.target.files[0])}
                                                    style={{ fontSize: '12px', width: '100%' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Đường dẫn sản phẩm (Tùy chọn):</label>
                                                <input 
                                                    type="url" 
                                                    placeholder="https://github.com/... hoặc link figma" 
                                                    value={submissionLink}
                                                    onChange={(e) => setSubmissionLink(e.target.value)}
                                                    style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #b5b6ba', borderRadius: '4px', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Lời nhắn gửi (Bắt buộc):</label>
                                                <textarea 
                                                    rows="3"
                                                    placeholder="Nhập ghi chú gửi cho khách hàng..."
                                                    value={deliverNote}
                                                    onChange={(e) => setDeliverNote(e.target.value)}
                                                    style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #b5b6ba', borderRadius: '4px', resize: 'none', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                                <button 
                                                    type="submit" 
                                                    disabled={deliverLoading}
                                                    style={{ flex: 1, padding: '8px', backgroundColor: '#1dbf73', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    {deliverLoading ? 'Đang nộp...' : 'Gửi đi'}
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowDeliverForm(false)}
                                                    style={{ padding: '8px', backgroundColor: '#fff', color: '#62646a', border: '1px solid #b5b6ba', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </React.Fragment>
                    )}

                    {/* NÚT XỬ LÝ KHI TRẠNG THÁI LÀ ĐÃ BÀN GIAO (DELIVERED) VÀ DÀNH RIÊNG CHO BUYER */}
                    {order.status === 'DELIVERED' && isBuyer && (
                        <div className="sidebar-widget buyer-action-widget" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e4e5e7', marginBottom: '16px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: '#222325' }}>Sản phẩm đã được bàn giao</h4>
                            <p style={{ fontSize: '13px', color: '#62646a', margin: '0 0 16px 0', lineHeight: '1.4' }}>Người bán đã gửi sản phẩm nghiệm thu. Hãy kiểm tra kỹ sản phẩm trước khi xác nhận.</p>
                            
                            {!showRevisionForm ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button 
                                        onClick={() => setShowReviewModal(true)} 
                                        style={{ width: '100%', padding: '10px', backgroundColor: '#1dbf73', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                                        type="button">
                                        Chấp nhận & Nghiệm thu
                                    </button>
                                    <button 
                                        onClick={() => setShowRevisionForm(true)}
                                        style={{ width: '100%', padding: '10px', backgroundColor: '#fff', color: '#62646a', border: '1px solid #b5b6ba', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                                        type="button">
                                        Yêu cầu làm lại
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleRevisionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px dashed #e4e5e7', paddingTop: '10px' }}>
                                    <h5 style={{ margin: '0', fontSize: '13px', color: '#e44d26', fontWeight: 600 }}>Yêu cầu chỉnh sửa chi tiết</h5>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Lời nhắn chỉnh sửa (Bắt buộc):</label>
                                        <textarea 
                                            rows="3"
                                            required
                                            placeholder="Mô tả chi tiết những điểm cần sửa đổi, lỗi cần fix..."
                                            value={revisionNote}
                                            onChange={(e) => setRevisionNote(e.target.value)}
                                            style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #b5b6ba', borderRadius: '4px', resize: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Tệp đính kèm lỗi (Tùy chọn):</label>
                                        <input 
                                            type="file" 
                                            onChange={(e) => setRevisionFile(e.target.files[0])}
                                            style={{ fontSize: '12px', width: '100%' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                        <button 
                                            type="submit" 
                                            disabled={revisionLoading}
                                            style={{ flex: 1, padding: '8px', backgroundColor: '#f4511e', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            {revisionLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => { setShowRevisionForm(false); setRevisionNote(''); setRevisionFile(null); }}
                                            style={{ padding: '8px', backgroundColor: '#fff', color: '#62646a', border: '1px solid #b5b6ba', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            )}
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

            {/* FORM MODAL ĐÁNH GIÁ CHO BUYER KHI DUYỆT ĐƠN */}
            {showReviewModal && (
                <div className="review-modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="review-modal-card" style={{
                        backgroundColor: '#fff', padding: '24px', borderRadius: '8px',
                        width: '100%', maxWidth: '450px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600 }}>Nghiệm thu dịch vụ & Đánh giá</h3>
                        <p style={{ fontSize: '13px', color: '#62646a', marginBottom: '20px' }}>
                            Vui lòng cho biết mức độ hài lòng của bạn về dịch vụ của **{order.partnerName}** để hoàn tất đơn hàng.
                        </p>
                        
                        <form onSubmit={handleCompleteOrderSubmit}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={`star-${star}`}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        <Star 
                                            size={32} 
                                            fill={(hoveredRating || rating) >= star ? "#ffb33e" : "transparent"} 
                                            color={(hoveredRating || rating) >= star ? "#ffb33e" : "#b5b6ba"} 
                                        />
                                    </button>
                                ))}
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                                    Nhận xét về chất lượng sản phẩm *
                                </label>
                                <textarea
                                    rows="4"
                                    required
                                    placeholder="Chia sẻ cảm nhận của bạn về tiến độ, chất lượng code, thái độ làm việc của người bán..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px', fontSize: '13px',
                                        border: '1px solid #ced4da', borderRadius: '4px',
                                        resize: 'none', boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    style={{
                                        padding: '8px 16px', backgroundColor: '#fff',
                                        color: '#62646a', border: '1px solid #b5b6ba',
                                        borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
                                    }}
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="submit"
                                    disabled={completeLoading}
                                    style={{
                                        padding: '8px 20px', backgroundColor: '#1dbf73',
                                        color: '#fff', border: 'none', borderRadius: '4px',
                                        fontWeight: 'bold', cursor: 'pointer', fontSize: '13px'
                                    }}
                                >
                                    {completeLoading ? 'Đang hoàn tất...' : 'Xác nhận hoàn thành'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailPage;