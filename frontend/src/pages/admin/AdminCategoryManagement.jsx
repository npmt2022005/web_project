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
    const [imgUrl, setImgUrl] = useState('');
    const [parentId, setParentId] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    // ĐÃ SỬA: Bóc tách dữ liệu theo cấu trúc bọc APIResponse (response.data.data)
    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories/all'); 
            const result = await response.json();
            
            if (response.ok && result.status === 'success') {
                setCategories(result.data || []);
            } else {
                console.error("Không thể tải danh sách danh mục:", result.message);
            }
        } catch (error) {
            console.error("Lỗi kết nối Server backend:", error);
        }
    };

    // ĐÃ SỬA: Tìm kiếm cục bộ theo trường 'name' hoặc 'slug' thực tế của Entity
    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (cat.slug && cat.slug.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // ĐÃ SỬA: Đồng bộ hóa state form theo các thuộc tính mới của Entity
    const openModal = (category = null) => {
        if (category) {
            setSelectedCategory(category);
            setName(category.name);
            setImgUrl(category.imgUrl || '');
            setParentId(category.parentId || '');
        } else {
            setSelectedCategory(null);
            setName('');
            setImgUrl('');
            setParentId('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setName('');
        setImgUrl('');
        setParentId('');
    };

    // ĐÃ SỬA: Xử lý hiển thị thông báo chi tiết trả về từ Custom RuntimeException
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Khớp payload với CategoryDTO phía Backend
        const categoryData = { 
            name, 
            imgUrl: imgUrl.trim() === '' ? null : imgUrl, 
            parentId: parentId === '' ? null : parseInt(parentId) 
        };
        
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

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                fetchCategories();
                closeModal();
            } else {
                // Hiển thị trực tiếp thông điệp lỗi nghiệp vụ từ Backend (ví dụ: trùng tên, trùng slug)
                alert(result.message || "Có lỗi xảy ra khi lưu dữ liệu!");
            }
        } catch (error) {
            console.error("Lỗi gửi request:", error);
        }
    };

    // ĐÃ SỬA: Bắt lỗi chặn xóa do ràng buộc Gigs hoạt động hoặc chứa danh mục con
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            try {
                const response = await fetch(`/api/categories/${id}`, {
                    method: 'DELETE'
                });
                
                // Vì DELETE trả về 200 OK kèm APIResponse trống hoặc 204
                if (response.ok) {
                    fetchCategories();
                } else {
                    const result = await response.json();
                    alert(result.message || "Không thể xóa danh mục này!");
                }
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
            }
        }
    };

    // Hàm tiện ích hiển thị tên danh mục cha trên bảng
    const getParentName = (pId) => {
        if (!pId) return '—';
        const parentNode = categories.find(c => c.id === pId);
        return parentNode ? parentNode.name : `#${pId}`;
    };

    return (
        <div className="user-management-container">
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

            <div className="admin-filter-bar">
                <div className="search-box-wrapper" style={{ flex: 1 }}>
                    <Search size={16} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm danh mục theo tên, đường dẫn slug..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="admin-data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên Danh Mục</th>
                            <th>Đường dẫn (Slug)</th>
                            <th>Danh Mục Cha</th>
                            <th style={{ textAlign: 'center' }}>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => (
                                <tr key={cat.id}>
                                    <td>#{cat.id}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {cat.imgUrl && <img src={cat.imgUrl} alt="" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} />}
                                            <span className="user-fullname" style={{ fontWeight: '600', color: '#1a1b1e' }}>{cat.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: '#62646a', fontFamily: 'monospace' }}>
                                        {cat.slug}
                                    </td>
                                    <td style={{ fontWeight: cat.parentId ? '500' : 'normal', color: cat.parentId ? '#2e7d32' : '#95979d' }}>
                                        {getParentName(cat.parentId)}
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
                                <td colSpan="5" className="no-data-cell">Không tìm thấy danh mục hệ thống nào phù hợp.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                                    placeholder="Ví dụ: Graphics & Design, Backend Development..." 
                                    required 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Đường dẫn hình ảnh (Ảnh đại diện danh mục)</label>
                                <input 
                                    type="text" 
                                    value={imgUrl} 
                                    onChange={(e) => setImgUrl(e.target.value)} 
                                    placeholder="Đường dẫn URL ảnh (https://...)" 
                                />
                            </div>

                            <div className="form-group">
                                <label>Chọn cấp độ danh mục (Thuộc danh mục cha nào?)</label>
                                <select 
                                    value={parentId} 
                                    onChange={(e) => setParentId(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #b5b6ba', borderRadius: '4px', outline: 'none', backgroundColor: '#fff' }}
                                >
                                    <option value="">— Đặt làm Danh mục Gốc (Cấp cao nhất) —</option>
                                    {categories
                                        .filter(c => !selectedCategory || c.id !== selectedCategory.id) // Không cho phép chọn chính mình làm cha
                                        .map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))
                                    }
                                </select>
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