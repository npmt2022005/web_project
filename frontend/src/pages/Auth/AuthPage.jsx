import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Phone, CheckCircle2, AtSign } from 'lucide-react';
import { authService } from '../../services/authService';
import './Auth.css';

const AuthPage = () => {
  const [authMode, setAuthMode] = useState('login'); 
  const [method, setMethod] = useState('email'); // 'email', 'phone', hoặc 'username'
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullname: '', username: '', email: '', phone: '',
    password: '', confirmPassword: '', identifier: '', otp: '', role: 'ROLE_BUYER'
  });

  // State mới để lưu thông báo lỗi hoặc thành công
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- API HANDLERS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const res = await authService.login({ 
        identifier: formData.identifier, 
        password: formData.password 
      });
      setMessage({ text: "Đăng nhập thành công!", type: 'success' });
      if (res.data.data?.token) localStorage.setItem('token', res.data.data.token);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Đăng nhập thất bại", type: 'error' });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (formData.password !== formData.confirmPassword) {
      return setMessage({ text: "Mật khẩu xác nhận không khớp", type: 'error' });
    }
    try {
      const res = await authService.register({ ...formData });
      setMessage({ text: "Đăng ký thành công! Đang chuyển hướng...", type: 'success' });
      setTimeout(() => setAuthMode('login'), 2000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Đăng ký thất bại", type: 'error' });
    }
  };

  const handleForgotPassword = async () => {
    setMessage({ text: '', type: '' });
    try {
      const res = await authService.forgotPassword({ identifier: formData.identifier });
      setMessage({ text: res.data.message || "Đã gửi mã OTP!", type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Không thể gửi mã OTP", type: 'error' });
    }
  };

  // Helper component hiển thị thông báo
  const StatusMessage = () => (
    message.text ? (
      <div className={`status-msg ${message.type}`}>
        {message.text}
      </div>
    ) : null
  );

  const getMethodDetails = () => {
    switch (method) {
      case 'phone':
        return { label: 'Số điện thoại', icon: <Phone size={18} />, placeholder: 'Enter your phone number' };
      case 'username':
        return { label: 'Username', icon: <AtSign size={18} />, placeholder: 'Enter your username' };
      default:
        return { label: 'Email', icon: <Mail size={18} />, placeholder: 'Enter your email' };
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
          
          {authMode === 'login' && (
            <>
              <h2>Sign in to your account</h2>
              <p className="top-switch-sub">Don't have an account? <span onClick={() => {setAuthMode('signup'); setMessage({text:'',type:''})}}>Join here</span></p>
              
              <div className="method-selector">
                {['email', 'phone', 'username'].map((m) => (
                  <button 
                    key={m}
                    type="button"
                    className={`method-btn ${method === m ? 'active' : ''}`} 
                    onClick={() => setMethod(m)}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>

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
                  <input name="password" type="password" placeholder="Enter password" onChange={handleChange} />
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label"><input type="checkbox" /> Ghi nhớ đăng nhập</label>
                <span className="forgot-link" onClick={() => {setAuthMode('forgot'); setMessage({text:'',type:''})}}>Forgot password?</span>
              </div>

              <button className="btn-auth" onClick={handleLogin}>Continue</button>
              <StatusMessage />
            </>
          )}

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
              
              <div className="method-selector">
                <button type="button" className={`method-btn ${method === 'email' ? 'active' : ''}`} onClick={() => setMethod('email')}>Email</button>
                <button type="button" className={`method-btn ${method === 'phone' ? 'active' : ''}`} onClick={() => setMethod('phone')}>Số điện thoại</button>
              </div>
              
              <div className="input-group">
                <label>{method === 'email' ? 'Email' : 'Số điện thoại'}</label>
                <div className="input-wrapper">
                  {method === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                  <input name={method === 'email' ? "email" : "phone"} type="text" placeholder={method === 'email' ? "yourname@example.com" : "0987654321"} onChange={handleChange} />
                </div>
              </div>
              
              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper"><Lock size={18} /><input name="password" type="password" placeholder="Create a password" onChange={handleChange} /></div>
              </div>
              
              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-wrapper"><Lock size={18} /><input name="confirmPassword" type="password" placeholder="Confirm your password" onChange={handleChange} /></div>
              </div>

              <div className="input-group">
                <label>Bạn tham gia với vai trò:</label>
                <div className="method-selector">
                  <button 
                    type="button"
                    className={`method-btn ${formData.role === 'ROLE_BUYER' ? 'active' : ''}`} 
                    onClick={() => setFormData({ ...formData, role: 'ROLE_BUYER' })}
                  >
                    Người mua (Buyer)
                  </button>
                  <button 
                    type="button"
                    className={`method-btn ${formData.role === 'ROLE_SELLER' ? 'active' : ''}`} 
                    onClick={() => setFormData({ ...formData, role: 'ROLE_SELLER' })}
                  >
                    Người bán (Seller)
                  </button>
                </div>
              </div>

              <button className="btn-auth" onClick={handleRegister}>Join Now</button>
              <StatusMessage />
            </>
          )}

          {authMode === 'forgot' && (
            <>
              <h2>Reset Password</h2>
              <div className="back-link" onClick={() => {setAuthMode('login'); setMessage({text:'',type:''})}}><ArrowLeft size={16} /> Back to Sign in</div>
              <div className="input-group">
                <label>Email or Phone</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input name="identifier" type="text" placeholder="Enter your email or phone" onChange={handleChange} />
                </div>
              </div>
              <button className="btn-auth" onClick={handleForgotPassword}>Send OTP</button>
              <div className="otp-container">
                <div className="otp-inputs">
                  {[...Array(6)].map((_, i) => (
                    <input key={i} type="text" maxLength="1" className="otp-field" />
                  ))}
                </div>
              </div>
              <button className="btn-auth" style={{marginTop: '20px'}}>Verify OTP</button>
              <StatusMessage />
            </>
          )}

          <p className="auth-footer">
            By joining, you agree to our <b>Terms of Service</b> and <b>Privacy Policy</b>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;