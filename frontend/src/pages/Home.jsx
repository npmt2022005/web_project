import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerHome from './Dashboard/SellerHome'; 
import BuyerHome from './Marketplace/BuyerHome';

const HomePage = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Nếu chưa đăng nhập (không có token), bắt quay về trang login
    if (!token) {
      navigate('/login');
      return;
    }

    // Lấy thông tin role đã lưu từ AuthPage
    try {
      const savedRoles = JSON.parse(localStorage.getItem('userRole') || '[]');
      
      if (savedRoles.includes('ROLE_SELLER')) {
        setRole('SELLER');
      } else {
        setRole('BUYER');
      }
    } catch (error) {
      console.error("Lỗi đọc Role từ localStorage", error);
      navigate('/login');
    }
  }, [navigate]);

  // Nếu chưa xác định được role (đang load), trả về null hoặc loading
  if (role === null) return <div>Loading...</div>;

  // Trả về giao diện tương ứng với thư mục Dashboard hoặc Marketplace của bạn
  return (
    <>
      {role === 'SELLER' ? <SellerHome /> : <BuyerHome />}
    </>
  );
};

export default HomePage;