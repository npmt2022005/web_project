import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import hook điều hướng của React Router
import './GigCard.css';

export default function GigCard({ gig }) {
    const navigate = useNavigate(); // 2. Khởi tạo hàm điều hướng

    const defaultGig = {
        thumbnailUrl: 'https://via.placeholder.com/320x200?text=No+Image+Available',
        title: 'I will build an amazing full-stack website for you',
        seller: 'Freelancer_Mock',
        level: 'Level 1 Seller',
        rating: 4.8,
        reviews: 125,
        price: 50
    };
    const data = gig || defaultGig;

    return (
        /* 3. Thêm sự kiện onClick vào thẻ bao bọc ngoài cùng để click vào là chuyển trang, thêm style con trỏ chuột pointer */
        <div 
            className="gig-card" 
            onClick={() => navigate(`/gigs/${data.id || 1}`)} 
            style={{ cursor: 'pointer' }}
        >
            <div className="card-thumbnail">
                <img
                    src={data.thumbnailUrl || 'https://via.placeholder.com/320x200'}
                    alt={data.title}
                />
            </div>
            <div className="card-body">
                <div className="seller-avatar-mock">
                    {data.seller ? data.seller.charAt(0).toUpperCase() : 'U'}
                </div>

                <div>
                    <span className="seller-name">{data.seller}</span>
                    <span className="seller-level-badge">{data.level}</span>
                </div>
                <h3 className="gig-brand-title gig-title">{data.title}</h3>
                <div className="rating-info">
                    <span className="star-icon">★ {data.rating?.toFixed(1) || '0.0'}</span>
                    <span>({data.reviews || 0})</span>
                </div>
                <div className="card-footer">
                    <span className="price-label">Giá khởi điểm</span>
                    <span className="price-value">${data.price}</span>
                </div>
            </div>
        </div>
    );
}