import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import { BRANCHES } from '../data/courtData';
import MembershipModal from '../components/home/MembershipModal';
import HomeNewsSection from '../components/home/HomeNewsSection';
import HomeProductsSection from '../components/home/HomeProductsSection';
import '../styles/home.css';
import '../styles/home-clean.css';

export default function HomePage({ onNavigate }) {
  const { language, t, isVietnamese } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [activeBranchKey, setActiveBranchKey] = useState('NVL');
  const [quickDate, setQuickDate] = useState('today');
  const [quickTime, setQuickTime] = useState('evening');

  const slides = [
    { id: 'slide1', bg: "url('/banners/banner1.jpg')" },
    { id: 'slide2', bg: "url('/banners/banner2.jpg')" },
    { id: 'slide3', bg: "url('/banners/banner3.jpg')" },
    { id: 'slide4', bg: "url('/banners/banner4.jpg')" },
    { id: 'slide5', bg: "url('/banners/banner5.jpg')" }
  ];

  const carouselContainerRef = useRef(null);
  const isHoveredRef = useRef(false);
  const prevSlideRef = useRef(0);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSelectSlide = (idx) => {
    setCurrentSlide(idx);
  };

  // Auto-advance banner every 5 seconds when not hovered
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHoveredRef.current) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Smooth cinematic cross-fade between clean banner photos
  useEffect(() => {
    const container = carouselContainerRef.current;
    if (!container) return;

    const slidesEls = container.querySelectorAll('.carousel-slide');
    const activeSlideEl = slidesEls[currentSlide];
    const prevIdx = prevSlideRef.current;
    const prevSlideEl = prevIdx !== currentSlide ? slidesEls[prevIdx] : null;
    prevSlideRef.current = currentSlide;

    if (!activeSlideEl) return;

    gsap.set(activeSlideEl, { zIndex: 3 });
    gsap.fromTo(
      activeSlideEl,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.65, ease: 'power2.out' }
    );

    const activeBg = activeSlideEl.querySelector('.slide-bg');
    if (activeBg) {
      gsap.fromTo(
        activeBg,
        { scale: 1.05 },
        { scale: 1, duration: 1.5, ease: 'power2.out' }
      );
    }

    if (prevSlideEl) {
      gsap.set(prevSlideEl, { zIndex: 2 });
      gsap.to(prevSlideEl, {
        autoAlpha: 0,
        duration: 0.65,
        ease: 'power2.inOut'
      });
    }
  }, [currentSlide]);

  return (
    <div className="ways-home-page-root theme-white">
      {/* 1. HERO SLIDER BANNER (PURE CLEAN IMAGES ONLY - NO OVERLAY TEXT OR BOTTOM DOCK) */}
      <section
        className="hero-carousel-section"
        style={{ minHeight: '640px', position: 'relative' }}
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
      >
        <div className="carousel-container" ref={carouselContainerRef}>
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`carousel-slide ${currentSlide === idx ? 'active' : ''}`}
            >
              <div
                className="slide-bg"
                style={{ backgroundImage: slide.bg }}
              ></div>
            </div>
          ))}
        </div>

        {/* Arrow Navigation */}
        <div className="carousel-nav-arrows">
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handlePrevSlide}
            title={isVietnamese ? 'Ảnh trước' : 'Previous image'}
            aria-label="Previous"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handleNextSlide}
            title={isVietnamese ? 'Ảnh tiếp theo' : 'Next image'}
            aria-label="Next"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        {/* Minimal Clean Dots */}
        <div className="carousel-dots-clean">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`carousel-dot-clean ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => handleSelectSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* =========================================================
          2. KHUNG ĐẶT SÂN NHANH Ở TRÊN (NỔI ĐÈ CHÂN BANNER)
          ========================================================= */}
      <section className="quick-booking-hero-engine" style={{ padding: '0 24px', marginTop: '-60px', position: 'relative', zIndex: 35 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', background: '#ffffff', borderRadius: '22px', boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)', border: '1.5px solid #e2e8f0', padding: '26px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <h2 style={{ fontSize: '22px', color: '#002d62', fontWeight: '900', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                {isVietnamese ? 'Đặt sân thể thao ngay' : 'Book Sports Courts Now'}
              </h2>
              <span style={{ fontSize: '13.5px', color: '#64748b', display: 'block' }}>
                {isVietnamese ? 'Tìm kiếm sân chơi thể thao, thi đấu khắp cả nước' : 'Find sports and tournament courts across the city'}
              </span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', color: '#047857', padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '700' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              {isVietnamese ? 'Hệ thống mở cửa 05:00 - 24:00 • 19 ca trống hôm nay' : 'Open 05:00 - 24:00 daily • 19 slots available today'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
            {/* Chọn Cơ Sở */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                <i className="fa-solid fa-location-dot" style={{ color: '#009fe3', marginRight: '6px' }}></i> {isVietnamese ? 'Cơ Sở Sân' : 'Branch Location'}
              </label>
              <select
                value={activeBranchKey}
                onChange={(e) => setActiveBranchKey(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: '700', color: '#0f172a', background: '#f8fafc', outline: 'none', cursor: 'pointer' }}
              >
                <option value="NVL">D2 Shop NVL - Gò Vấp (7 Sân)</option>
                <option value="DQII">D2 Shop DQII - Gò Vấp (4 Sân)</option>
                <option value="NQA">D2 Shop NQA - Tân Phú (6 Sân)</option>
                <option value="HB">D2 Shop HB - Thủ Đức (2 Sân)</option>
              </select>
            </div>

            {/* Chọn Ngày */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                <i className="fa-solid fa-calendar-day" style={{ color: '#009fe3', marginRight: '6px' }}></i> {isVietnamese ? 'Ngày Chơi' : 'Play Date'}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setQuickDate('today')}
                  style={{ flex: 1, padding: '10px 8px', borderRadius: '10px', border: quickDate === 'today' ? '1.5px solid #009fe3' : '1.5px solid #e2e8f0', background: quickDate === 'today' ? '#e0f2fe' : '#ffffff', color: quickDate === 'today' ? '#009fe3' : '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {isVietnamese ? 'Hôm nay' : 'Today'}
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('tomorrow')}
                  style={{ flex: 1, padding: '10px 8px', borderRadius: '10px', border: quickDate === 'tomorrow' ? '1.5px solid #009fe3' : '1.5px solid #e2e8f0', background: quickDate === 'tomorrow' ? '#e0f2fe' : '#ffffff', color: quickDate === 'tomorrow' ? '#009fe3' : '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {isVietnamese ? 'Ngày mai' : 'Tomorrow'}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('booking')}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                  title={isVietnamese ? 'Chọn ngày khác trên lịch' : 'Select other dates on calendar'}
                >
                  <i className="fa-solid fa-calendar"></i>
                </button>
              </div>
            </div>

            {/* Khung Giờ Ưa Thích */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                <i className="fa-solid fa-clock" style={{ color: '#009fe3', marginRight: '6px' }}></i> {isVietnamese ? 'Khung Giờ' : 'Time Period'}
              </label>
              <select
                value={quickTime}
                onChange={(e) => setQuickTime(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: '700', color: '#0f172a', background: '#f8fafc', outline: 'none', cursor: 'pointer' }}
              >
                <option value="morning">{isVietnamese ? '🌅 Sáng sớm (05:00 - 12:00) • 35k/ca' : '🌅 Morning (05:00 - 12:00) • 35k/slot'}</option>
                <option value="afternoon">{isVietnamese ? '☀️ Buổi chiều (12:00 - 16:30) • 35k/ca' : '☀️ Afternoon (12:00 - 16:30) • 35k/slot'}</option>
                <option value="evening">{isVietnamese ? '⚡ Giờ Vàng HOT (16:30 - 22:00) • 60k/ca' : '⚡ Peak Hours HOT (16:30 - 22:00) • 60k/slot'}</option>
                <option value="night">{isVietnamese ? '🌙 Ca Đêm (22:00 - 24:00) • 35k/ca' : '🌙 Late Night (22:00 - 24:00) • 35k/slot'}</option>
              </select>
            </div>

            {/* Nút Tìm Sân */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: 'transparent', display: 'block', marginBottom: '6px' }}>
                Action
              </label>
              <button
                type="button"
                onClick={() => onNavigate('booking')}
                style={{ width: '100%', padding: '13px 20px', borderRadius: '12px', border: 'none', background: '#ff0055', color: '#ffffff', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 18px rgba(255, 0, 85, 0.35)', transition: 'transform 0.15s ease' }}
              >
                <i className="fa-solid fa-magnifying-glass"></i>
                <span>{isVietnamese ? 'Tìm kiếm ngay' : 'Search Now'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. THANH 3 CỘT TÍNH NĂNG Ở DƯỚI (TÌM VỊ TRÍ, ĐẶT LỊCH, TÌM ĐỐI)
          ========================================================= */}
      <section className="home-feature-strip">
        <div className="home-feature-strip-inner">
          {/* Cột 1: Tìm kiếm vị trí sân */}
          <div
            className="home-feature-col"
            onClick={() => {
              const el = document.getElementById('branchesSection');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            title={isVietnamese ? 'Xem các cụm sân D2 Shop' : 'View D2 Shop branches'}
          >
            <div className="home-feature-icon-wrap">
              <img src="/icons/icon-court.png" alt="Tìm kiếm vị trí sân" className="home-feature-icon-img" />
            </div>
            <h3 className="home-feature-title">
              {isVietnamese ? 'Tìm kiếm vị trí sân' : 'Find Court Locations'}
            </h3>
            <p className="home-feature-desc">
              {isVietnamese
                ? 'Dữ liệu sân đấu dồi dào, liên tục cập nhật, giúp bạn dễ dàng tìm kiếm theo khu vực mong muốn'
                : 'Abundant court data, constantly updated, helping you easily find courts in your desired area'}
            </p>
          </div>

          <div className="home-feature-divider"></div>

          {/* Cột 2: Đặt lịch online */}
          <div
            className="home-feature-col"
            onClick={() => onNavigate('booking')}
            title={isVietnamese ? 'Đặt sân trực tuyến ngay' : 'Book court online now'}
          >
            <div className="home-feature-icon-wrap">
              <img src="/icons/icon-calendar.png" alt="Đặt lịch online" className="home-feature-icon-img" />
            </div>
            <h3 className="home-feature-title">
              {isVietnamese ? 'Đặt lịch online' : 'Book Online Instantly'}
            </h3>
            <p className="home-feature-desc">
              {isVietnamese
                ? 'Không cần đến trực tiếp, không cần gọi điện đặt lịch, bạn hoàn toàn có thể đặt sân ở bất kì đâu có internet'
                : 'No need to visit in person or call, book your court anytime, anywhere with internet access'}
            </p>
          </div>

          <div className="home-feature-divider"></div>

          {/* Cột 3: Tìm đối, bắt cặp đấu */}
          <div
            className="home-feature-col"
            onClick={() => onNavigate('booking')}
            title={isVietnamese ? 'Tìm đối & giao lưu cầu lông' : 'Find opponents & join matches'}
          >
            <div className="home-feature-icon-wrap">
              <img src="/icons/icon-match.png" alt="Tìm đối, bắt cặp đấu" className="home-feature-icon-img" />
            </div>
            <h3 className="home-feature-title">
              {isVietnamese ? 'Tìm đối, bắt cặp đấu' : 'Matchmaking & Opponents'}
            </h3>
            <p className="home-feature-desc">
              {isVietnamese
                ? 'Tìm kiếm, giao lưu các đội thi đấu thể thao, kết nối, xây dựng cộng đồng thể thao sôi nổi, mạnh mẽ'
                : 'Find opponents, connect with sports teams, and build an active, vibrant athletic community'}
            </p>
          </div>
        </div>
      </section>


      {/* 4. CÁC CƠ SỞ SÂN CẦU LÔNG D2 SHOP */}
      <section className="d2-section d2-section-gray" id="branchesSection">
        <div className="d2-container">
          <div className="d2-section-header">
            <span className="d2-pill-badge d2-pill-blue">
              <i className="fa-solid fa-location-dot"></i> {isVietnamese ? 'Hệ Thống Sân D2 Shop' : 'D2 Shop Court System'}
            </span>
            <h2 className="d2-section-title">
              {isVietnamese ? 'Cơ Sở Sân Cầu Lông Hiện Đại' : 'Modern Badminton Court Clusters'}
            </h2>
            <p className="d2-section-desc">
              {isVietnamese
                ? 'Không gian rộng rãi, thoáng mát, 100% thảm Taraflex BWF đạt chuẩn thi đấu và dàn đèn LED chống chói tại TP.HCM.'
                : 'Spacious, well-ventilated halls with 100% tournament-grade BWF Taraflex mats and anti-glare LED lighting in HCMC.'}
            </p>
          </div>

          <div className="d2-courts-grid">
            {[
              {
                id: 'NVL',
                name: 'D2 Shop Nguyễn Văn Lượng',
                district: isVietnamese ? 'Quận Gò Vấp' : 'Go Vap Dist.',
                address: '70 Nguyễn Văn Lượng, Phường 10, Gò Vấp',
                courts: isVietnamese ? '7 Sân BWF' : '7 BWF Courts',
                price: '35.000đ',
                img: '/banners/banner1.jpg',
                tags: isVietnamese ? ['Thảm Taraflex', 'Đèn 600 Lux', 'Tắm nóng lạnh'] : ['Taraflex Mat', '600 Lux LED', 'Hot Shower']
              },
              {
                id: 'DQII',
                name: 'D2 Shop Dương Quảng Hàm',
                district: isVietnamese ? 'Quận Gò Vấp' : 'Go Vap Dist.',
                address: '262 Dương Quảng Hàm, Phường 5, Gò Vấp',
                courts: isVietnamese ? '4 Sân VIP' : '4 VIP Courts',
                price: '35.000đ',
                img: '/banners/banner2.jpg',
                tags: isVietnamese ? ['Máy lạnh', 'Quầy nước & Vợt', 'Bãi đỗ ô tô'] : ['Air-con', 'Drink Bar', 'Car Parking']
              },
              {
                id: 'NQA',
                name: 'D2 Shop Nguyễn Quý Anh',
                district: isVietnamese ? 'Quận Tân Phú' : 'Tan Phu Dist.',
                address: '86 Nguyễn Quý Anh, P. Tân Sơn Nhì, Tân Phú',
                courts: isVietnamese ? '6 Sân đấu' : '6 Match Courts',
                price: '35.000đ',
                img: '/banners/banner3.jpg',
                tags: isVietnamese ? ['Khán đài & Cafe', 'Thảm Pháp', 'Căng vợt 4 nút'] : ['Cafe Area', 'French Mats', 'Stringing']
              },
              {
                id: 'HB',
                name: 'D2 Shop Hiệp Bình',
                district: isVietnamese ? 'TP. Thủ Đức' : 'Thu Duc City',
                address: '135 Hiệp Bình, P. Hiệp Bình Chánh, Thủ Đức',
                courts: isVietnamese ? '2 Sân VIP' : '2 VIP Courts',
                price: '50.000đ',
                img: '/banners/banner4.jpg',
                tags: isVietnamese ? ['Phòng VIP riêng', 'Máy lạnh 100%', 'Khăn lạnh free'] : ['Private Room', 'Full AC', 'Free Towels']
              }
            ].map((court) => (
              <div key={court.id} className="d2-court-card">
                <div className="d2-court-thumb-wrap">
                  <img src={court.img} alt={court.name} className="d2-court-img" />
                  <span className="d2-court-overlay-badge">{court.courts}</span>
                  <span className="d2-court-status-badge">
                    <span className="d2-dot-live"></span>
                    {isVietnamese ? 'Mở cửa' : 'Open'}
                  </span>
                </div>
                <div className="d2-court-body">
                  <div className="d2-court-district">{court.district}</div>
                  <h3 className="d2-court-name">{court.name}</h3>
                  <p className="d2-court-addr">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>{court.address}</span>
                  </p>
                  <div className="d2-court-tags">
                    {court.tags.map((t, idx) => (
                      <span key={idx} className="d2-court-tag">{t}</span>
                    ))}
                  </div>
                  <div className="d2-court-foot">
                    <div>
                      <span className="d2-court-price-label">{isVietnamese ? 'Giá từ' : 'From'}</span>
                      <strong className="d2-court-price-val">{court.price}</strong>
                      <span className="d2-court-price-unit"> / ca</span>
                    </div>
                    <button
                      type="button"
                      className="d2-btn-book-court"
                      onClick={() => onNavigate('booking')}
                    >
                      <span>{isVietnamese ? 'Đặt sân' : 'Book'}</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 3 BƯỚC ĐẶT SÂN NHANH CHÓNG */}
      <section className="d2-section d2-section-white">
        <div className="d2-container">
          <div className="d2-section-header">
            <span className="d2-pill-badge d2-pill-green">
              <i className="fa-solid fa-bolt"></i> {isVietnamese ? 'Quy Trình Siêu Tốc' : 'Fast Booking Process'}
            </span>
            <h2 className="d2-section-title">
              {isVietnamese ? 'Đặt Sân Dễ Dàng Với 3 Bước' : 'Book In 3 Easy Steps'}
            </h2>
            <p className="d2-section-desc">
              {isVietnamese
                ? 'Hệ thống tự động hóa hoàn toàn. Xem trực quan lịch trống, giữ chỗ tức thì trong 30 giây.'
                : '100% automated system. Check live available slots and secure your booking in 30 seconds.'}
            </p>
          </div>

          <div className="d2-steps-grid">
            <div className="d2-step-card">
              <span className="d2-step-num">01</span>
              <div className="d2-step-icon" style={{ background: '#e0f2fe', color: '#009fe3' }}>
                <i className="fa-solid fa-calendar-days"></i>
              </div>
              <h3 className="d2-step-title">{isVietnamese ? 'Chọn Sân & Giờ Chơi' : 'Pick Court & Time'}</h3>
              <p className="d2-step-text">
                {isVietnamese
                  ? 'Tra cứu 4 cụm sân D2 Shop và chọn ca 30 phút thuận tiện nhất với bạn và đồng đội.'
                  : 'Browse 4 D2 Shop court clusters and select the most convenient 30-min time slot.'}
              </p>
            </div>

            <div className="d2-step-card">
              <span className="d2-step-num">02</span>
              <div className="d2-step-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <i className="fa-solid fa-user-pen"></i>
              </div>
              <h3 className="d2-step-title">{isVietnamese ? 'Điền Thông Tin Người Đặt' : 'Provide Details'}</h3>
              <p className="d2-step-text">
                {isVietnamese
                  ? 'Nhập tên & số điện thoại, có thể chọn thêm thuê vợt Yonex/Lining và nước giải khát tận sân.'
                  : 'Fill your contact info, with options to rent genuine rackets and order court-side drinks.'}
              </p>
            </div>

            <div className="d2-step-card">
              <span className="d2-step-num">03</span>
              <div className="d2-step-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <i className="fa-solid fa-qrcode"></i>
              </div>
              <h3 className="d2-step-title">{isVietnamese ? 'Quét QR & Nhận Sân' : 'Scan QR & Play'}</h3>
              <p className="d2-step-text">
                {isVietnamese
                  ? 'Thanh toán chuyển khoản tự động, nhận mã xác nhận tức thì và sẵn sàng ra sân giao lưu.'
                  : 'Automated bank transfer, instant confirmation code, ready to step onto the court.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BẢNG GIÁ NIÊM YẾT MINH BẠCH */}
      <section className="d2-section d2-section-gray" id="pricingSection">
        <div className="d2-container">
          <div className="d2-section-header">
            <span className="d2-pill-badge d2-pill-amber">
              <i className="fa-solid fa-tags"></i> {isVietnamese ? 'Bảng Giá Niêm Yết' : 'Transparent Pricing'}
            </span>
            <h2 className="d2-section-title">
              {isVietnamese ? 'Bảng Giá Thuê Sân Linh Hoạt' : 'Court Rental Pricing'}
            </h2>
            <p className="d2-section-desc">
              {isVietnamese
                ? 'Tính theo từng ca 30 phút tiết kiệm. Cam kết không phụ phí, hủy linh hoạt trước 2 giờ.'
                : 'Flexible 30-min rates. No hidden fees, flexible 100% refund cancellation 2 hours prior.'}
            </p>
          </div>

          <div className="d2-pricing-grid">
            <div className="d2-pricing-card">
              <h3 className="d2-pricing-name">{isVietnamese ? 'Khung Giờ Thường' : 'Regular Hours'}</h3>
              <div className="d2-pricing-hours">05:00 - 16:30 & 22:00 - 24:00</div>
              <div className="d2-pricing-price">
                <span className="d2-price-large">35.000đ</span>
                <span className="d2-price-unit">/ ca 30p (70k/h)</span>
              </div>
              <ul className="d2-pricing-list">
                <li><i className="fa-solid fa-check"></i> {isVietnamese ? 'Không gian yên tĩnh, thoáng mát' : 'Quiet, breezy court space'}</li>
                <li><i className="fa-solid fa-check"></i> {isVietnamese ? 'Phù hợp tập luyện, nhóm tự do' : 'Ideal for solo drills & students'}</li>
                <li><i className="fa-solid fa-check"></i> {isVietnamese ? 'Miễn phí gửi xe & tắm nóng lạnh' : 'Free parking & hot showers'}</li>
              </ul>
              <button
                type="button"
                className="d2-btn-price-select"
                onClick={() => onNavigate('booking')}
              >
                {isVietnamese ? 'Đặt Ca Thường' : 'Book Regular'}
              </button>
            </div>

            <div className="d2-pricing-card featured">
              <span className="d2-pricing-badge">{isVietnamese ? 'HOT NHẤT' : 'MOST POPULAR'}</span>
              <h3 className="d2-pricing-name">{isVietnamese ? 'Giờ Vàng Cao Điểm' : 'Golden Peak Hours'}</h3>
              <div className="d2-pricing-hours">16:30 - 22:00 {isVietnamese ? '(Hàng ngày)' : '(Daily)'}</div>
              <div className="d2-pricing-price">
                <span className="d2-price-large" style={{ color: '#009fe3' }}>60.000đ</span>
                <span className="d2-price-unit">/ ca 30p (120k/h)</span>
              </div>
              <ul className="d2-pricing-list">
                <li><i className="fa-solid fa-check" style={{ color: '#009fe3' }}></i> {isVietnamese ? 'Full dàn đèn LED 600 Lux chuẩn châu Âu' : '100% European 600 Lux LED lighting'}</li>
                <li><i className="fa-solid fa-check" style={{ color: '#009fe3' }}></i> {isVietnamese ? 'Không khí thi đấu sôi động, giao lưu cọ xát' : 'High energy competitive matches'}</li>
                <li><i className="fa-solid fa-check" style={{ color: '#009fe3' }}></i> {isVietnamese ? 'Ưu tiên giữ sân & check-in nhanh tại quầy' : 'Priority booking & express check-in'}</li>
              </ul>
              <button
                type="button"
                className="d2-btn-price-select d2-btn-price-featured"
                onClick={() => onNavigate('booking')}
              >
                {isVietnamese ? 'Giữ Chỗ Giờ Vàng' : 'Reserve Peak Slots'}
              </button>
            </div>

            <div className="d2-pricing-card">
              <h3 className="d2-pricing-name">{isVietnamese ? 'Gói Cố Định Tháng / CLB' : 'Monthly Recurring Pass'}</h3>
              <div className="d2-pricing-hours">{isVietnamese ? 'Cố định hàng tuần theo tháng' : 'Fixed weekly recurring slot'}</div>
              <div className="d2-pricing-price">
                <span className="d2-price-large" style={{ color: '#ea580c' }}>-15%</span>
                <span className="d2-price-unit">{isVietnamese ? 'tổng hóa đơn' : 'total monthly bill'}</span>
              </div>
              <ul className="d2-pricing-list">
                <li><i className="fa-solid fa-check"></i> {isVietnamese ? 'Cố định sân & giờ vàng không lo hết chỗ' : 'Guaranteed reserved weekly time'}</li>
                <li><i className="fa-solid fa-check"></i> {isVietnamese ? 'Miễn phí tủ gửi vợt & mượn bóng tập' : 'Free racket locker & practice shuttles'}</li>
                <li><i className="fa-solid fa-check"></i> {isVietnamese ? 'Hỗ trợ linh hoạt đổi buổi khi bận' : 'Flexible reschedule when requested'}</li>
              </ul>
              <button
                type="button"
                className="d2-btn-price-select"
                onClick={() => setIsMembershipModalOpen(true)}
              >
                {isVietnamese ? 'Đăng Ký Gói Cố Định' : 'Apply For Pass'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TIỆN ÍCH CHUẨN THI ĐẤU */}
      <section className="d2-section d2-section-white">
        <div className="d2-container">
          <div className="d2-section-header">
            <span className="d2-pill-badge d2-pill-blue">
              <i className="fa-solid fa-medal"></i> {isVietnamese ? 'Tiêu Chuẩn Thi Đấu' : 'Tournament Standard'}
            </span>
            <h2 className="d2-section-title">
              {isVietnamese ? 'Trang Thiết Bị & Tiện Ích 5 Sao' : '5-Star Facilities & Amenities'}
            </h2>
            <p className="d2-section-desc">
              {isVietnamese
                ? 'Được trang bị đồng bộ và chuyên nghiệp nhằm đem lại trải nghiệm vận động tốt nhất cho cơ thủ.'
                : 'Professionally equipped to deliver the highest quality sporting experience.'}
            </p>
          </div>

          <div className="d2-amenities-grid">
            <div className="d2-amenity-card">
              <div className="d2-amenity-icon" style={{ background: '#e0f2fe', color: '#009fe3' }}>
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <h4 className="d2-amenity-title">{isVietnamese ? 'Thảm Taraflex BWF' : 'BWF Taraflex Mats'}</h4>
              <p className="d2-amenity-desc">
                {isVietnamese
                  ? 'Độ dày 5 lớp giảm chấn, bảo vệ khớp gối và chống trơn trượt tối đa khi di chuyển nhanh.'
                  : '5-layer shock absorption protecting knees and preventing slips during agile moves.'}
              </p>
            </div>

            <div className="d2-amenity-card">
              <div className="d2-amenity-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              <h4 className="d2-amenity-title">{isVietnamese ? 'Đèn LED 600 Lux' : '600 Lux Anti-Glare'}</h4>
              <p className="d2-amenity-desc">
                {isVietnamese
                  ? 'Chiếu sáng hai bên hông sân chuẩn châu Âu, tuyệt đối không chói mắt khi ngước nhìn đón cầu bổng.'
                  : 'Lateral European lighting layout preventing eye fatigue when tracking high shuttles.'}
              </p>
            </div>

            <div className="d2-amenity-card">
              <div className="d2-amenity-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <i className="fa-solid fa-shower"></i>
              </div>
              <h4 className="d2-amenity-title">{isVietnamese ? 'Tắm Nước Nóng & Locker' : 'Hot Showers & Lockers'}</h4>
              <p className="d2-amenity-desc">
                {isVietnamese
                  ? 'Hệ thống phòng tắm nước nóng sạch sẽ cùng tủ khóa đồ cá nhân an toàn tuyệt đối.'
                  : 'Clean hot shower cabins and individual secure digital lockers for personal items.'}
              </p>
            </div>

            <div className="d2-amenity-card">
              <div className="d2-amenity-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <i className="fa-solid fa-bottle-water"></i>
              </div>
              <h4 className="d2-amenity-title">{isVietnamese ? 'Thuê Vợt & Dịch Vụ Sân' : 'Gear Rental & Drinks'}</h4>
              <p className="d2-amenity-desc">
                {isVietnamese
                  ? 'Cho thuê vợt Yonex/Lining chính hãng, dịch vụ căng cước 4 nút và nước giải khát lạnh tận sân.'
                  : 'Genuine Yonex/Lining rackets for rent, 4-knot stringing and chilled drinks.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER */}
      <section className="d2-section d2-section-gray" style={{ paddingBottom: '70px' }}>
        <div className="d2-container">
          <div className="d2-cta-banner">
            <div className="d2-cta-content">
              <span className="d2-cta-badge">
                <i className="fa-solid fa-bolt"></i> {isVietnamese ? 'Đặt Lịch Tức Thì' : 'Instant Reservation'}
              </span>
              <h2 className="d2-cta-title">
                {isVietnamese ? 'Sẵn Sàng Ra Sân Cùng D2 Shop?' : 'Ready To Play At D2 Shop?'}
              </h2>
              <p className="d2-cta-desc">
                {isVietnamese
                  ? 'Tra cứu lịch sân trống thời gian thực và đặt chỗ ngay hôm nay. Hỗ trợ khách hàng chu đáo 24/7.'
                  : 'Check live court availability and reserve your court in seconds. 24/7 dedicated customer care.'}
              </p>
            </div>

            <div className="d2-cta-actions">
              <button
                type="button"
                className="d2-btn-cta-main"
                onClick={() => onNavigate('booking')}
              >
                <i className="fa-solid fa-calendar-check"></i>
                <span>{isVietnamese ? 'Đặt Sân Trực Tuyến' : 'Book Online'}</span>
              </button>
              <a href="tel:0914977030" className="d2-btn-cta-phone">
                <i className="fa-solid fa-phone"></i>
                <span>0914 977 030</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. KHỐI DỤNG CỤ, VỢT & GIÀY CHO THUÊ (ĐỒNG BỘ TRỰC TIẾP TỪ ADMIN) */}
      <HomeProductsSection onNavigate={onNavigate} isVietnamese={isVietnamese} />

      {/* 9. KHỐI TIN TỨC & SỰ KIỆN MỚI NHẤT (NGAY TRÊN FOOTER) */}
      <HomeNewsSection onNavigate={onNavigate} />
      <MembershipModal
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
      />
    </div>
  );
}
