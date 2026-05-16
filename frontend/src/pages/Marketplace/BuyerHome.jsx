import React from 'react';
import { Search, Star, MessageSquare, Bell, User } from 'lucide-react';
import '../HomeStyles.css';

const BuyerHome = () => {
  const fullname = localStorage.getItem('fullname') || 'Khách';

  // Mock data dựa trên bảng categories trong SQL của bạn
  const categories = [
    "Graphics & Design", "Digital Marketing", "Writing & Translation", 
    "Video & Animation", "Music & Audio", "Programming & Tech"
  ];

  // Mock data dựa trên cấu trúc bảng Gigs
  const featuredGigs = [
    { id: 1, title: "I will design a modern minimalist logo", seller: "Trung Kien", rating: 4.9, reviews: 124, price: 50, image: "https://via.placeholder.com/250x150" },
    { id: 2, title: "I will build a responsive Spring Boot website", seller: "DevPro", rating: 5.0, reviews: 89, price: 200, image: "https://via.placeholder.com/250x150" },
    { id: 3, title: "I will write SEO optimized blog posts", seller: "Writer99", rating: 4.8, reviews: 45, price: 30, image: "https://via.placeholder.com/250x150" },
  ];

  return (
    <div className="buyer-container">
      {/* 1. Header */}
      <header className="home-header">
        <div className="header-left">
          <h2 className="logo-text">Freelance<span>Market</span></h2>
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="What service are you looking for today?" />
          </div>
        </div>
        <div className="header-right">
          <span className="nav-link">Become a Seller</span>
          <MessageSquare size={20} className="icon-btn" />
          <Bell size={20} className="icon-btn" />
          <div className="user-profile">
             <User size={20} />
             <span>{fullname}</span>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <h1>Find the perfect <i>freelance</i> services for your business</h1>
        <div className="popular-tags">
          <span>Popular:</span>
          {categories.slice(0, 4).map(cat => <button key={cat}>{cat}</button>)}
        </div>
      </section>

      {/* 3. Categories Bar */}
      <nav className="category-bar">
        {categories.map(cat => <a href="#" key={cat}>{cat}</a>)}
      </nav>

      {/* 4. Featured Gigs */}
      <main className="main-content">
        <h3>Popular professional services</h3>
        <div className="gig-grid">
          {featuredGigs.map(gig => (
            <div className="gig-card" key={gig.id}>
              <img src={gig.image} alt={gig.title} />
              <div className="gig-info">
                <div className="seller-meta">
                  <div className="avatar-sm">{gig.seller[0]}</div>
                  <span className="seller-name">{gig.seller}</span>
                </div>
                <p className="gig-title">{gig.title}</p>
                <div className="gig-rating">
                  <Star size={14} fill="#ffb33e" color="#ffb33e" />
                  <span><b>{gig.rating}</b> ({gig.reviews})</span>
                </div>
              </div>
              <div className="gig-footer">
                <span>STARTING AT</span>
                <span className="price">${gig.price}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BuyerHome;