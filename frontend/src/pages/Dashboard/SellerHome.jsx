import React from 'react';
import { LayoutDashboard, PlusCircle, DollarSign, List, User } from 'lucide-react';
import '../HomeStyles.css';

const SellerHome = () => {
  const fullname = localStorage.getItem('fullname') || 'Seller';

  // Thống kê dựa trên bảng Wallets và Gigs
  const stats = [
    { label: "Active Orders", value: "3", icon: <List color="#22c55e" /> },
    { label: "Total Earnings", value: "$1,250", icon: <DollarSign color="#3b82f6" /> },
    { label: "Gigs Performance", value: "85%", icon: <LayoutDashboard color="#a855f7" /> }
  ];

  return (
    <div className="seller-container">
      {/* 1. Header */}
      <header className="home-header seller-header">
        <div className="header-left">
          <h2 className="logo-text">Seller<span>Dashboard</span></h2>
        </div>
        <div className="header-right">
          <button className="btn-switch">Switch to Buying</button>
          <div className="user-profile">
             <User size={20} />
             <span>{fullname}</span>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        {/* 2. Welcome & Stats */}
        <div className="welcome-banner">
          <h1>Chào mừng trở lại, {fullname}!</h1>
          <p>Dưới đây là tình hình kinh doanh của bạn hôm nay.</p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-data">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Gig Management Section */}
        <section className="manage-section">
          <div className="section-header">
            <h3>Your Active Gigs</h3>
            <button className="btn-add-gig">
              <PlusCircle size={18} /> Create New Gig
            </button>
          </div>
          
          <div className="gig-table-placeholder">
             <table className="custom-table">
               <thead>
                 <tr>
                   <th>Gig Detail</th>
                   <th>Price</th>
                   <th>Status</th>
                   <th>Action</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td>Modern Minimalist Logo Design</td>
                   <td>$50</td>
                   <td><span className="badge active">Active</span></td>
                   <td><button className="btn-edit">Edit</button></td>
                 </tr>
               </tbody>
             </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SellerHome;