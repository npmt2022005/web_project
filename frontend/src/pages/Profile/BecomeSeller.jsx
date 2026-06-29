// src/pages/Profile/BecomeSeller.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Briefcase } from 'lucide-react';
import apiClient from '../../services/apiClient';

const BecomeSeller = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const res = await apiClient.post('/v1/profile/me/upgrade');
            if (res.data?.status === 'success') {
                const role = res.data.data?.role || 'ROLE_SELLER';
                const sellerId = res.data.data?.sellerId;
                localStorage.setItem('role', role);
                alert('Bạn đã trở thành người bán!');
                if (sellerId) {
                    navigate(`/seller/${sellerId}`, { replace: true });
                } else {
                    navigate('/manage-services', { replace: true });
                }
                window.location.reload(); 
            } else {
                throw new Error(res.data?.message || 'Không thể nâng cấp tài khoản');
            }
        } catch (err) {
            console.error('Become seller error:', err);
            alert(err.response?.data?.message || err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', padding: 20 }}>
            <Briefcase size={48} color="#1dbf73" />
            <h2 style={{ marginTop: 16 }}>Sẵn sàng trở thành người bán?</h2>
            <p style={{ color: '#74767e', marginBottom: 24 }}>
                Hồ sơ của bạn đã đầy đủ thông tin. Xác nhận để bắt đầu nhận đơn hàng và quản lý dịch vụ.
            </p>
            <button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                    background: '#1dbf73', color: '#fff', border: 'none', borderRadius: 30,
                    padding: '14px 32px', fontWeight: 700, cursor: 'pointer'
                }}
            >
                {loading ? 'Đang xử lý...' : (<><CheckCircle2 size={16} style={{ marginRight: 8 }} /> Xác nhận trở thành Seller</>)}
            </button>
        </div>
    );
};

export default BecomeSeller;