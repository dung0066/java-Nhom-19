import React, { useState, useEffect } from 'react';
import { Sparkles, Bolt, CalendarCheck, ShieldCheck, Trophy, Clock, ArrowRight, Flame, MapPin } from 'lucide-react';

const SLIDES = [
  {
    badge: 'Sân Thi Đấu Tiêu Chuẩn BWF Quốc Tế',
    title: 'Hệ Thống Sân Cầu Lông Đẳng Cấp Số 1 TP.HCM',
    desc: 'Mặt thảm Enlio/Taraflex 7.5mm chính hãng, hệ thống đèn LED 500 Lux chống chói chuẩn thi đấu thế giới, điều hòa mát mẻ 24/7.',
    bg: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1600&auto=format&fit=crop',
    ctaPrimary: 'Đặt Sân Trực Tuyến Ngay',
    targetTab: 'booking'
  },
  {
    badge: 'Dụng Cụ Cao Cấp & Khử Khuẩn UV',
    title: 'Cho Thuê Vợt Yonex, Victor, Lining & Giày UV Sạch 100%',
    desc: 'Đầy đủ vợt thi đấu căng sẵn cước 11kg (BG65Ti), giày thi đấu Yonex/Mizuno sấy tiệt trùng UV 15 phút, khăn lạnh bạc hà và nước bù khoáng tận sân.',
    bg: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=1600&auto=format&fit=crop',
    ctaPrimary: 'Khám Phá Kho Dụng Cụ',
    targetTab: 'services'
  },
  {
    badge: 'Phục Vụ 24/7 Toàn TP.HCM',
    title: 'Cháy Hết Mình Cùng Đam Mê Bất Kể Ngày Đêm',
    desc: 'Hệ thống 4 chi nhánh lớn tại Gò Vấp, Tân Phú, Thủ Đức với hơn 25 sân luôn sẵn sàng chào đón các cơ thủ và câu lạc bộ giao lưu.',
    bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop',
    ctaPrimary: 'Xem Chợ Pass Sân',
    targetTab: 'market'
  }
];

export default function HomeHero({ onNavigateTab, passSlotsCount = 3 }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <section className="home-hero-container">
      {/* Background with overlay */}
      <div
        className="hero-backdrop"
        style={{ backgroundImage: `linear-gradient(rgba(7, 11, 20, 0.72), rgba(7, 11, 20, 0.92)), url('${slide.bg}')` }}
      />

      <div className="hero-inner-content">
        <div className="hero-left-column">
          <div className="hero-pill-badge">
            <Trophy size={14} className="text-emerald" />
            <span>{slide.badge}</span>
          </div>

          <h1 className="hero-headline">{slide.title}</h1>
          <p className="hero-subtext">{slide.desc}</p>

          <div className="hero-cta-buttons">
            <button
              type="button"
              onClick={() => onNavigateTab(slide.targetTab)}
              className="btn-hero-primary"
            >
              <span>{slide.ctaPrimary}</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('booking')}
              className="btn-hero-secondary"
            >
              <CalendarCheck size={16} className="text-emerald" />
              <span>Xem Bảng Lịch Ma Trận</span>
            </button>

            {passSlotsCount > 0 && (
              <button
                type="button"
                onClick={() => onNavigateTab('market')}
                className="btn-hero-pass"
              >
                <Flame size={15} className="text-purple" />
                <span>Chợ Pass Sân ({passSlotsCount} ca)</span>
              </button>
            )}
          </div>

          {/* Slide Indicator Dots */}
          <div className="hero-slide-dots">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`slide-dot ${idx === currentSlide ? 'active' : ''}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Stats & Highlights */}
        <div className="hero-stats-panel">
          <div className="stats-glass-card">
            <div className="stat-highlight">
              <span className="stat-big-number">4</span>
              <div className="stat-text-meta">
                <strong>Chi Nhánh Lớn</strong>
                <span>Gò Vấp • Tân Phú • Thủ Đức</span>
              </div>
            </div>
            <div className="stat-divider"></div>

            <div className="stat-highlight">
              <span className="stat-big-number">25+</span>
              <div className="stat-text-meta">
                <strong>Sân Chuẩn BWF</strong>
                <span>Thảm Taraflex 7.5mm</span>
              </div>
            </div>
            <div className="stat-divider"></div>

            <div className="stat-highlight">
              <span className="stat-big-number">24/7</span>
              <div className="stat-text-meta">
                <strong>Phục Vụ Xuyên Đêm</strong>
                <span>Đèn LED 500 Lux chống chói</span>
              </div>
            </div>
            <div className="stat-divider"></div>

            <div className="stat-highlight">
              <span className="stat-big-number">100%</span>
              <div className="stat-text-meta">
                <strong>Khử Khuẩn Giày UV</strong>
                <span>Sạch sẽ, thơm tho, tiệt trùng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
