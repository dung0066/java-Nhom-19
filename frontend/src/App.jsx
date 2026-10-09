import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import AppNavbar from './components/common/AppNavbar';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import { checkBackendHealth } from './services/api';

export default function App() {
  const [isBackendLive, setIsBackendLive] = useState(false);
  const mainRef = useRef(null);

  // Determine initial page from URL path or hash
  const getInitialPage = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('admin') || hash.includes('admin')) {
      return 'admin';
    }
    if (path === '/' && !path.includes('dat-san') && !hash.includes('dat-san') && hash.includes('home')) {
      return 'home';
    }
    // Default to booking page (Trang đặt sân chuẩn template)
    return 'booking';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);

  // Check backend health periodically
  useEffect(() => {
    const checkStatus = async () => {
      const live = await checkBackendHealth();
      setIsBackendLive(live);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // GSAP Smooth page transition
  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { autoAlpha: 0.3, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [currentPage]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'admin') {
      window.history.pushState(null, '', '#admin');
    } else if (page === 'home') {
      window.history.pushState(null, '', '#home');
    } else {
      window.history.pushState(null, '', '#dat-san');
    }
  };

  return (
    <div className="ways-station-application-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. UNIFIED APP NAVBAR */}
      <AppNavbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isBackendLive={isBackendLive}
      />

      {/* 2. MAIN ACTIVE VIEW WITH GSAP TRANSITION */}
      <main ref={mainRef} style={{ flex: 1 }}>
        {currentPage === 'admin' && <AdminPage onNavigate={handleNavigate} />}
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'booking' && <BookingPage onNavigate={handleNavigate} />}
      </main>
    </div>
  );
}
