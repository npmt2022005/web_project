import React from 'react';
import { X, Star } from 'lucide-react';
import './AllFilterBar.css';

export default function AllFilterBar({ isOpen, onClose, filters, onFilterChange, metaData }) {
    const deliveryTimeTranslations = {
        "Express 24h": "Hỏa tốc 24h",
        "Up to 3 days": "Tối đa 3 ngày",
        "Up to 7 days": "Tối đa 7 ngày",
        "Over 7 days": "Trên 7 ngày"
    };
    const sellerLevelTranslations = {
        "New Seller": "Người bán mới",
        "Level One": "Cấp độ 1",
        "Level Two": "Cấp độ 2",
        "Top Rated": "Chuyên gia (Top Rated)"
    };
    const maxSystem = metaData.maxSystemPrice || 500;

    // 2. Lấy giá trị hiện tại của bộ lọc (ép về kiểu số). Nếu chưa chọn thì min = 0, max = maxSystem
    const currentMin = filters.minPrice !== undefined ? Number(filters.minPrice) : 0;
    const currentMax = filters.maxPrice !== undefined ? Number(filters.maxPrice) : maxSystem;

    // 3. Tính toán phần trăm để vẽ cái dải màu xanh ở giữa 2 cục kéo
    const minPercent = (currentMin / maxSystem) * 100;
    const maxPercent = (currentMax / maxSystem) * 100;
    return (
        <>
            {/* Lớp phủ đen mờ (Click vào đây cũng đóng Sidebar) */}
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}  // (màn đen)if isOpen = true className = "sidebar-overlay open" 
                onClick={onClose} // nếu lick chuột ở ngoại thanh sidebar thì gọi onClose
            ></div>

            {/* Khối Sidebar trượt từ trái sang */}
            <div className={`all-filter-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="sidebar-content">
                    {/* BỘ LỌC ĐỊA ĐIỂM */}
                    <div className="sidebar-section">
                        <h3>ĐỊA ĐIỂM</h3>
                        <div className="sidebar-select-group">
                            <select
                                value={filters.location || ''}
                                onChange={(e) => onFilterChange('location', e.target.value)}
                            >
                                <option value="">Tất cả quốc gia</option>
                                {(metaData.locations && metaData.locations.length > 0
                                    ? metaData.locations
                                    : ["Vietnam", "United States", "Singapore", "Japan"] // 
                                ).map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="sidebar-select-group">
                        <h3>THỜI GIAN HOÀN THÀNH</h3>
                        <select
                            value={filters.deliveryTime || ''}
                            onChange={(e) => onFilterChange('deliveryTime', e.target.value)}
                        >
                            {(metaData.deliveryTimes && metaData.deliveryTimes.length > 0
                                ? metaData.deliveryTimes
                                : ["Express 24h", "Up to 3 days", "Up to 7 days", "Over 7 days"]
                            ).map((time) => (
                                <option key={time} value={time}>
                                    {deliveryTimeTranslations[time] || time}
                                </option>
                            ))}
                        </select>
                    </div>
                    

                    <div className="sidebar-select-group">
                        <h3> Cấp độ người bán</h3>
                        <select
                            value={filters.level || ''}
                            onChange={(event) => onFilterChange('level', event.target.value)}
                        >
                            <option value="">Tất cả cấp độ</option>

                            {/* KIỂM TRA: Nếu có dữ liệu từ API thì dùng, không có thì dùng mảng dữ liệu giả dự phòng */}
                            {(metaData.sellerLevels && metaData.sellerLevels.length > 0
                                ? metaData.sellerLevels
                                : ["New Seller", "Level One", "Level Two", "Top Rated"] // <-- Khối dữ liệu dự phòng
                            ).map((level) => (
                                <option key={level} value={level}>
                                    {/* Hiển thị tiếng Việt thông qua từ điển dịch, nếu không có thì hiện tiếng Anh gốc */}
                                    {sellerLevelTranslations[level] || level}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="sidebar-select-group">
                        <h3>NGÂN SÁCH</h3>

                    <div className="budget-filter">
                        {/* KHU VỰC THANH KÉO 2 ĐẦU */}
                        <div className="dual-slider-container">
                            {/* Lớp nền xám của thanh kéo */}
                            <div className="slider-track"></div>
                            
                            {/* Dải màu xanh chạy ở giữa Min và Max */}
                            <div 
                                className="slider-range" 
                                style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                            ></div>

                            {/* Thanh kéo cục MIN */}
                            <input 
                                type="range" 
                                min="0" 
                                max={maxSystem} 
                                value={currentMin} 
                                onChange={(event) => {
                                    const value = Math.min(Number(event.target.value), currentMax - 1);
                                    onFilterChange('minPrice', value);
                                }}
                            />

                            {/* Thanh kéo cục MAX */}
                            <input 
                                type="range" 
                                min="0" 
                                max={maxSystem} 
                                value={currentMax} 
                                onChange={(event) => {
                                    const value = Math.max(Number(event.target.value), currentMin + 1);
                                    onFilterChange('maxPrice', value);
                                }}
                            />
                        </div>

                        {/* HAI Ô NHẬP SỐ HIỂN THỊ TRỰC QUAN */}
                        <div className="price-inputs">
                            <div className="input-box">
                                <label>Min ($)</label>
                                <input 
                                    type="number" 
                                    className="price-input"
                                    value={currentMin}
                                    onChange={(e) => onFilterChange('minPrice', e.target.value)}
                                />
                            </div>
                            <span className="price-separator">-</span>
                            <div className="input-box">
                                <label>Max ($)</label>
                                <input 
                                    type="number" 
                                    className="price-input"
                                    value={currentMax}
                                    onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
</div>

                    <div className="sidebar-select-group">
                        <h3>NGÔN NGỮ</h3>
                        <div className="language-options">
                            {(metaData.languages && metaData.languages.length > 0
                                ? metaData.languages
                                : ["English", "Vietnamese", "Japanese", "Spanish"]
                            ).map((lang) => (
                                <label key={lang} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={Array.isArray(filters.languages) ? filters.languages.includes(lang) : false}
                                        onChange={(e) => {
                                            const prev = Array.isArray(filters.languages) ? [...filters.languages] : [];
                                            if (e.target.checked) {
                                                onFilterChange('languages', [...prev, lang]);
                                            } else {
                                                onFilterChange('languages', prev.filter(l => l !== lang));
                                            }
                                        }}
                                    />
                                    <span className="checkmark-box"></span>
                                    {lang}
                                </label>
                            ))}
                        </div>
                    </div>

                {/* Chân Sidebar: Nút Xóa và Áp dụng */}
                <div className="sidebar-footer">
                    <button
                        className="clear-btn"
                        onClick={() => {
                            onFilterChange('reset', null);
                            onClose(); // Reset xong thì đóng luôn sidebar
                        }}
                    >
                        Xóa tất cả
                    </button>
                    <button className="apply-btn" onClick={onClose}>
                        Áp dụng
                    </button>
                </div>
            </div>
        </div>
        </>
    );
}