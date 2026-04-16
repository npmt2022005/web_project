import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Phone, CheckCircle2 } from 'lucide-react';
import './Auth.css';

const AuthPage = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [method, setMethod] = useState('email'); // 'email', 'phone'

  return (
    <div className="auth-container">
      {/* PHẦN BANNER TRÁI */}
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

      {/* PHẦN FORM PHẢI */}
      <div className="auth-form-side">
        <div className="form-box">
          
          {/* --- GIAO DIỆN ĐĂNG NHẬP --- */}
          {authMode === 'login' && (
            <>
              <h2>Sign in to your account</h2>
              <p className="top-switch-sub">Don't have an account? <span onClick={() => setAuthMode('signup')}>Join here</span></p>
              
              <div className="tab-container">
                <button className={`tab ${method === 'email' ? 'active' : ''}`} onClick={() => setMethod('email')}>Email</button>
                <button className={`tab ${method === 'phone' ? 'active' : ''}`} onClick={() => setMethod('phone')}>Số điện thoại</button>
              </div>

              <div className="input-group">
                <label>{method === 'email' ? 'Email' : 'Số điện thoại'}</label>
                <div className="input-wrapper">
                  {method === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                  <input type="text" placeholder={method === 'email' ? "Enter your email" : "Enter your phone number"} autoComplete="off" />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input type="password" placeholder="Enter password" />
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label"><input type="checkbox" /> Ghi nhớ đăng nhập</label>
                <span className="forgot-link" onClick={() => setAuthMode('forgot')}>Forgot password?</span>
              </div>

              <button className="btn-auth">Continue</button>
            </>
          )}

          {/* --- GIAO DIỆN ĐĂNG KÝ (ĐÃ THÊM XÁC NHẬN MẬT KHẨU) --- */}
          {authMode === 'signup' && (
            <>
              <h2>Join our community</h2>
              <p className="top-switch-sub">Already have an account? <span onClick={() => setAuthMode('login')}>Sign in</span></p>
              
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-wrapper"><User size={18} /><input type="text" placeholder="Ví dụ: Phan Trung Kiên" autoComplete="off" /></div>
              </div>

              <div className="tab-container small-tabs">
                <button className={`tab ${method === 'email' ? 'active' : ''}`} onClick={() => setMethod('email')}>Email</button>
                <button className={`tab ${method === 'phone' ? 'active' : ''}`} onClick={() => setMethod('phone')}>Số điện thoại</button>
              </div>

              <div className="input-group">
                <label>{method === 'email' ? 'Email' : 'Số điện thoại'}</label>
                <div className="input-wrapper">
                  {method === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                  <input type="text" placeholder={method === 'email' ? "yourname@example.com" : "0xxxxxxxxx"} autoComplete="off" />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper"><Lock size={18} /><input type="password" placeholder="Create a password" /></div>
              </div>

              {/* TRƯỜNG MỚI ĐƯỢC THÊM THEO YÊU CẦU */}
              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-wrapper"><Lock size={18} /><input type="password" placeholder="Confirm your password" /></div>
              </div>

              <button className="btn-auth">Join Now</button>
            </>
          )}

          {/* --- GIAO DIỆN QUÊN MẬT KHẨU --- */}
          {authMode === 'forgot' && (
            <>
              <h2>Reset Password</h2>
              <div className="back-link" onClick={() => setAuthMode('login')}><ArrowLeft size={16} /> Back to Sign in</div>
              
              <div className="input-group">
                <label>Email or Phone</label>
                <div className="input-wrapper"><Mail size={18} /><input type="text" placeholder="Enter your email or phone" autoComplete="off" /></div>
              </div>
              
              <button className="btn-auth">Send OTP</button>

              <div className="otp-section" style={{marginTop: '30px'}}>
                <div className="otp-boxes">
                  {[1,2,3,4,5,6].map(i => <input key={i} type="text" maxLength="1" className="otp-input" />)}
                </div>
              </div>
              <button className="btn-auth" style={{marginTop: '20px', backgroundColor: '#1dbf73'}}>Verify OTP</button>
            </>
          )}

          <p className="footer-terms">By joining, you agree to our <b>Terms of Service</b> and <b>Privacy Policy</b>.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;