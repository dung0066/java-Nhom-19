import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import '../../styles/navbar.css';

export default function AppNavbar({ currentPage, onNavigate, isBackendLive }) {
  const { language, setLanguage, t, isVietnamese } = useLanguage();
  const { currentUser, isLoggedIn, openAuthModal, openProfileModal } = useAuth();
  const navLinksRef = useRef(null);
  const pillRef = useRef(null);
  const homeBtnRef = useRef(null);
  const bookingBtnRef = useRef(null);
  const combosBtnRef = useRef(null);
  const adminBtnRef = useRef(null);

  // Smooth sliding indicator with GSAP
  useEffect(() => {
    let targetBtn = null;
    if (currentPage === 'home') targetBtn = homeBtnRef.current;
    else if (currentPage === 'booking') targetBtn = bookingBtnRef.current;
    else if (currentPage === 'combos') targetBtn = combosBtnRef.current;
    else if (currentPage === 'admin') targetBtn = adminBtnRef.current;

    if (targetBtn && pillRef.current && navLinksRef.current) {
      const targetLeft = targetBtn.offsetLeft;
      const targetWidth = targetBtn.offsetWidth;

      gsap.to(pillRef.current, {
        x: targetLeft,
        width: targetWidth,
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out'
      });
    }
  }, [currentPage, language]);

  return (
    <nav className="app-unified-navbar">
      <div className="app-navbar-inner">
        {/* 1. Brand Logo */}
        <div
          className="app-nav-brand"
          onClick={() => onNavigate('home')}
          title="Ways Station Badminton"
        >
          <div className="app-nav-logo-icon">
            <i className="fa-solid fa-feather"></i>
          </div>
          <div className="app-nav-brand-text">
            <span className="app-nav-brand-name">{t.brandName}</span>
            <span className="app-nav-brand-sub">{t.brandSub}</span>
          </div>
        </div>

        {/* 2. Unified Navigation Tabs with GSAP Sliding Indicator */}
        <div className="app-nav-links-wrapper" ref={navLinksRef}>
          {/* Floating animated indicator pill */}
          <div
            className={`nav-sliding-pill ${currentPage === 'admin' ? 'admin-pill' : ''}`}
            ref={pillRef}
          ></div>

          <button
            ref={homeBtnRef}
            type="button"
            className={`app-nav-item-btn ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            <i className="fa-solid fa-house"></i>
            <span>{t.navHome}</span>
          </button>

          <button
            ref={bookingBtnRef}
            type="button"
            className={`app-nav-item-btn ${currentPage === 'booking' ? 'active' : ''}`}
            onClick={() => onNavigate('booking')}
          >
            <i className="fa-solid fa-calendar-check"></i>
            <span>{t.navBooking}</span>
          </button>

          <button
            ref={combosBtnRef}
            type="button"
            className={`app-nav-item-btn ${currentPage === 'combos' ? 'active' : ''}`}
            onClick={() => onNavigate('combos')}
          >
            <i className="fa-solid fa-crown"></i>
            <span>{isVietnamese ? 'Hội Viên & Combo' : 'VIP & Combos'}</span>
          </button>

          <button
            ref={adminBtnRef}
            type="button"
            className={`app-nav-item-btn app-nav-item-admin ${currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => onNavigate('admin')}
          >
            <i className="fa-solid fa-shield-halved"></i>
            <span>{t.navAdmin}</span>
          </button>
        </div>

        {/* 3. Status, Language Switcher, Hotline & Fast Action */}
        <div className="app-nav-actions">
          {/* Language Switcher Pill */}
          <div className="nav-language-switcher" title={t.langSelectTitle}>
            <button
              type="button"
              className={`lang-option-btn ${language === 'vi' ? 'active' : ''}`}
              onClick={() => setLanguage('vi')}
              title="Tiếng Việt (Vietnamese)"
            >
              <span className="lang-flag">🇻🇳</span>
              <span className="lang-code">VI</span>
            </button>
            <button
              type="button"
              className={`lang-option-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
              title="English"
            >
              <span className="lang-flag">🇬🇧</span>
              <span className="lang-code">EN</span>
            </button>
          </div>

          {/* Backend Status Pill */}
          <div
            className={`nav-backend-pill ${isBackendLive ? 'online' : 'offline'}`}
            title={
              isBackendLive
                ? 'Đã kết nối Spring Boot Backend (cổng 8080)'
                : 'Đang chạy chế độ Demo (Offline Fallback)'
            }
          >
            <span className="pulse-dot"></span>
            <span>{isBackendLive ? t.navJavaLive : t.navDemoMode}</span>
          </div>

          {/* Hotline Quick */}
          <div className="nav-hotline-quick">
            <span className="hl-label">{t.navHotlineLabel}</span>
            <span className="hl-number">0889 555 559</span>
          </div>

          {/* User Account / Login Button */}
          {isLoggedIn ? (
            <button
              type="button"
              className="nav-user-chip-btn"
              onClick={openProfileModal}
              title={isVietnamese ? 'Xem hồ sơ & tài khoản cá nhân' : 'View account profile'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '30px',
                padding: '4px 12px 4px 5px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(4px)'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: currentUser?.isMember
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              >
                {(currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '12.5px', fontWeight: 700, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.fullName?.split(' ').pop() || currentUser?.username}
              </span>
              {currentUser?.isMember && (
                <i className="fa-solid fa-crown" style={{ color: '#fbbf24', fontSize: '11px' }}></i>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="nav-auth-btn"
              onClick={() => openAuthModal('login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <i className="fa-solid fa-user-circle"></i>
              <span>{isVietnamese ? 'Đăng Nhập' : 'Sign In'}</span>
            </button>
          )}

          {/* Context Action Button */}
          {currentPage !== 'booking' ? (
            <button
              type="button"
              className="btn-nav-cta-action"
              onClick={() => onNavigate('booking')}
            >
              <i className="fa-solid fa-bolt"></i>
              <span>{t.navBookNow}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-nav-cta-action"
              onClick={() => onNavigate('admin')}
              style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}
            >
              <i className="fa-solid fa-gear"></i>
              <span>{t.navAdminPortal}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
