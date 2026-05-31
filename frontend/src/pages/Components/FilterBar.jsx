import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import './FilterBar.css'; // 
import AllFilterBar from './AllFilterBar';

export default function FilterBar({ metaData, filters, onFilterChange }) {
    
    if (!metaData) return <div className="status-message">Đang tải bộ lọc...</div>;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    return (
        <div className="filter-bar-container">
            <AllFilterBar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                filters={filters}
                onFilterChange={onFilterChange}
                metaData = {metaData}
            />
            {/* KHỐI BÊN TRÁI: Các nút lọc */}
            <div className="filter-left-group">

                {/* Nút All Filter */}
                <button
                    className="filter-btn all-filter-btn"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Hiển thị tất cả bộ lọc"
                >
                    <SlidersHorizontal size={16} /> All Filter
                </button>
                

            </div>

            <div className="filter-right-group">
                <span className="sort-label">Sắp xếp</span>
                <div className="custom-select-wrapper sort-wrapper">
                    <select
                        value={filters.sortBy || 'BestSeller'}
                        onChange={(e) => onFilterChange('sortBy', e.target.value)}
                    >
                        <option value="BestSeller">Bán chạy nhất</option>
                        <option value="Recommended">Đề xuất cho bạn</option>
                        <option value="NewArrivals">Mới nhất</option>
                    </select>
                </div>
            </div>
        </div>
    );
}