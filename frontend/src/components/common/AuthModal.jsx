import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, setAuthModalTab, closeAuthModal, login, register } = useAuth();
  const { isVietnamese } = useLanguage();
  const modalBoxRef = useRef(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthModalOpen && modalBoxRef.current) {
      setErrorMessage('');
      setSuccessMessage('');
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.85, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)' }
      );
    }
  }, [isAuthModalOpen, authModalTab]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage(isVietnamese ? 'Vui lòng điền đầy đủ tài khoản và mật khẩu!' : 'Please enter identifier and password!');
      return;
    }

    setIsLoading(true);
    try {
      await login(loginIdentifier.trim(), loginPassword);
      // Success is handled in context
    } catch (err) {
      setErrorMessage(err.message || (isVietnamese ? 'Đăng nhập không thành công, vui lòng kiểm tra lại!' : 'Login failed, please check your credentials!'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regUsername.trim() || !regPassword.trim() || !regPhone.trim()) {
      setErrorMessage(isVietnamese ? 'Vui lòng điền tên đăng nhập, số điện thoại và mật khẩu!' : 'Please fill in username, phone and password!');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage(isVietnamese ? 'Mật khẩu phải có ít nhất 6 ký tự!' : 'Password must be at least 6 characters!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage(isVietnamese ? 'Mật khẩu xác nhận không khớp!' : 'Passwords do not match!');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        username: regUsername.trim(),
        password: regPassword,
        fullName: regFullName.trim() || regUsername.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim() || null
      });
      setSuccessMessage(isVietnamese ? 'Đăng ký tài khoản thành công! Đang tự động đăng nhập...' : 'Registration successful! Logging in...');
    } catch (err) {
      setErrorMessage(err.message || (isVietnamese ? 'Đăng ký không thành công!' : 'Registration failed!'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="auth-modal-card"
        ref={modalBoxRef}
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        {/* Header with Badminton Branding */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#fff',
            padding: '24px 24px 20px',
            position: 'relative',
            textAlign: 'center'
          }}
        >
          <button
            type="button"
            onClick={closeAuthModal}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            &times;
          </button>

          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.2)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px'
            }}
          >
            🏸
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.3px' }}>
            {authModalTab === 'login'
              ? (isVietnamese ? 'ĐĂNG NHẬP HỆ THỐNG' : 'SIGN IN')
              : (isVietnamese ? 'ĐĂNG KÝ TÀI KHOẢN MỚI' : 'CREATE ACCOUNT')}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.9 }}>
            {isVietnamese
              ? 'Ways Station Badminton Club - Đặt sân & Quyền lợi VIP'
              : 'Ways Station Badminton Club - Court Booking & VIP Club'}
          </p>

          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '4px',
              borderRadius: '12px',
              marginTop: '18px'
            }}
          >
            <button
              type="button"
              onClick={() => { setAuthModalTab('login'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: authModalTab === 'login' ? '#fff' : 'transparent',
                color: authModalTab === 'login' ? '#0369a1' : '#fff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <i className="fa-solid fa-right-to-bracket" style={{ marginRight: '6px' }}></i>
              {isVietnamese ? 'Đăng Nhập' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setAuthModalTab('register'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: authModalTab === 'register' ? '#fff' : 'transparent',
                color: authModalTab === 'register' ? '#0369a1' : '#fff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <i className="fa-solid fa-user-plus" style={{ marginRight: '6px' }}></i>
              {isVietnamese ? 'Đăng Ký' : 'Sign Up'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Error / Success Alerts */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fa-solid fa-circle-check"></i>
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN TAB */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px'
                  }}
                >
                  {isVietnamese
                    ? 'Tên đăng nhập / Số điện thoại / Email'
                    : 'Username / Phone number / Email'}
                  <span style={{ color: '#ef4444' }}> *</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }}
                  >
                    <i className="fa-solid fa-user"></i>
                  </span>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={
                      isVietnamese
                        ? 'Nhập username, sđt hoặc email...'
                        : 'Enter username, phone or email...'
                    }
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px'
                  }}
                >
                  {isVietnamese ? 'Mật khẩu' : 'Password'}
                  <span style={{ color: '#ef4444' }}> *</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }}
                  >
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>{isVietnamese ? 'Đang xác thực...' : 'Authenticating...'}</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-right-to-bracket"></i>
                    <span>{isVietnamese ? 'ĐĂNG NHẬP NGAY' : 'SIGN IN NOW'}</span>
                  </>
                )}
              </button>

              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#64748b',
                  lineHeight: '1.6'
                }}
              >
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  💡 {isVietnamese ? 'Gợi ý thông tin đăng nhập đa năng:' : 'Flexible login options:'}
                </div>
                <div>• {isVietnamese ? 'Dùng Tên đăng nhập (Username)' : 'Use Username'}</div>
                <div>• {isVietnamese ? 'Dùng Số điện thoại đã đăng ký' : 'Use registered Phone number'}</div>
                <div>• {isVietnamese ? 'Dùng Email đã kích hoạt' : 'Use verified Email'}</div>
              </div>
            </form>
          )}

          {/* 2. REGISTER TAB */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  {isVietnamese ? 'Họ và tên của bạn' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder={isVietnamese ? 'Ví dụ: Nguyễn Văn Tuấn' : 'e.g., John Doe'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {isVietnamese ? 'Tên đăng nhập' : 'Username'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="nguyentuan"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {isVietnamese ? 'Số điện thoại' : 'Phone'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0909123456"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tuan.badminton@gmail.com"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {isVietnamese ? 'Mật khẩu' : 'Password'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="≥ 6 ký tự"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {isVietnamese ? 'Xác nhận lại' : 'Confirm'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>{isVietnamese ? 'Đang tạo tài khoản...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-user-check"></i>
                    <span>{isVietnamese ? 'HOÀN TẤT ĐĂNG KÝ' : 'REGISTER NOW'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
