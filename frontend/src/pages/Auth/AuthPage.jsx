import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Phone, CheckCircle2, AtSign } from 'lucide-react';
import { authService } from '../../services/authService';
import './Auth.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('login'); 
  const [method, setMethod] = useState('email'); // Dùng cho Login: 'email', 'phone', hoặc 'username'
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullname: '', username: '', email: '', phone: '',
    password: '', confirmPassword: '', identifier: '', otp: '', role: 'ROLE_BUYER'
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- API HANDLERS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await authService.login({ 
        identifier: formData.identifier, 
        password: formData.password 
      });

      // --- SỬA ĐỔI & ĐỒNG BỘ LOCALSTORAGE VỚI HOMEPAGE.JSX ---
      if (res.data.data?.token) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('fullname', res.data.data.fullname || '');
        
        // Lấy vai trò đầu tiên từ mảng roles của API (ví dụ: "ROLE_BUYER" hoặc "ROLE_SELLER")
        // Lưu trực tiếp vào key 'role' dưới dạng Chuỗi (String) để HomePage.jsx đọc trực tiếp
        if (res.data.data.roles && res.data.data.roles.length > 0) {
          localStorage.setItem('role', res.data.data.roles[0]);
        } else {
          localStorage.setItem('role', 'ROLE_BUYER'); // Vai trò mặc định nếu mảng rỗng
        }
      }

      setMessage({ text: "Đăng nhập thành công!", type: 'success' });

      // --- PHẦN CHỈNH SỬA: ĐIỀU HƯỚNG CHUẨN VỀ TRANG CHỦ "/" ---
      setTimeout(() => {
        navigate('/'); 
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    if (!formData.email || !formData.phone) {
      return setMessage({ text: "Vui lòng nhập đầy đủ Email và Số điện thoại", type: 'error' });
    }

    if (formData.password !== formData.confirmPassword) {
      return setMessage({ text: "Mật khẩu xác nhận không trùng khớp", type: 'error' });
    }

    setLoading(true);
    try {
      const res = await authService.register({ ...formData });
      setMessage({ text: res.data.message || "Đăng ký thành công!", type: 'success' });
      setTimeout(() => {
        setAuthMode('login');
        setMessage({ text: '', type: '' });
      }, 2000);
    } catch (err) {
      const serverRes = err.response?.data;
      let errorMsg = serverRes?.data ? Object.values(serverRes.data)[0] : (serverRes?.message || "Đăng ký thất bại");
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
      case 'username': return { label: 'Username', icon: <AtSign size={18} />, placeholder: 'Nhập tên đăng nhập' };
      default: return { label: 'Email', icon: <Mail size={18} />, placeholder: 'Nhập địa chỉ email' };
    }
  };

  const currentMethod = getMethodDetails();

  return (
    <div className="auth-container">
      <div className="auth-banner">
        <div className="banner-content">
          <h1>Success starts here</h1>
          <ul className="banner-features">
            <li>Over 700 categories <CheckCircle2 size={18} /></li>
            <li>Quality work done faster <CheckCircle2 size={18} /></li>
            <li>Access to talent across the globe <CheckCircle2 size={18} /></li>
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="form-box">
          
          {/* --- LOGIN MODE --- */}
          {authMode === 'login' && (
            <>
              <h2>Sign in to your account</h2>
              <p className="top-switch-sub">Don't have an account? <span onClick={() => {setAuthMode('signup'); setMessage({text:'',type:''})}}>Join here</span></p>
              <div className="method-selector">
                {['email', 'phone', 'username'].map((m) => (
                  <button key={m} type="button" className={`method-btn ${method === m ? 'active' : ''}`} onClick={() => setMethod(m)}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
              <form onSubmit={handleLogin}> {/* Bọc form để nhấn Enter cũng kích hoạt login */}
                <div className="input-group">
                  <label>{currentMethod.label}</label>
                  <div className="input-wrapper">
                    {currentMethod.icon}
                    <input name="identifier" type="text" placeholder={currentMethod.placeholder} onChange={handleChange} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input name="password" type="password" placeholder="Nhập mật khẩu" onChange={handleChange} />
                  </div>
                </div>
                <div className="form-options">
                  <label className="checkbox-label"><input type="checkbox" /> Ghi nhớ đăng nhập</label>
                  <span className="forgot-link" onClick={() => {setAuthMode('forgot'); setMessage({text:'',type:''})}}>Forgot password?</span>
                </div>
                <button type="submit" className="btn-auth" disabled={loading}>{loading ? "Processing..." : "Continue"}</button>
              </form>
              <StatusMessage />
            </>
          )}

          {/* --- SIGNUP MODE --- */}
          {authMode === 'signup' && (
            <>
              <h2>Join our community</h2>
              <p className="top-switch-sub">Already have an account? <span onClick={() => {setAuthMode('login'); setMessage({text:'',type:''})}}>Sign In</span></p>
              
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-wrapper"><User size={18} /><input name="fullname" type="text" placeholder="Ví dụ: Phan Trung Kiên" onChange={handleChange} /></div>
              </div>
              
              <div className="input-group">
                <label>Username</label>
                <div className="input-wrapper"><AtSign size={18} /><input name="username" type="text" placeholder="vana_nguyen" onChange={handleChange} /></div>
              </div>

              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper"><Mail size={18} /><input name="email" type="text" placeholder="yourname@example.com" onChange={handleChange} /></div>
              </div>

              <div className="input-group">
                <label>Số điện thoại</label>
                <div className="input-wrapper"><Phone size={18} /><input name="phone" type="text" placeholder="0987654321" onChange={handleChange} /></div>
              </div>
              
              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper"><Lock size={18} /><input name="password" type="password" placeholder="Tạo mật khẩu" onChange={handleChange} /></div>
              </div>
              
              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-wrapper"><Lock size={18} /><input name="confirmPassword" type="password" placeholder="Xác nhận mật khẩu" onChange={handleChange} /></div>
              </div>

              <div className="input-group">
                <label>Bạn tham gia với vai trò:</label>
                <div className="method-selector">
                  <button type="button" className={`method-btn ${formData.role === 'ROLE_BUYER' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, role: 'ROLE_BUYER' })}>Người mua (Buyer)</button>
                  <button type="button" className={`method-btn ${formData.role === 'ROLE_SELLER' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, role: 'ROLE_SELLER' })}>Người bán (Seller)</button>
                </div>
              </div>

              <button className="btn-auth" onClick={handleRegister} disabled={loading}>{loading ? "Processing..." : "Join Now"}</button>
              <StatusMessage />
            </>
          )}

          {/* --- FORGOT MODE --- */}
          {authMode === 'forgot' && (
            <>
              <h2>Reset Password</h2>
              <div className="back-link" onClick={() => {setAuthMode('login'); setMessage({text:'',type:''})}}><ArrowLeft size={16} /> Back to Sign in</div>
              <div className="input-group">
                <label>Email or Phone</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input name="identifier" type="text" placeholder="Nhập email hoặc số điện thoại" onChange={handleChange} />
                </div>
              </div>
              <button className="btn-auth" onClick={handleForgotPassword} disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
              <div className="otp-container">
                <div className="otp-inputs">
                  {[...Array(6)].map((_, i) => (<input key={i} type="text" maxLength="1" className="otp-field" />))}
                </div>
              </div>
              <button className="btn-auth" style={{marginTop: '20px'}} disabled={loading}>Verify OTP</button>
              <StatusMessage />
            </>
          )}

          <p className="auth-footer">By joining, you agree to our <b>Terms of Service</b> and <b>Privacy Policy</b>.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;