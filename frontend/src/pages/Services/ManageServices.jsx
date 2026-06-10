// src/pages/Services/ManageServices.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenSquare, Trash2, ArrowUpRight } from 'lucide-react';
import './ManageServices.css';

// MOCK DATA: Giả lập danh sách dịch vụ của Seller theo cấu trúc hệ thống
const MOCK_SERVICES = [
    {
        id: 1,
        title: "I will design modern websites in figma or adobe xd",
        thumbnailUrl: "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg",
        category: "Web & App Design",
        cost: 500.00,
        pricingType: "Fixed",
        status: "active", // active, pending, ongoing, completed, canceled
        features: ["Delievred with in a day", "Delievry Time Descreased", "Upload apps to Stores"]
    },
    {
        id: 2,
        title: "I will build secure backend REST APIs using Spring Boot",
        thumbnailUrl: "https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg",
        category: "Backend Development",
        cost: 350.00,
        pricingType: "Fixed",
        status: "active",
        features: ["Clean architecture", "Database integration", "Full API documentation"]
    },
    {
        id: 3,
        title: "I will deploy and setup AWS cloud infrastructure",
        thumbnailUrl: "https://images.pexels.com/photos/546814/pexels-photo-546814.jpeg",
        category: "DevOps",
        cost: 150.00,
        pricingType: "Fixed",
        status: "pending",
        features: ["CI/CD Pipeline Setup", "Docker containerization"]
    }
];

const ManageServices = () => {
    const navigate = useNavigate();
    
    // Quản lý tab hiện tại đang được chọn (Mặc định là Active Services như hình mẫu)
    const [activeTab, setActiveTab] = useState('active');
    const [services, setServices] = useState(MOCK_SERVICES);

    // Định nghĩa danh sách các tab hiển thị ở thanh điều hướng phụ
    const tabs = [
        { id: 'active', label: 'Active Services' },
        { id: 'pending', label: 'Pending Services' },
        { id: 'ongoing', label: 'Ongoing Services' },
        { id: 'completed', label: 'Completed Services' },
        { id: 'canceled', label: 'Canceled Services' }
    ];

    // Lọc danh sách dịch vụ tương ứng với tab đang chọn
    const filteredServices = services.filter(service => service.status === activeTab);

    // Hàm giả lập xóa dịch vụ cục bộ trên giao diện UI
    const handleDeleteService = (id) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            setServices(services.filter(item => item.id !== id));
        }
    };

    // Hàm chuyển hướng sang trang sửa dịch vụ
    const handleEditService = (id) => {
        navigate(`/edit-service/${id}`);
    };

    // 🌟 ĐÃ SỬA: Chuyển hướng chính xác sang route '/create-gig' theo cấu hình trong App.jsx
    const handleAddNewService = () => {
        navigate('/create-gig'); 
    };

    return (
        <div className="manage-services-container">
            {/* Thanh Tiêu đề Header của Trang */}
            <div className="manage-services-header">
                <div className="header-left">
                    <h1>Manage Services</h1>
                </div>
                {/* Nút Add Service được tích hợp trực tiếp tại đây giống ảnh mẫu */}
                <button className="btn-add-service-trigger" onClick={handleAddNewService}>
                    Add Service <ArrowUpRight size={16} />
                </button>
            </div>

            {/* Khung nội dung chính chứa Tab và Bảng */}
            <div className="services-card-wrapper">
                
                {/* Thanh điều hướng phân loại Tab */}
                <div className="services-tabs-bar">
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

                {/* Khu vực bảng hiển thị danh sách dịch vụ */}
                <div className="services-table-container">
                    <table className="services-data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50%' }}>Title</th>
                                <th style={{ width: '20%' }}>Category</th>
                                <th style={{ width: '15%' }}>Type/Cost</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.length > 0 ? (
                                filteredServices.map((service) => (
                                    <tr key={service.id}>
                                        {/* Cột 1: Thumbnail & Tiêu đề kèm danh sách tính năng thu nhỏ */}
                                        <td>
                                            <div className="service-info-cell">
                                                <img src={service.thumbnailUrl} alt={service.title} className="service-thumb-img" />
                                                <div className="service-details-text">
                                                    <h4 className="service-title-link">{service.title}</h4>
                                                    <ul className="service-features-bullets">
                                                        {service.features.map((feature, index) => (
                                                            <li key={index}>{feature}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Cột 2: Phân mục chuyên môn */}
                                        <td>
                                            <span className="category-text-badge">{service.category}</span>
                                        </td>
                                        
                                        {/* Cột 3: Giá và hình thức thanh toán */}
                                        <td>
                                            <span className="cost-text-bold">${service.cost.toFixed(2)}/{service.pricingType}</span>
                                        </td>
                                        
                                        {/* Cột 4: Bộ nút thao tác nhanh (Sửa / Xóa) */}
                                        <td>
                                            <div className="actions-cell-flex">
                                                <button 
                                                    className="action-icon-btn edit-btn"
                                                    onClick={() => handleEditService(service.id)}
                                                    title="Edit service"
                                                >
                                                    <PenSquare size={16} />
                                                </button>
                                                <button 
                                                    className="action-icon-btn delete-btn"
                                                    onClick={() => handleDeleteService(service.id)}
                                                    title="Delete service"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-table-state">
                                        No services found in this section.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default ManageServices;