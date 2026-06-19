// src/pages/admin/AdminCategoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, FolderPlus, X } from 'lucide-react';
import './AdminCategoryManagement.css';

const AdminCategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                console.error("Không thể tải danh sách danh mục");
            }
        } catch (error) {
            console.error("Lỗi kết nối Server backend:", error);
        }
    };

    // Tìm kiếm danh mục cục bộ theo text nhập vào ô Search giống trang User
    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const openModal = (category = null) => {
        if (category) {
            setSelectedCategory(category);
            setName(category.name);
            setDescription(category.description || '');
        } else {
            setSelectedCategory(null);
            setName('');
            setDescription('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setName('');
        setDescription('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const categoryData = { name, description };
        const url = selectedCategory 
            ? `/api/categories/${selectedCategory.id}`
            : '/api/categories';
        const method = selectedCategory ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData)
            });

            if (response.ok) {
                fetchCategories();
                closeModal();
            } else {
                alert("Có lỗi xảy ra khi lưu dữ liệu!");
            }
        } catch (error) {
            console.error("Lỗi gửi request:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            try {
                const response = await fetch(`/api/categories/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchCategories();
                } else {
                    alert("Không thể xóa danh mục này!");
                }
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
            }
        }
    };

    return (
        <div className="user-management-container"> {/* Sử dụng chung lớp bọc ngoài để đồng bộ layout */}
            <div className="page-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Quản lý danh mục ({filteredCategories.length})</h3>
                <button 
                    className="btn-action edit" 
                    style={{ background: '#1dbf73', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '6px' }}
                    onClick={() => openModal()}
                >
                    <FolderPlus size={16} /> + Thêm danh mục
                </button>
            </div>

            {/* Thanh tìm kiếm đồng bộ thiết kế 100% với trang AdminUserManagement */}
            <div className="admin-filter-bar">
                <div className="search-box-wrapper" style={{ flex: 1 }}>
                    <Search size={16} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm danh mục theo tên, từ khóa mô tả..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Bảng hiển thị dữ liệu đồng bộ cấu trúc CSS chung của phần Admin */}
            <div className="table-responsive">
                <table className="admin-data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên Danh Mục</th>
                            <th>Mô Tả Chi Tiết</th>
                            <th style={{ textAlign: 'center' }}>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => (
                                <tr key={cat.id}>
                                    <td>#{cat.id}</td>
                                    <td>
                                        <span className="user-fullname" style={{ fontWeight: '600', color: '#1a1b1e' }}>{cat.name}</span>
                                    </td>
                                    <td style={{ color: cat.description ? '#62646a' : '#b5b6ba', fontStyle: cat.description ? 'normal' : 'italic' }}>
                                        {cat.description || 'Không có mô tả cho danh mục này'}
                                    </td>
                                    <td>
                                        <div className="action-buttons-group">
                                            <button className="btn-action edit" onClick={() => openModal(cat)} title="Sửa danh mục">
                                                <Edit size={14} /> Sửa
                                            </button>
                                            <button className="btn-action lock" style={{ color: '#dc3545', borderColor: '#dc3545' }} onClick={() => handleDelete(cat.id)} title="Xóa danh mục">
                                                <Trash2 size={14} /> Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-data-cell">Không tìm thấy danh mục hệ thống nào phù hợp.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Popup Thêm / Sửa đồng bộ giao diện overlay */}
            {isModalOpen && (
                <div className="category-modal-overlay">
                    <div className="category-modal-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>{selectedCategory ? 'Cập Nhật Danh Mục' : 'Tạo Danh Mục Mới'}</h3>
                            <X size={20} style={{ cursor: 'pointer', color: '#62646a' }} onClick={closeModal} />
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên danh mục <span style={{ color: '#dc3545' }}>*</span></label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Ví dụ: Graphics & Design, Biên tập Video..." 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả ngắn</label>
                                <textarea 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    placeholder="Nhập thông tin mô tả định hướng dịch vụ..."
                                    rows="4"
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #b5b6ba', borderRadius: '4px', resize: 'vertical', outline: 'none' }}
                                />
                            </div>
                            <div className="form-modal-actions">
                                <button type="button" className="btn-modal-cancel" onClick={closeModal}>
                                    Hủy bỏ
                                </button>
                                <button type="submit" className="btn-modal-submit">
                                    {selectedCategory ? 'Lưu cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoryManagement;