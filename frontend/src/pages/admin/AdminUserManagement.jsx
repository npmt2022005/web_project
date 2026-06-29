// src/pages/admin/AdminUserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Lock, Unlock, X } from 'lucide-react';
import './AdminUserManagement.css';

const mockUsers = [
  { id: 1, fullname: "Nguyễn Văn A", email: "vana@gmail.com", phone: "0912345678", roles: ["ROLE_ADMIN", "ROLE_BUYER"], created_at: "2026-01-15", status: "ACTIVE" },
  { id: 2, fullname: "Trần Thị B", email: "thib@gmail.com", phone: "0987654321", roles: ["ROLE_SELLER", "ROLE_BUYER"], created_at: "2026-02-20", status: "ACTIVE" },
  { id: 3, fullname: "Lê Minh C", email: "minhc@gmail.com", phone: "0933445566", roles: ["ROLE_BUYER"], created_at: "2026-03-05", status: "LOCKED" },
];

const AdminUserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // States dành cho Modal chỉnh sửa thành viên
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFullname, setEditFullname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoles, setEditRoles] = useState([]);

  // Giả định ID của tài khoản Admin hiện đang đăng nhập thao tác hệ thống (Nguyễn Văn A - ID: 1)
  const CURRENT_ADMIN_ID = 1;

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesRole = roleFilter === 'ALL' || user.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const toggleUserStatus = (userId) => {
    // 🛡️ CHẶN BẢO VỆ: Không cho phép Admin tự khóa tài khoản của chính mình
    if (userId === CURRENT_ADMIN_ID) {
      alert("Hệ thống bảo mật: Bạn không thể tự khóa tài khoản quản trị của chính mình!");
      return;
    }

    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, status: user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' };
      }
      return user;
    }));
  };

  // Kích hoạt mở Modal và nạp thông tin User được chọn
  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setEditFullname(user.fullname);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRoles(user.roles); // Mảng các quyền hiện tại
    setIsModalOpen(true);
  };

  // Xử lý bật/tắt checkbox lựa chọn quyền hạn
  const handleRoleCheckboxChange = (role) => {
    if (editRoles.includes(role)) {
      // Phải giữ lại ít nhất 1 quyền hệ thống
      if (editRoles.length === 1) {
        alert("Tài khoản phải sở hữu ít nhất một vai trò hoạt động!");
        return;
      }
      
      // 🛡️ CHẶN BẢO VỆ: Nếu đang sửa chính mình và bỏ chọn quyền ROLE_ADMIN -> Cảnh báo chặn lại
      if (selectedUser?.id === CURRENT_ADMIN_ID && role === 'ROLE_ADMIN') {
        alert("Hệ thống bảo mật: Bạn không thể tự gỡ bỏ quyền Quản trị viên (ROLE_ADMIN) của chính mình để tránh mất quyền cấu hình hệ thống!");
        return;
      }

      setEditRoles(editRoles.filter(r => r !== role));
    } else {
      setEditRoles([...editRoles, role]);
    }
  };

  // Lưu thông tin chỉnh sửa từ Form Modal đi cập nhật lại State
  const handleSaveChanges = (e) => {
    e.preventDefault();
    setUsers(users.map(user => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          fullname: editFullname,
          email: editEmail,
          phone: editPhone,
          roles: editRoles
        };
      }
      return user;
    }));
    setIsModalOpen(false);
  };

  // 🌟 ĐÃ CHỈNH SỬA: Chỉ hiển thị 1 quyền cao nhất theo thứ tự ưu tiên Admin > Seller > Buyer
  const renderRoleBadges = (roles) => {
    let mainRole = 'ROLE_BUYER';
    if (roles.includes('ROLE_ADMIN')) {
      mainRole = 'ROLE_ADMIN';
    } else if (roles.includes('ROLE_SELLER')) {
      mainRole = 'ROLE_SELLER';
    }

    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {mainRole === 'ROLE_ADMIN' && <span className="badge badge-admin">Admin</span>}
        {mainRole === 'ROLE_SELLER' && <span className="badge badge-seller">Seller</span>}
        {mainRole === 'ROLE_BUYER' && <span className="badge badge-buyer">Buyer</span>}
      </div>
    );
  };

  return (
    <div className="user-management-container">
      <div className="page-header-actions">
        <h3>Quản lý thành viên ({filteredUsers.length})</h3>
      </div>

      <div className="admin-filter-bar">
        <div className="search-box-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo Tên, Email, Số điện thoại..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown-wrapper">
          <Filter size={16} className="filter-icon" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">Tất cả vai trò</option>
            <option value="ROLE_ADMIN">Quản trị viên (Admin)</option>
            <option value="ROLE_SELLER">Người bán (Seller)</option>
            <option value="ROLE_BUYER">Người mua (Buyer)</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thành viên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Ngày tham gia</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className={user.status === 'LOCKED' ? 'row-locked' : ''}>
                  <td>#{user.id}</td>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">
                        {user.fullname.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-fullname">{user.fullname}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || '---'}</td>
                  <td>{user.created_at}</td>
                  <td>{renderRoleBadges(user.roles)}</td>
                  <td>
                    <span className={`status-text ${user.status.toLowerCase()}`}>
                      {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-group">
                      <button className="btn-action edit" onClick={() => handleOpenEditModal(user)} title="Sửa thông tin">
                        <Edit size={14} /> Sửa
                      </button>
                      <button 
                        className={`btn-action ${user.status === 'ACTIVE' ? 'lock' : 'unlock'}`}
                        onClick={() => toggleUserStatus(user.id)}
                        title={user.status === 'ACTIVE' ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      >
                        {user.status === 'ACTIVE' ? (
                          <><Lock size={14} /> Khóa</>
                        ) : (
                          <><Unlock size={14} /> Mở khóa</>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data-cell">Không tìm thấy người dùng phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* WORKFLOW MODAL FORM: Biểu mẫu nổi chỉnh sửa thông tin & hạ/nâng quyền */}
      {isModalOpen && (
        <div className="category-modal-overlay">
          <div className="category-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Cập Nhật Quyền & Thành Viên</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#62646a' }} onClick={() => setIsModalOpen(false)} />
            </div>
            
            <form onSubmit={handleSaveChanges}>
              <div className="form-group">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  value={editFullname} 
                  onChange={(e) => setEditFullname(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ Email</label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input 
                  type="text" 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)} 
                />
              </div>

              {/* KHU VỰC QUẢN LÝ VAI TRÒ (VÔ CÙNG QUAN TRỌNG) */}
              <div className="form-group">
                <label style={{ marginBottom: '10px', display: 'block' }}>Phân quyền tài khoản (Roles):</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e4e5e7' }}>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                    <input 
                      type="checkbox" 
                      checked={editRoles.includes('ROLE_ADMIN')} 
                      onChange={() => handleRoleCheckboxChange('ROLE_ADMIN')}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <span><strong>ROLE_ADMIN</strong> — Toàn quyền quản trị hệ thống</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                    <input 
                      type="checkbox" 
                      checked={editRoles.includes('ROLE_SELLER')} 
                      onChange={() => handleRoleCheckboxChange('ROLE_SELLER')}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <span><strong>ROLE_SELLER</strong> — Được quyền đăng dịch vụ làm việc</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                    <input 
                      type="checkbox" 
                      checked={editRoles.includes('ROLE_BUYER')} 
                      onChange={() => handleRoleCheckboxChange('ROLE_BUYER')}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <span><strong>ROLE_BUYER</strong> — Quyền mua dịch vụ cơ bản</span>
                  </label>
                  
                </div>
              </div>

              <div className="form-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-modal-submit">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;