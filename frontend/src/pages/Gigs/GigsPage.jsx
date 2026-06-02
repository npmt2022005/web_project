// src/pages/Gigs/GigsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GigCard from '../Components/GigCard';
import FilterBar from '../Components/FilterBar';
import './GigsPage.css';

const POPULAR_TAGS = [
    'Thiết kế logo', 'Lập trình web', 'Video quảng cáo',
    'Viết content', 'SEO', 'Dịch thuật',
];

const GigsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [searchInput, setSearchInput] = useState(searchParams.get('keyword') || '');

    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        deliveryTime: searchParams.get('deliveryTime') || '',
        level: searchParams.get('level') || '',
        location: searchParams.get('location') || '',
        sortBy: searchParams.get('sortBy') || 'BestSeller',
        languages: searchParams.getAll('languages') || [] 
    });

    const [gigs, setGigs] = useState([]);
    const [metaData, setMetaData] = useState(null);
    const [loading, setLoading] = useState(true);

    /* Lấy metadata filter */
    useEffect(() => {
        const fetchMetaData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/gigs_v1/meta/filters');
                const apiData = response.data.data;
                setMetaData({
                    locations: apiData.locations,
                    sellerLevels: apiData.sellerLevels,
                    deliveryTimes: apiData.deliveryTimes,
                    languages: apiData.languages,
                    sortOptions: apiData.sortOptions,
                    maxSystemPrice: apiData.maxSystemPrice
                });
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu metadata:", error);
            }
        };
        fetchMetaData();
    }, []);
 
    /* Đồng bộ category từ URL */
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            setFilters(prev => ({ ...prev, category: categoryFromUrl }));
        }
    }, [searchParams]);

    /* Fetch gigs khi filter thay đổi */
    useEffect(() => {
        const fetchGigs = async () => {
            setLoading(true);
            try {
                const params = { ...filters };
                if (Array.isArray(params.languages)) {
                    params.languages = params.languages.length > 0 ? params.languages : undefined;
                }
                const response = await axios.get('http://localhost:8080/api/v1/gigs_v1/search', {
                    params,
                    paramsSerializer: (params) => {
                        const sp = new URLSearchParams();
                        Object.entries(params).forEach(([key, value]) => {
                            if (value === undefined || value === null || value === '') return;
                            if (Array.isArray(value)) {
                                value.forEach(item => sp.append(key, item));
                            } else {
                                sp.append(key, value);
                            }
                        });
                        // 🔴 1. XEM REACT ĐANG GỬI GÌ LÊN BACKEND
                        console.log("👉 URL Params React gửi đi:", sp.toString()); 
                        return sp.toString();
                    }
                });
                
                setGigs(response.data.content || response.data.data || []);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGigs();
    }, [filters]);

    const [popularCategories, setPopularCategories] = useState([]);
    const syncFiltersToUrl = (nextFilters) => {
        const sp = new URLSearchParams(); // Khởi tạo cỗ máy tự động sinh tham số
        
        // Quét qua toàn bộ dữ liệu trong bộ lọc
        Object.entries(nextFilters).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return; // Bỏ qua các giá trị rỗng
            
            if (Array.isArray(value)) {
                value.forEach(item => sp.append(key, item));
            } else {
                sp.append(key, value); // Tự động thêm ?key=value
            }
        });
        
        // Cập nhật lên thanh URL hiện tại (Không làm tải lại trang)
        setSearchParams(sp); 
    };
    const handleSearch = () => {
        if (!searchInput.trim() && !filters.keyword) return;
        const nextFilters = { ...filters, keyword: searchInput.trim(), category: '' };
        setFilters(nextFilters);
        syncFiltersToUrl(nextFilters); 
    };


    const handleTagClick = (tag) => {
        
        setSearchInput(tag);

        const nextFilters = { ...filters, keyword: tag };
        
        setFilters(nextFilters);

        syncFiltersToUrl(nextFilters); 
    };

    const handleFilterChange = (key, value) => {
        let nextFilters = { ...filters }; // Sao chép bộ lọc hiện tại
        
        if (key === 'reset') {
            nextFilters = {
                keyword: filters.keyword,   // Giữ lại từ khóa
                category: '', 
                minPrice: '', maxPrice: '', deliveryTime: '', 
                level: '', location: '', sortBy: 'BestSeller', languages: []
            };
        } else {
            nextFilters[key] = value; 
        }

        setFilters(nextFilters);     
        syncFiltersToUrl(nextFilters);
    };
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/gigs_v1/meta/filters');
                const apiData = response.data.data;
                setPopularCategories(apiData.popularTags);
            } catch (error) {
                console.error("Lỗi lấy metadata ở Trang chủ:", error);
            }
        };
        fetchMetadata();
    }, []);

    return (
        <div className="gigs-page">
            {/* ── HERO BANNER ── */}
            <section className="gigs-hero">
                <div className="gigs-hero-inner">
                    <h1 className="gigs-hero-title">
                        Tìm dịch vụ <em>freelance</em> phù hợp với bạn
                    </h1>
                    <p className="gigs-hero-sub">
                        Hàng nghìn chuyên gia sẵn sàng giúp bạn hoàn thành công việc
                    </p>

                    <div className="search-bar-wrapper">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            className="gigs-search-input"
                            placeholder="Bạn đang cần dịch vụ gì?"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="gigs-search-btn" onClick={handleSearch}>
                            Tìm kiếm
                        </button>
                    </div>

                    <div className="gigs-hero-tags">
                        <span>Phổ biến:</span>
                        {(popularCategories && popularCategories.length > 0
                            ? popularCategories
                            : [
                                // Dữ liệu dự phòng (Fallback) khi API chưa gọi xong hoặc bị lỗi
                                { name: "Thiết kế Website", categorySlug: "website-design" },
                                { name: "WordPress", categorySlug: "wordpress" },
                                { name: "Thiết kế Logo", categorySlug: "logo-design" },
                                { name: "Dịch vụ AI", categorySlug: "ai-services" }
                            ]
                        ).map((category, index) => (
                            <button
                                // Dùng class "hero-tag-chip" để nhận CSS đã viết ở file GigsPage.css
                                className="hero-tag-chip"
                                key={category.categorySlug || index}
                                onClick={() => {
                                    // 1. Hiển thị chữ lên thanh tìm kiếm cho đẹp
                                    setSearchInput(category.name);
                                    setFilters(prev => ({
                                        ...prev,
                                        category: category.categorySlug
                                    }));

                                    // Nếu bạn thích cập nhật URL cho chuẩn SEO thì dùng dòng của bạn:
                                    navigate(`/search?category=${encodeURIComponent(category.categorySlug)}`);
                                }}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BODY ── */}
            <div className="gigs-body">
                <FilterBar
                    metaData={metaData}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                <div className="gigs-content">
                    {loading ? (
                        <div className="loading-msg">Đang tìm kiếm dịch vụ...</div>
                    ) : gigs.length === 0 ? (
                        <div className="empty-msg">Không tìm thấy dịch vụ nào phù hợp với bộ lọc.</div>
                    ) : (
                        <div className="gigs-grid">
                            {gigs.map(gig => (
                                <GigCard key={gig.id} gig={gig} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default GigsPage;