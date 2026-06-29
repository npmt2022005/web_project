// src/pages/Orders/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm'; 
import './CheckoutPage.css';

// Khởi tạo tiến trình kết nối Stripe
const stripePromise = loadStripe('pk_test_51Tg7eZGelijEYFpHsjaRXkO8OgpKAKccTJN7VqJ6xMo3THlfMRCgd3nH2VLiynqxnS2ePP1mQdPzLovSbqSt3yLb00LIFjyIcO');

const CheckoutPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [clientSecret, setClientSecret] = useState(''); // Lưu trữ chuỗi bảo mật từ API mới
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const responseSummary = await fetch(`/api/v1/orders/${orderId}/summary`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const resultSummary = await responseSummary.json();
                
                if (resultSummary.status === "success" && resultSummary.data) {
                    setSummary(resultSummary.data);
                } else {
                    throw new Error("Không tìm thấy dữ liệu đơn hàng trên hệ thống.");
                }

                // --- 2. Gọi API 2 mới để lấy mã bảo mật Payment Intent ---
                const responseIntent = await fetch('/api/v1/payments/create-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ orderId: parseInt(orderId) || 101 })
                });

                if (!responseIntent.ok) {
                    throw new Error("API 2 trả về lỗi server.");
                }
                const resultIntent = await responseIntent.json();
                const actualSecret = resultIntent.data?.clientSecret || resultIntent.clientSecret;

                if (actualSecret) {
                    setClientSecret(actualSecret);
                    console.log("Đã lấy được clientSecret thật từ Backend:", actualSecret);
                } else {
                    console.warn("API không phản hồi kèm chuỗi clientSecret.");
                }

            } catch (err) {
                console.warn("⚠️ Hệ thống API Backend lỗi hoặc chưa phản hồi. Chuyển cấu trúc sang Mock Data.");
                
                // Nạp dữ liệu hóa đơn dự phòng
                setSummary({
                    "orderId": orderId ? parseInt(orderId) : 101,
                    "gig": {
                        "title": "I will train any yolo model on custom dataset (Mock Data)",
                        "thumbnailUrl": "https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg",
                        "sellerName": "Usman Yaqoob"
                    },
                    "paymentDetails": {
                        "selectedPackage": "Standard",
                        "gigPrice": 65.00,
                        "serviceFee": 7.08, 
                        "totalAmount": 72.08,
                        "currency": "USD"
                    }
                });

                // Cấp mã cứu hộ giả lập để form thẻ Elements không bị crash giao diện
                setClientSecret('mock_secret_intent_key_12345');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [orderId, token, navigate]);

    if (loading) return <div className="loading-state"><Loader2 className="animate-spin" /> Loading summary...</div>;
    if (!summary) return <div>Data not found</div>;

    // Cấu hình options cho Elements để hỗ trợ xử lý Split Elements an toàn
    const stripeOptions = {
        clientSecret: clientSecret.startsWith('mock_') ? undefined : clientSecret,
    };

    return (
        <div className="checkout-container">
            <div className="checkout-grid">
                {/* Cột trái: Thông tin dịch vụ (Giữ nguyên logic cũ) */}
                <div className="order-details-card">
                    <h2>Finalize Order</h2>
                    <div className="gig-summary-box">
                        <img src={summary.gig.thumbnailUrl} alt="Gig Thumbnail" />
                        <div className="gig-info-text">
                            <h3>{summary.gig.title}</h3>
                            <p className="seller-name">Seller: <strong>{summary.gig.sellerName}</strong></p>
                            <span className="badge-package">{summary.paymentDetails.selectedPackage} Package</span>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Bảng tính tiền & Khung điền Form của Stripe */}
                <div className="price-summary-card">
                    <h3>Summary</h3>
                    <div className="price-row">
                        <span>Gig Price</span>
                        <span>${summary.paymentDetails.gigPrice.toFixed(2)}</span>
                    </div>
                    <div className="price-row">
                        <span>Service Fee</span>
                        <span>${summary.paymentDetails.serviceFee.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="price-row total-row">
                        <span>Total</span>
                        <span>${summary.paymentDetails.totalAmount.toFixed(2)}</span>
                    </div>

                    {/* Bọc Form và truyền cấu hình options vào để Split Elements hoạt động không lỗi */}
                    {/* BỔ SUNG TRUYỀN THÊM orderId VÀO CHECKOUTFORM ĐỂ TIẾN HÀNH ĐIỀU HƯỚNG */}
                    <Elements stripe={stripePromise} options={stripeOptions.clientSecret ? stripeOptions : undefined}>
                        <CheckoutForm summary={summary} clientSecret={clientSecret} orderId={orderId} />
                    </Elements>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;