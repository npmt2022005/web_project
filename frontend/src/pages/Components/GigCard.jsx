import React from 'react';
import './GigCard.css'
export default function GigCard({ gig }) {
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
        <div className="gig-card">
            <div className="card-thumbnail">
                <img
                    src={gig.thumbnailUrl || 'https://via.placeholder.com/320x200'}
                    alt={gig.title}
                />
            </div>
            <div className="card-body">
                <div className="seller-avatar-mock">
                    {gig.seller ? gig.seller.charAt(0).toUpperCase() : 'U'}
                </div>

                <div>
                    <span classname="seller-name">{gig.seller}</span>
                    <span className="seller-level-badge">{gig.level}</span>
                </div>
                <h3 className="gig-brand-title gig-title">{gig.title}</h3>
                <div className="rating-info">
                    <span className="star-icon">★ {gig.rating?.toFixed(1) || '0.0'}</span>
                    <span>({gig.reviews || 0})</span>
                </div>
                <div className="card-footer">
                    <span className="price-label">Giá khởi điểm</span>
                    <span className="price-value">${gig.price}</span>
                </div>
            </div>
        </div>

    );
}