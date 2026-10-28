import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getStoredUser, logoutUser } from '../../services/api';
import AuthModal from './AuthModal';
import AccountModal from './AccountModal';
import '../../styles/navbar.css';

export default function AppNavbar({ currentPage, onNavigate, isBackendLive }) {
  const { language, setLanguage, isVietnamese } = useLanguage();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState('profile');
  
  const searchInputRef = useRef(null);
  const langDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('booking');
      setIsSearchOpen(false);
    }
  };

  const handleNavClick = (pageId, sectionId = null) => {
    setIsMobileMenuOpen(false);
    if (sectionId) {
      if (currentPage !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(pageId);
    }
  };

  return (
    <header className="coida-header-wrapper">
      {/* 1. TOP BAR (Cyan / Sky Blue) */}
      <div className="coida-topbar">
        <div className="coida-topbar-inner">
          
          {/* Contact Details with Icons */}
          <div className="coida-topbar-contacts">
            <a href="mailto:d2shop.badminton@gmail.com" className="coida-contact-item" title="Email">
              <i className="fa-solid fa-envelope"></i>
              <span>Email: d2shop.badminton@gmail.com</span>
            </a>

            <span className="coida-divider">|</span>

            <a href="tel:0914977030" className="coida-contact-item" title={isVietnamese ? 'Hotline tư vấn đặt sân' : 'Hotline support'}>
              <i className="fa-solid fa-phone"></i>
              <span>0914977030</span>
            </a>

            <span className="coida-divider">|</span>

            <div className="coida-contact-item" title={isVietnamese ? 'Địa chỉ sân' : 'Address'}>
              <i className="fa-solid fa-location-dot"></i>
              <span>818/34 Xô Viết Nghệ Tĩnh, Phường Thạnh Mỹ Tây, Thành phố Hồ Chí Minh</span>
            </div>
          </div>

          {/* Topbar Right: Status & Social Icons (Old language selector removed) */}
          <div className="coida-topbar-right">
            {/* Backend Status indicator */}
            <div
              className={`coida-status-pill ${isBackendLive ? 'live' : 'demo'}`}
              title={isBackendLive ? 'Backend Spring Boot Live' : 'Demo Fallback'}
            >
              <span className="coida-status-dot"></span>
              <span>{isBackendLive ? 'Java API Live' : (isVietnamese ? 'Chế độ Demo' : 'Demo Mode')}</span>
            </div>

            {/* Social Icons */}
            <div className="coida-social-icons">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="coida-social-btn fb"
                title="Facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="coida-social-btn yt"
                title="YouTube"
              >
                <i className="fa-brands fa-youtube"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="coida-social-btn ig"
                title="Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR (White Background) */}
      <div className="coida-main-nav">
        <div className="coida-nav-inner">
          
          {/* Brand Logo & Name - D2 SHOP */}
          <div
            className="coida-brand d2-brand"
            onClick={() => handleNavClick('home')}
            title="D2 Shop - Badminton & Sports"
          >
            <img
              src="/logo-d2.png"
              alt="D2 Shop"
              className="d2-navbar-logo-img"
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className={`coida-menu-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <button
              type="button"
              className={`coida-nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              {isVietnamese ? 'TRANG CHỦ' : 'HOME'}
            </button>

            <button
              type="button"
              className={`coida-nav-link ${currentPage === 'about' ? 'active' : ''}`}
              onClick={() => handleNavClick('about')}
            >
              {isVietnamese ? 'GIỚI THIỆU' : 'ABOUT'}
            </button>

            <button
              type="button"
              className={`coida-nav-link ${currentPage === 'booking' ? 'active' : ''}`}
              onClick={() => handleNavClick('booking')}
            >
              {isVietnamese ? 'ĐẶT SÂN' : 'COURT BOOKING'}
            </button>

            <button
              type="button"
              className={`coida-nav-link ${currentPage === 'news' ? 'active' : ''}`}
              onClick={() => handleNavClick('news')}
            >
              {isVietnamese ? 'TIN TỨC' : 'NEWS'}
            </button>

            <button
              type="button"
              className={`coida-nav-link ${currentPage === 'contact' ? 'active' : ''}`}
              onClick={() => handleNavClick('contact')}
            >
              {isVietnamese ? 'LIÊN HỆ' : 'CONTACT'}
            </button>

            <button
              type="button"
              className={`coida-nav-link ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin')}
            >
              {isVietnamese ? 'QUẢN TRỊ' : 'ADMIN'}
            </button>
          </nav>

          {/* Right Action Tools: Custom Language Dropdown, Search, Red Booking CTA, Account */}
          <div className="coida-nav-actions">
            
            {/* NEW CUSTOM LANGUAGE DROPDOWN */}
            <div className="coida-lang-dropdown-wrapper" ref={langDropdownRef}>
              <button
                type="button"
                className="coida-lang-trigger-btn"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                title={isVietnamese ? 'Thay đổi ngôn ngữ' : 'Change language'}
              >
                <div className="coida-flag-box">
                  {language === 'vi' ? (
                    <svg className="coida-flag-svg" viewBox="0 0 24 16" fill="none">
                      <rect width="24" height="16" rx="2" fill="#DA251D" />
                      <polygon
                        points="12,3.5 13.5,8 18,8 14.5,10.5 16,15 12,12.2 8,15 9.5,10.5 6,8 10.5,8"
                        fill="#FFFF00"
                      />
                    </svg>
                  ) : (
                    <svg className="coida-flag-svg" viewBox="0 0 24 16" fill="none">
                      <rect width="24" height="16" rx="2" fill="#B22234" />
                      <path d="M0 2.46h24M0 4.92h24M0 7.38h24M0 9.85h24M0 12.31h24M0 14.77h24" stroke="#ffffff" strokeWidth="1.23"/>
                      <rect width="9.6" height="8.6" rx="1" fill="#3C3B6E" />
                      <circle cx="2.4" cy="2.1" r="0.8" fill="#ffffff" />
                      <circle cx="7.2" cy="2.1" r="0.8" fill="#ffffff" />
                      <circle cx="4.8" cy="4.3" r="0.8" fill="#ffffff" />
                      <circle cx="2.4" cy="6.5" r="0.8" fill="#ffffff" />
                      <circle cx="7.2" cy="6.5" r="0.8" fill="#ffffff" />
                    </svg>
                  )}
                </div>
                
                <div className="coida-lang-text-col">
                  <span className="coida-lang-sublabel">
                    {isVietnamese ? 'Ngôn ngữ' : 'Language'}
                  </span>
                  <div className="coida-lang-active-label">
                    <span>{isVietnamese ? 'Tiếng Việt' : 'English'}</span>
                    <i className="fa-solid fa-chevron-down"></i>
                  </div>
                </div>
              </button>

              {isLangMenuOpen && (
                <div className="coida-lang-menu-popover">
                  <button
                    type="button"
                    className={`coida-lang-menu-item ${language === 'vi' ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage('vi');
                      setIsLangMenuOpen(false);
                    }}
                  >
                    <svg className="coida-flag-svg" viewBox="0 0 24 16" fill="none">
                      <rect width="24" height="16" rx="2" fill="#DA251D" />
                      <polygon
                        points="12,3.5 13.5,8 18,8 14.5,10.5 16,15 12,12.2 8,15 9.5,10.5 6,8 10.5,8"
                        fill="#FFFF00"
                      />
                    </svg>
                    <span>Tiếng Việt</span>
                  </button>

                  <button
                    type="button"
                    className={`coida-lang-menu-item ${language === 'en' ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage('en');
                      setIsLangMenuOpen(false);
                    }}
                  >
                    <svg className="coida-flag-svg" viewBox="0 0 24 16" fill="none">
                      <rect width="24" height="16" rx="2" fill="#B22234" />
                      <path d="M0 2.46h24M0 4.92h24M0 7.38h24M0 9.85h24M0 12.31h24M0 14.77h24" stroke="#ffffff" strokeWidth="1.23"/>
                      <rect width="9.6" height="8.6" rx="1" fill="#3C3B6E" />
                      <circle cx="2.4" cy="2.1" r="0.8" fill="#ffffff" />
                      <circle cx="7.2" cy="2.1" r="0.8" fill="#ffffff" />
                      <circle cx="4.8" cy="4.3" r="0.8" fill="#ffffff" />
                      <circle cx="2.4" cy="6.5" r="0.8" fill="#ffffff" />
                      <circle cx="7.2" cy="6.5" r="0.8" fill="#ffffff" />
                    </svg>
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>

            {/* Search Button with Dropdown Bar */}
            <div className="coida-search-wrapper">
              <button
                type="button"
                className="coida-search-btn"
                title={isVietnamese ? 'Tìm kiếm sân / chi nhánh' : 'Search courts / branches'}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Tìm kiếm"
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>

              {isSearchOpen && (
                <form className="coida-search-dropdown" onSubmit={handleSearchSubmit}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={isVietnamese ? 'Tìm sân, chi nhánh, dịch vụ...' : 'Search courts, branches...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" title={isVietnamese ? 'Tìm' : 'Search'}>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </form>
              )}
            </div>

            {/* Red Booking CTA Button: 📅 ĐẶT LỊCH */}
            <button
              type="button"
              className="coida-booking-cta-btn"
              onClick={() => handleNavClick('booking')}
              title={isVietnamese ? 'Đặt sân thi đấu ngay' : 'Book court now'}
            >
              <i className="fa-solid fa-calendar-days"></i>
              <span>{isVietnamese ? 'ĐẶT LỊCH' : 'BOOK NOW'}</span>
            </button>

            {/* User Account / Login with Dropdown */}
            {currentUser ? (
              <div className="coida-user-wrapper" ref={userDropdownRef}>
                <div
                  className="coida-user-badge"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  title={isVietnamese ? 'Tài khoản & Đơn đặt' : 'Account & Orders'}
                >
                  <i className="fa-solid fa-circle-user"></i>
                  <span className="coida-user-name">
                    {currentUser.fullName || currentUser.username}
                  </span>
                  <i className={`fa-solid fa-chevron-down coida-user-chevron ${isUserMenuOpen ? 'open' : ''}`}></i>
                </div>

                {isUserMenuOpen && (
                  <div className="coida-user-dropdown-popover">
                    <div className="coida-user-dropdown-header">
                      <div className="coida-user-dropdown-name">
                        {currentUser.fullName || currentUser.username}
                      </div>
                      <div className="coida-user-dropdown-meta">
                        <span>@{currentUser.username}</span>
                        <span className="coida-user-role-badge">
                          {currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN' || currentUser.username === 'admin'
                            ? 'Admin'
                            : 'Thành viên'}
                        </span>
                      </div>
                    </div>

                    <ul className="coida-user-dropdown-menu">
                      <li>
                        <button
                          type="button"
                          className="coida-user-dropdown-item"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setAccountModalTab('profile');
                            setIsAccountModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-id-card"></i>
                          <span>{isVietnamese ? 'Thông tin người dùng' : 'User Profile'}</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="coida-user-dropdown-item"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setAccountModalTab('orders');
                            setIsAccountModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-receipt"></i>
                          <span>{isVietnamese ? 'Đơn hàng đã đặt' : 'My Bookings'}</span>
                        </button>
                      </li>
                      {(currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN' || currentUser.username === 'admin') && (
                        <li>
                          <button
                            type="button"
                            className="coida-user-dropdown-item"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onNavigate('admin');
                            }}
                          >
                            <i className="fa-solid fa-gauge-high"></i>
                            <span>{isVietnamese ? 'Quản trị hệ thống' : 'Admin Dashboard'}</span>
                          </button>
                        </li>
                      )}
                      <li>
                        <button
                          type="button"
                          className="coida-user-dropdown-item logout"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                        >
                          <i className="fa-solid fa-right-from-bracket"></i>
                          <span>{isVietnamese ? 'Đăng xuất' : 'Logout'}</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="coida-login-btn"
                onClick={() => setIsAuthModalOpen(true)}
                title={isVietnamese ? 'Đăng nhập tài khoản' : 'Login'}
              >
                <i className="fa-solid fa-user"></i>
                <span>{isVietnamese ? 'Đăng Nhập' : 'Login'}</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              className="coida-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Menu"
              aria-label="Menu"
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>

          </div>

        </div>
      </div>

      {/* Auth Modal with Captcha */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

      {/* Account Profile & Orders Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        initialTab={accountModalTab}
        user={currentUser}
        onNavigate={onNavigate}
        isVietnamese={isVietnamese}
      />
    </header>
  );
}
