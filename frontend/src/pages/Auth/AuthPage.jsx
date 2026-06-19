import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Phone, CheckCircle2, AtSign, Eye, EyeOff } from 'lucide-react'; // 🌟 ĐÃ SỬA: Giữ nguyên Import Eye và EyeOff để làm con mắt ẩn/hiện mật khẩu
import { authService } from '../../services/authService';
import './Auth.css';

const AuthPage = ({ isLoginDefault = true }) => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState(isLoginDefault ? 'login' : 'signup'); 
  const [method, setMethod] = useState('email'); // Dùng cho Login: 'email', 'phone', hoặc 'username'
  const [loading, setLoading] = useState(false);
  
  // 🌟 ĐÃ SỬA: Trạng thái điều khiển việc ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullname: '', username: '', email: '', phone: '',
    password: '', confirmPassword: '', identifier: '', otp: '', role: 'ROLE_BUYER'
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
        navigate('/admin/users', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  // --- API HANDLERS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const identifier = formData.identifier.trim();

    // 🔴 1. KIỂM TRA KHÔNG ĐƯỢC BỎ TRỐNG
    if (!identifier || !formData.password) {
      return setMessage({ text: "Vui lòng nhập đầy đủ thông tin đăng nhập!", type: 'error' });
    }

    // 🔴 2. CHẶN ĐỊNH DẠNG THEO TỪNG TAB (METHOD)
    if (method === 'email') {
      // Regex kiểm tra phải là Email hợp lệ (có chữ @ và dấu chấm)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        return setMessage({ text: "Vui lòng nhập đúng định dạng Email (vd: ten@gmail.com)!", type: 'error' });
      }
    } else if (method === 'phone') {
      // Regex kiểm tra SĐT Việt Nam (bắt đầu bằng 0 hoặc +84, độ dài 10-11 số)
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(identifier)) {
        return setMessage({ text: "Số điện thoại không hợp lệ!", type: 'error' });
      }
    } else if (method === 'username') {
      // Username thì không được phép chứa dấu @ (để tránh nhập nhầm Email)
      if (identifier.includes('@')) {
        return setMessage({ text: "Tên đăng nhập (Username) không được chứa ký tự @", type: 'error' });
      }
    }
    setMessage({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await authService.login({ 
        identifier: formData.identifier, 
        password: formData.password 
      });

      let userRole = 'ROLE_BUYER';

      if (res.data.data?.token) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('fullname', res.data.data.fullname || '');
        
        // 🌟 ĐÃ SỬA: Lưu thêm username vào bộ nhớ trình duyệt để Profile.jsx kiểm tra
        localStorage.setItem('username', res.data.data.username || '');
        
        if (res.data.data.roles && res.data.data.roles.length > 0) {
          userRole = res.data.data.roles[0];
          localStorage.setItem('role', userRole);
        } else {
          localStorage.setItem('role', 'ROLE_BUYER');
        }
      }

      setMessage({ text: "Đăng nhập thành công!", type: 'success' });

      setTimeout(() => {
        // 👑 RẼ NHÁNH ĐIỀU HƯỚNG THEO VAI TRÒ (ROLE) ADMIN
        if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') {
          navigate('/admin/users', { replace: true });
        } else {
          navigate('/', { replace: true }); 
        }
      }, 1000);

    } catch (err) {
      const serverRes = err.response?.data;
      let errorMsg = serverRes?.message || "Đăng nhập thất bại";
      if (serverRes?.data) {
        errorMsg = Object.values(serverRes.data)[0];
      } else if (errorMsg === "Bad credentials") {
        errorMsg = "Tên đăng nhập hoặc mật khẩu không chính xác";
      }
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC ĐĂNG KÝ ĐÃ ĐƯỢC CHỈNH SỬA BẮT LỖI CHI TIẾT TỪ BACKEND ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    if (!formData.email || !formData.phone || !formData.username || !formData.fullname || !formData.password || !formData.confirmPassword) {
      return setMessage({ text: "Vui lòng nhập đầy đủ tất cả các trường thông tin", type: 'error' });
    }

    if (formData.password !== formData.confirmPassword) {
      return setMessage({ text: "Mật khẩu xác nhận không trùng khớp", type: 'error' });
    }

    setLoading(true);
    try {
      // ĐỒNG BỘ CHUẨN ĐÚNG CÁC TRƯỜNG TRONG FILE SWAGGER API-DOCS
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullname: formData.fullname,     
        phone: formData.phone,           
        role: formData.role
      };

      const res = await authService.register(payload);
      
      if (res.data && res.data.status === 'success') {
        setMessage({ text: res.data.message || "Đăng ký thành công!", type: 'success' });
        setTimeout(() => {
          setAuthMode('login');
          setMessage({ text: '', type: '' });
        }, 2000);
      } else {
        setMessage({ text: res.data.message || "Đăng ký thất bại", type: 'error' });
      }

    } catch (err) {
      console.error("Lỗi chi tiết từ Server:", err);
      
      const serverRes = err.response?.data;
      let errorMsg = "Đăng ký thất bại. Vui lòng thử lại!";

      if (serverRes) {
        if (serverRes.data && typeof serverRes.data === 'object') {
          const errors = Object.values(serverRes.data);
          if (errors.length > 0) {
            errorMsg = errors[0]; 
          }
        } else if (serverRes.message) {
          errorMsg = serverRes.message;
        }
      } else if (err.request) {
        errorMsg = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau!";
      }

      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setMessage({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ identifier: formData.identifier });
      setMessage({ text: res.data.message || "Đã gửi mã OTP!", type: 'success' });
    } catch (err) {
      const serverRes = err.response?.data;
      let errorMsg = serverRes?.data?.identifier || (serverRes?.message || "Không thể gửi mã OTP");
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const StatusMessage = () => (
    message.text ? <div className={`status-msg ${message.type}`}>{message.text}</div> : null
  );

  const getMethodDetails = () => {
    switch (method) {
      case 'phone': return { label: 'Số điện thoại', icon: <Phone size={18} />, placeholder: 'Nhập số điện thoại' };
      case 'username': return { label: 'Tên đăng nhập (Username)', icon: <AtSign size={18} />, placeholder: 'Nhập tên đăng nhập' };
      default: return { label: 'Email', icon: <Mail size={18} />, placeholder: 'Nhập địa chỉ email' };
    }
  };

  const currentMethod = getMethodDetails();

  return (
    <div className="auth-container">
      <div className="auth-banner">
        <div className="banner-content">
          <h1>Thành công bắt đầu từ đây</h1>
          <ul className="banner-features">
            <li>Hơn 700 danh mục đa dạng <CheckCircle2 size={18} /></li>
            <li>Hoàn thành công việc nhanh chóng, chất lượng <CheckCircle2 size={18} /></li>
            <li>Kết nối với các tài năng trên toàn cầu <CheckCircle2 size={18} /></li>
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="form-box">
          
          {/* --- LOGIN MODE --- */}
          {authMode === 'login' && (
            <>
              <h2>Đăng nhập vào tài khoản</h2>
              <p className="top-switch-sub">Bạn chưa có tài khoản? <span onClick={() => {setAuthMode('signup'); setMessage({text:'',type:''})}}>Đăng ký tại đây</span></p>
              <div className="method-selector">
                {['email', 'phone', 'username'].map((m) => (
                  <button key={m} type="button" className={`method-btn ${method === m ? 'active' : ''}`} onClick={() => setMethod(m)}>
                    {m === 'email' ? 'Email' : m === 'phone' ? 'Số điện thoại' : 'Username'}
                  </button>
                ))}
              </div>
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label>{currentMethod.label}</label>
                  <div className="input-wrapper">
                    {currentMethod.icon}
                    <input name="identifier" type="text" placeholder={currentMethod.placeholder} onChange={handleChange} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Mật khẩu</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    {/* 🌟 ĐÃ SỬA: Tích hợp nút hiển thị hình con mắt cho trang Đăng Nhập khớp logic với state showPassword */}
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu" onChange={handleChange} />
                    <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  </div>
                </div>
                <div className="form-options">
                  {/* 🌟 ĐÃ SỬA: Đưa ô input ra làm một nhánh độc lập kề cạnh text span, liên kết bằng id và htmlFor */}
                  <label htmlFor="rememberMe" className="checkbox-label">
                    <input type="checkbox" id="rememberMe" className="auth-checkbox" /> 
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <span className="forgot-link" onClick={() => {setAuthMode('forgot'); setMessage({text:'',type:''})}}>Quên mật khẩu?</span>
                </div>
                <button type="submit" className="btn-auth" disabled={loading}>{loading ? "Đang xử lý..." : "Tiếp tục"}</button>
              </form>
              <StatusMessage />
            </>
          )}

          {/* --- SIGNUP MODE --- */}
          {authMode === 'signup' && (
            <>
              <h2>Tham gia cộng đồng của chúng tôi</h2>
              <p className="top-switch-sub">Bạn đã có tài khoản? <span onClick={() => {setAuthMode('login'); setMessage({text:'',type:''})}}>Đăng nhập</span></p>
              
              <form onSubmit={handleRegister}>
                <div className="input-group">
                  <label>Họ và tên</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input name="fullname" type="text" placeholder="Ví dụ: Phan Trung Kiên" value={formData.fullname} onChange={handleChange} />
                  </div>
                </div>
                
                <div className="input-group">
                  <label>Tên tài khoản (Username)</label>
                  <div className="input-wrapper">
                    <AtSign size={18} />
                    <input name="username" type="text" placeholder="Ví dụ: vana_nguyen" value={formData.username} onChange={handleChange} />
                  </div>
                </div>

                <div className="input-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <Mail size={18} />
                    <input name="email" type="text" placeholder="tenbancuaban@example.com" value={formData.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="input-group">
                  <label>Số điện thoại</label>
                  <div className="input-wrapper">
                    <Phone size={18} />
                    <input name="phone" type="text" placeholder="Ví dụ: 0987654321" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                
                <div className="input-group">
                  <label>Mật khẩu</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="Tạo mật khẩu mới" value={formData.password} onChange={handleChange} />
                    <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  </div>
                </div>
                
                <div className="input-group">
                  <label>Xác nhận mật khẩu</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    {/* 🌟 ĐÃ SỬA: Sử dụng chuẩn xác state showConfirmPassword riêng biệt tránh bị ảnh hưởng từ ô mật khẩu gốc */}
                    <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Nhập lại mật khẩu để xác nhận" value={formData.confirmPassword} onChange={handleChange} />
                    <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <label>Bạn tham gia với vai trò:</label>
                  <div className="method-selector">
                    <button type="button" className={`method-btn ${formData.role === 'ROLE_BUYER' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, role: 'ROLE_BUYER' })}>Người mua (Buyer)</button>
                    <button type="button" className={`method-btn ${formData.role === 'ROLE_SELLER' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, role: 'ROLE_SELLER' })}>Người bán (Seller)</button>
                  </div>
                </div>

                <button type="submit" className="btn-auth" disabled={loading}>{loading ? "Đang xử lý..." : "Tham gia ngay"}</button>
              </form>
              <StatusMessage />
            </>
          )}

          {/* --- FORGOT MODE --- */}
          {authMode === 'forgot' && (
            <>
              <h2>Đặt lại mật khẩu</h2>
              <div className="back-link" onClick={() => {setAuthMode('login'); setMessage({text:'',type:''})}}><ArrowLeft size={16} /> Quay lại Đăng nhập</div>
              <div className="input-group">
                <label>Email hoặc Số điện thoại</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input name="identifier" type="text" placeholder="Nhập email hoặc số điện thoại" onChange={handleChange} />
                </div>
              </div>
              <button className="btn-auth" onClick={handleForgotPassword} disabled={loading}>{loading ? "Đang gửi..." : "Gửi mã OTP"}</button>
              <div className="otp-container">
                <div className="otp-inputs">
                  {[...Array(6)].map((_, i) => (<input key={i} type="text" maxLength="1" className="otp-field" />))}
                </div>
              </div>
              <button className="btn-auth" style={{marginTop: '20px'}} disabled={loading}>Xác thực mã OTP</button>
              <StatusMessage />
            </>
          )}

          <p className="auth-footer">Bằng cách tham gia, bạn đồng ý với <b>Điều khoản dịch vụ</b> và <b>Chính sách bảo mật</b> của chúng tôi.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;