import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import MembershipModal from '../components/home/MembershipModal';
import '../styles/home.css';

export default function HomePage({ onNavigate }) {
  const { language, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

  const slides = [
    {
      id: 'booking',
      tabTitle: t.slide1.tabTitle,
      tabTag: t.slide1.tabTag,
      tabIcon: 'fa-solid fa-medal',
      badge: t.slide1.badge,
      title: t.slide1.title,
      desc: t.slide1.desc,
      bg: "linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1600&auto=format&fit=crop')",
      buttons: [
        {
          label: t.slide1.btnPrimary,
          className: 'btn-action-primary',
          icon: 'fa-solid fa-bolt',
          action: () => onNavigate('booking')
        },
        {
          label: t.slide1.btnSecondary,
          className: 'btn-action-gold',
          icon: 'fa-solid fa-tags',
          href: '#pricingSection'
        }
      ]
    },
    {
      id: 'services',
      tabTitle: t.slide2.tabTitle,
      tabTag: t.slide2.tabTag,
      tabIcon: 'fa-solid fa-wand-magic-sparkles',
      badge: t.slide2.badge,
      title: t.slide2.title,
      desc: t.slide2.desc,
      bg: "linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=1600&auto=format&fit=crop')",
      buttons: [
        {
          label: t.slide2.btnPrimary,
          className: 'btn-action-primary',
          icon: 'fa-solid fa-wand-magic-sparkles',
          action: () => onNavigate('booking')
        },
        {
          label: t.slide2.btnSecondary,
          className: 'btn-action-white',
          icon: 'fa-solid fa-sliders',
          href: '#pricingSection'
        }
      ]
    },
    {
      id: 'branches',
      tabTitle: t.slide3.tabTitle,
      tabTag: t.slide3.tabTag,
      tabIcon: 'fa-solid fa-location-dot',
      badge: t.slide3.badge,
      title: t.slide3.title,
      desc: t.slide3.desc,
      bg: "linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop')",
      buttons: [
        {
          label: t.slide3.btnPrimary,
          className: 'btn-action-blue',
          icon: 'fa-solid fa-location-dot',
          href: '#branchesSection'
        },
        {
          label: t.slide3.btnSecondary,
          className: 'btn-action-white',
          icon: 'fa-solid fa-table-cells',
          action: () => onNavigate('booking')
        }
      ]
    },
    {
      id: 'membership',
      tabTitle: t.slide4.tabTitle,
      tabTag: t.slide4.tabTag,
      tabIcon: 'fa-solid fa-crown',
      badge: t.slide4.badge,
      title: t.slide4.title,
      desc: t.slide4.desc,
      bg: "linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop')",
      buttons: [
        {
          label: t.slide4.btnPrimary,
          className: 'btn-action-gold',
          icon: 'fa-solid fa-crown',
          action: () => setIsMembershipModalOpen(true)
        },
        {
          label: t.slide4.btnSecondary,
          className: 'btn-action-white',
          icon: 'fa-solid fa-gift',
          href: '#pricingSection'
        }
      ]
    },
    {
      id: 'support',
      tabTitle: t.slide5.tabTitle,
      tabTag: t.slide5.tabTag,
      tabIcon: 'fa-solid fa-headset',
      badge: t.slide5.badge,
      title: t.slide5.title,
      desc: t.slide5.desc,
      bg: "linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1600&auto=format&fit=crop')",
      buttons: [
        {
          label: t.slide5.btnPrimary,
          className: 'btn-action-emerald',
          icon: 'fa-solid fa-phone-volume',
          href: 'tel:0889555559'
        },
        {
          label: t.slide5.btnSecondary,
          className: 'btn-action-white',
          icon: 'fa-solid fa-comments',
          action: () => window.open('https://zalo.me/0889555559', '_blank')
        }
      ]
    }
  ];

  const carouselContainerRef = useRef(null);
  const progressBarRef = useRef(null);
  const timelineRef = useRef(null);
  const timerTweenRef = useRef(null);
  const isHoveredRef = useRef(false);
  const prevSlideRef = useRef(0);
  const tabsContainerRef = useRef(null);
  const slidingPillRef = useRef(null);

  // 7.5 seconds duration for comfortable reading of rich slide content
  const SLIDE_DURATION = 7.5;

  const handleNextSlide = () => {
    if (timerTweenRef.current) timerTweenRef.current.kill();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    if (timerTweenRef.current) timerTweenRef.current.kill();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSelectSlide = (idx) => {
    if (idx === currentSlide) return;
    if (timerTweenRef.current) timerTweenRef.current.kill();
    setCurrentSlide(idx);
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (timerTweenRef.current) {
      timerTweenRef.current.pause();
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (timerTweenRef.current) {
      timerTweenRef.current.play();
    }
  };

  // Start or reset slide timer with visual GSAP progress bar
  const startSlideTimer = () => {
    if (timerTweenRef.current) {
      timerTweenRef.current.kill();
    }
    if (progressBarRef.current) {
      gsap.set(progressBarRef.current, { width: '0%' });
      timerTweenRef.current = gsap.to(progressBarRef.current, {
        width: '100%',
        duration: SLIDE_DURATION,
        ease: 'none',
        onComplete: () => {
          handleNextSlide();
        }
      });
      if (isHoveredRef.current) {
        timerTweenRef.current.pause();
      }
    }
  };

  // GSAP: Animate the bottom dock sliding indicator pill
  useEffect(() => {
    if (!tabsContainerRef.current || !slidingPillRef.current) return;
    const tabBtns = tabsContainerRef.current.querySelectorAll('.carousel-tab-btn');
    const activeBtn = tabBtns[currentSlide];
    if (activeBtn) {
      gsap.to(slidingPillRef.current, {
        x: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
        duration: 0.38,
        ease: 'back.out(1.4)'
      });
    }
  }, [currentSlide]);

  // GSAP: Distinct, Unique Choreography for Each of the 5 Slides
  useEffect(() => {
    const container = carouselContainerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // 1. Kill any active timeline immediately to avoid collision
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const slidesEls = container.querySelectorAll('.carousel-slide');
      const activeSlideEl = slidesEls[currentSlide];
      const prevIdx = prevSlideRef.current;
      const prevSlideEl = prevIdx !== currentSlide ? slidesEls[prevIdx] : null;
      prevSlideRef.current = currentSlide;

      if (!activeSlideEl) return;

      // 2. Kill stray tweens on all slides and hide non-participating slides
      slidesEls.forEach((slideEl, idx) => {
        if (idx !== currentSlide && idx !== prevIdx) {
          gsap.killTweensOf(slideEl);
          gsap.set(slideEl, { autoAlpha: 0, zIndex: 1 });
        }
      });

      const currentBg = activeSlideEl.querySelector('.slide-bg');
      const badge = activeSlideEl.querySelector('.badge-pill');
      const title = activeSlideEl.querySelector('h2');
      const desc = activeSlideEl.querySelector('p');
      const btns = activeSlideEl.querySelectorAll('.slide-btns button, .slide-btns a');

      // Bring active slide on top
      gsap.set(activeSlideEl, { zIndex: 3 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          // Slide entrance finished, start the countdown timer with visible progress
          startSlideTimer();
        }
      });
      timelineRef.current = tl;

      // Smooth cross-fade: fade out previous slide
      if (prevSlideEl) {
        gsap.set(prevSlideEl, { zIndex: 2 });
        tl.to(prevSlideEl, { autoAlpha: 0, duration: 0.45, ease: 'power1.inOut' }, 0);
      }

      // ========================================================
      // 5 DISTINCT, CUSTOM ANIMATION SIGNATURES PER SLIDE THEME
      // ========================================================
      if (currentSlide === 0) {
        // 🏸 SLIDE 1: KINETIC POWER SMASH (Velocity zoom, bouncy badge drop, elastic buttons)
        tl.fromTo(activeSlideEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0);
        if (currentBg) {
          tl.fromTo(currentBg, { scale: 1.18, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0);
        }
        if (badge) {
          tl.fromTo(badge, { autoAlpha: 0, y: -45, scale: 0.75 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: 'bounce.out' }, 0.08);
        }
        if (title) {
          tl.fromTo(title, { autoAlpha: 0, y: 35, skewX: -6 }, { autoAlpha: 1, y: 0, skewX: 0, duration: 0.5, ease: 'power3.out' }, 0.15);
        }
        if (desc) {
          tl.fromTo(desc, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.22);
        }
        if (btns?.length) {
          tl.fromTo(btns, { autoAlpha: 0, scale: 0.7, y: 25 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.12, ease: 'back.out(2)', clearProps: 'transform' }, 0.28);
        }
      } else if (currentSlide === 1) {
        // ⚡ SLIDE 2: HORIZONTAL SPLIT WAVE (Cinematic pan from right, left-sliding badge and cards)
        tl.fromTo(activeSlideEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0);
        if (currentBg) {
          tl.fromTo(currentBg, { x: 80, scale: 1.06, opacity: 0.7 }, { x: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' }, 0);
        }
        if (badge) {
          tl.fromTo(badge, { autoAlpha: 0, x: -70 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power3.out' }, 0.08);
        }
        if (title) {
          tl.fromTo(title, { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0.14);
        }
        if (desc) {
          tl.fromTo(desc, { autoAlpha: 0, x: -35 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power3.out' }, 0.2);
        }
        if (btns?.length) {
          tl.fromTo(btns, { autoAlpha: 0, x: 50, scale: 0.9 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', clearProps: 'transform' }, 0.26);
        }
      } else if (currentSlide === 2) {
        // 📍 SLIDE 3: 3D DEPTH CARD PERSPECTIVE & SATELLITE ZOOM (Perspective tilt & letter-spread reveal)
        tl.fromTo(activeSlideEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0);
        if (currentBg) {
          tl.fromTo(currentBg, { scale: 0.92, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.95, ease: 'power2.out' }, 0);
        }
        if (badge) {
          tl.fromTo(badge, { autoAlpha: 0, rotationX: -60, y: -20 }, { autoAlpha: 1, rotationX: 0, y: 0, duration: 0.5, ease: 'back.out(1.6)' }, 0.08);
        }
        if (title) {
          tl.fromTo(title, { autoAlpha: 0, scale: 0.92, y: 30 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.52, ease: 'power3.out' }, 0.15);
        }
        if (desc) {
          tl.fromTo(desc, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.22);
        }
        if (btns?.length) {
          tl.fromTo(btns, { autoAlpha: 0, rotationY: 25, y: 25 }, { autoAlpha: 1, rotationY: 0, y: 0, duration: 0.5, stagger: 0.12, ease: 'back.out(1.4)', clearProps: 'transform' }, 0.28);
        }
      } else if (currentSlide === 3) {
        // 👑 SLIDE 4: GOLDEN LUXURY CURTAIN & VIP FLOATING AURA (Smooth regal ease + golden glow entrance)
        tl.fromTo(activeSlideEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55 }, 0);
        if (currentBg) {
          tl.fromTo(currentBg, { scale: 1.1, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'power4.out' }, 0);
        }
        if (badge) {
          tl.fromTo(badge, { autoAlpha: 0, scale: 0.8, y: -30 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.1);
        }
        if (title) {
          tl.fromTo(title, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power4.out' }, 0.18);
        }
        if (desc) {
          tl.fromTo(desc, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.26);
        }
        if (btns?.length) {
          tl.fromTo(btns, { autoAlpha: 0, scale: 0.85, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.14, ease: 'back.out(1.3)', clearProps: 'transform' }, 0.32);
        }
      } else {
        // 📞 SLIDE 5: TECH SIGNAL PULSE & QUICK POP-IN (Radar beacon pulse + snappy action entrance)
        tl.fromTo(activeSlideEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0);
        if (currentBg) {
          tl.fromTo(currentBg, { scale: 1.08, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.75, ease: 'power2.out' }, 0);
        }
        if (badge) {
          tl.fromTo(badge, { autoAlpha: 0, scale: 1.25, y: -15 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.42, ease: 'back.out(2)' }, 0.05);
        }
        if (title) {
          tl.fromTo(title, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 0.12);
        }
        if (desc) {
          tl.fromTo(desc, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.18);
        }
        if (btns?.length) {
          tl.fromTo(btns, { autoAlpha: 0, y: 28, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.1, ease: 'back.out(1.6)', clearProps: 'transform' }, 0.24);
        }
      }
    }, carouselContainerRef);

    return () => {
      if (timerTweenRef.current) {
        timerTweenRef.current.kill();
      }
      ctx.revert();
    };
  }, [currentSlide]);

  return (
    <div className="ways-home-page-root theme-white">
      {/* 1. TOP TICKER RUNNING BAR */}
      <div className="top-ticker-bar">
        <div className="ticker-content">
          <span>
            <i className="fa-solid fa-fire"></i> {t.ticker1}
          </span>
          <span>
            <i className="fa-solid fa-bolt"></i> {t.ticker2}
          </span>
          <span>
            <i className="fa-solid fa-phone-volume"></i> {t.ticker3}
          </span>
        </div>
      </div>

      {/* 2. HERO SLIDER BANNER WITH DEDICATED SLIDE BUTTONS & GSAP TIMELINE */}
      <section
        className="hero-carousel-section"
        style={{ minHeight: '540px', position: 'relative' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Dynamic GSAP Visual Progress Bar */}
        <div className="carousel-timer-progress-wrap">
          <div className="carousel-timer-progress-bar" ref={progressBarRef}></div>
        </div>

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

              <div className="slide-caption">
                <span className="badge-pill">
                  <i className="fa-solid fa-sparkles"></i> {slide.badge}
                </span>

                <h2>{slide.title}</h2>
                <p>{slide.desc}</p>

                {/* DEDICATED BUTTONS FOR EACH SLIDE */}
                <div className="slide-btns">
                  {slide.buttons.map((btn, bIdx) => {
                    if (btn.href) {
                      return (
                        <a
                          key={bIdx}
                          href={btn.href}
                          className={btn.className}
                        >
                          <i className={btn.icon}></i> {btn.label}
                        </a>
                      );
                    }

                    return (
                      <button
                        key={bIdx}
                        type="button"
                        className={btn.className}
                        onClick={btn.action}
                      >
                        <i className={btn.icon}></i> {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrow Nav Buttons */}
        <div className="carousel-nav-arrows">
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handlePrevSlide}
            title="Slide trước"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handleNextSlide}
            title="Slide tiếp theo"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        {/* ELITE GLASSMORPHISM SEGMENTED DECK DOCK */}
        <div className="hero-carousel-tabs" ref={tabsContainerRef}>
          {/* Animated GSAP Sliding Pill Indicator */}
          <div
            className={`carousel-tabs-sliding-pill pill-theme-${slides[currentSlide]?.id}`}
            ref={slidingPillRef}
          ></div>

          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              className={`carousel-tab-btn ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => handleSelectSlide(idx)}
            >
              <div className="tab-btn-content">
                <i className={slide.tabIcon}></i>
                <div className="tab-btn-text">
                  <strong className="tab-btn-title">{slide.tabTitle}</strong>
                  <span className="tab-btn-tag">{slide.tabTag}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. QUICK BOOKING CTA BAR */}
      <section className="quick-cta-bar">
        <div className="container-white">
          <div className="cta-inner-card">
            <div className="cta-text">
              <h3>
                <i className="fa-solid fa-calendar-check"></i> {t.quickCta.title}
              </h3>
              <p>
                {t.quickCta.desc}
              </p>
            </div>
            <div className="cta-button-wrap">
              <button
                type="button"
                className="btn-cta-big"
                onClick={() => onNavigate('booking')}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                {t.quickCta.btn} <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CHO THUÊ VỢT CẦU LÔNG */}
      <section className="section-product-rental" id="racquetsSection">
        <div className="container-white">
          <div className="section-title-wrap">
            <span className="tag-label">{t.sections.racquetTag}</span>
            <h2 className="title-main">{t.sections.racquetTitle}</h2>
            <p className="title-sub">
              {t.sections.racquetSub}
            </p>
          </div>

          <div className="products-grid">
            <div className="product-card">
              <div className="product-badge hot">HOT NHẤT</div>
              <div className="product-img-box">
                <img
                  src="https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=600&auto=format&fit=crop"
                  alt="Yonex Astrox 88D Pro"
                  className="product-thumb"
                />
              </div>
              <div className="product-content">
                <div className="brand-tag">YONEX JAPAN</div>
                <h3 className="product-name">Yonex Astrox 88D Pro / 100ZZ</h3>
                <p className="product-desc">
                  Dòng vợt tấn công đỉnh cao, thân cứng trợ lực smash cực mạnh. Căng sẵn cước BG65Ti (11kg).
                </p>
                <div className="product-specs">
                  <span>
                    <i className="fa-solid fa-weight-scale"></i> Trọng lượng: 4U/G5
                  </span>
                  <span>
                    <i className="fa-solid fa-certificate"></i> Lực căng: 11.0 kg
                  </span>
                </div>
                <div className="product-price-box">
                  <div>
                    <span className="price-number">30.000 đ</span>
                    <span className="price-period">/ buổi chơi</span>
                  </div>
                  <button
                    type="button"
                    className="btn-rent-now"
                    onClick={() => onNavigate('booking')}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    Thuê Sân Kèm Vợt
                  </button>
                </div>
              </div>
            </div>

            <div className="product-card">
              <div className="product-badge vip">VIP ATTACK</div>
              <div className="product-img-box">
                <img
                  src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop"
                  alt="Victor Thruster Ryuga"
                  className="product-thumb"
                />
              </div>
              <div className="product-content">
                <div className="brand-tag">VICTOR TAIWAN</div>
                <h3 className="product-name">Victor Thruster Ryuga / Falcon</h3>
                <p className="product-desc">
                  Vũ khí tấn công uy lực với công nghệ HME, cảm giác cầu thoát tay và đầm đầu. Cước VBS66N (10.8kg).
                </p>
                <div className="product-specs">
                  <span>
                    <i className="fa-solid fa-weight-scale"></i> Trọng lượng: 4U/G5
                  </span>
                  <span>
                    <i className="fa-solid fa-certificate"></i> Lực căng: 10.8 kg
                  </span>
                </div>
                <div className="product-price-box">
                  <div>
                    <span className="price-number">25.000 đ</span>
                    <span className="price-period">/ buổi chơi</span>
                  </div>
                  <button
                    type="button"
                    className="btn-rent-now"
                    onClick={() => onNavigate('booking')}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    Thuê Sân Kèm Vợt
                  </button>
                </div>
              </div>
            </div>

            <div className="product-card">
              <div className="product-badge allround">TOÀN DIỆN</div>
              <div className="product-img-box">
                <img
                  src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop"
                  alt="Lining Axforce 80"
                  className="product-thumb"
                />
              </div>
              <div className="product-content">
                <div className="brand-tag">LINING OFFICIAL</div>
                <h3 className="product-name">Lining Axforce 80 / Halbertec</h3>
                <p className="product-desc">
                  Kiểm soát cầu tinh tế, thủ cầu linh hoạt và phản tạt sắc bén. Căng cước Lining N65 cao cấp.
                </p>
                <div className="product-specs">
                  <span>
                    <i className="fa-solid fa-weight-scale"></i> Trọng lượng: 4U/G5
                  </span>
                  <span>
                    <i className="fa-solid fa-certificate"></i> Lực căng: 10.5 kg
                  </span>
                </div>
                <div className="product-price-box">
                  <div>
                    <span className="price-number">25.000 đ</span>
                    <span className="price-period">/ buổi chơi</span>
                  </div>
                  <button
                    type="button"
                    className="btn-rent-now"
                    onClick={() => onNavigate('booking')}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    Thuê Sân Kèm Vợt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CHO THUÊ GIÀY & PHỤ KIỆN */}
      <section className="section-product-rental bg-light" id="shoesSection">
        <div className="container-white">
          <div className="section-title-wrap">
            <span className="tag-label">{t.sections.shoesTag}</span>
            <h2 className="title-main">{t.sections.shoesTitle}</h2>
            <p className="title-sub">
              {t.sections.shoesSub}
            </p>
          </div>

          <div className="products-grid">
            <div className="product-card">
              <div className="product-badge hot">ĐỆM KHÍ ÊM</div>
              <div className="product-img-box">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"
                  alt="Giày Yonex Power Cushion"
                  className="product-thumb"
                />
              </div>
              <div className="product-content">
                <div className="brand-tag">YONEX POWER CUSHION</div>
                <h3 className="product-name">Giày Cầu Lông Yonex 65Z3 / Eclipsion</h3>
                <p className="product-desc">
                  Công nghệ đệm Power Cushion hấp thụ chấn động tối đa, chống lật cổ chân và bám sàn cực tốt.
                </p>
                <div className="product-specs">
                  <span>
                    <i className="fa-solid fa-ruler"></i> Size: 37, 38, 39, 40, 41, 42, 43, 44
                  </span>
                  <span>
                    <i className="fa-solid fa-shield-virus"></i> Khử khuẩn UV 100%
                  </span>
                </div>
                <div className="product-price-box">
                  <div>
                    <span className="price-number">25.000 đ</span>
                    <span className="price-period">/ buổi chơi</span>
                  </div>
                  <button
                    type="button"
                    className="btn-rent-now"
                    onClick={() => onNavigate('booking')}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    Thuê Kèm Giày
                  </button>
                </div>
              </div>
            </div>

            <div className="product-card">
              <div className="product-badge vip">BÁM SÀN TỐT</div>
              <div className="product-img-box">
                <img
                  src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop"
                  alt="Giày Mizuno Wave Claw Pro"
                  className="product-thumb"
                />
              </div>
              <div className="product-content">
                <div className="brand-tag">MIZUNO JAPAN</div>
                <h3 className="product-name">Giày Mizuno Wave Claw Pro</h3>
                <p className="product-desc">
                  Đế sóng Wave độc quyền phân tán lực tiếp đất, form giày vừa vặn cho bàn chân người châu Á.
                </p>
                <div className="product-specs">
                  <span>
                    <i className="fa-solid fa-ruler"></i> Size: 38, 39, 40, 41, 42, 43
                  </span>
                  <span>
                    <i className="fa-solid fa-shield-virus"></i> Khử mùi Nano Bạc
                  </span>
                </div>
                <div className="product-price-box">
                  <div>
                    <span className="price-number">20.000 đ</span>
                    <span className="price-period">/ buổi chơi</span>
                  </div>
                  <button
                    type="button"
                    className="btn-rent-now"
                    onClick={() => onNavigate('booking')}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    Thuê Kèm Giày
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 4 CHI NHÁNH */}
      <section className="section-branches-showcase" id="branchesSection">
        <div className="container-white">
          <div className="section-title-wrap">
            <span className="tag-label">{t.sections.branchesTag}</span>
            <h2 className="title-main">{t.sections.branchesTitle}</h2>
            <p className="title-sub">
              {t.sections.branchesSub}
            </p>
          </div>

          <div className="branches-cards-grid">
            <div className="branch-item-card">
              <div className="branch-img-header bg-nvl">
                <span className="court-count-tag">7 Sân Chuẩn BWF</span>
              </div>
              <div className="branch-item-info">
                <h3>Ways Station NVL</h3>
                <p className="addr">
                  <i className="fa-solid fa-location-dot"></i> 70 Nguyễn Văn Lượng, P. 10, Q. Gò Vấp
                </p>
                <p className="tel">
                  <i className="fa-solid fa-phone"></i> Hotline: 0889555559
                </p>
                <button
                  type="button"
                  className="btn-choose-branch"
                  onClick={() => onNavigate('booking')}
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  {t.sections.directions} <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <div className="branch-item-card">
              <div className="branch-img-header bg-dqh">
                <span className="court-count-tag">4 Sân VIP</span>
              </div>
              <div className="branch-item-info">
                <h3>Ways Station DQH</h3>
                <p className="addr">
                  <i className="fa-solid fa-location-dot"></i> 262 Dương Quảng Hàm, Q. Gò Vấp
                </p>
                <p className="tel">
                  <i className="fa-solid fa-phone"></i> Hotline: 0889555559
                </p>
                <button
                  type="button"
                  className="btn-choose-branch"
                  onClick={() => onNavigate('booking')}
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  {t.sections.directions} <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <div className="branch-item-card">
              <div className="branch-img-header bg-nqa">
                <span className="court-count-tag">6 Sân BWF</span>
              </div>
              <div className="branch-item-info">
                <h3>Ways Station NQA</h3>
                <p className="addr">
                  <i className="fa-solid fa-location-dot"></i> 86 Nguyễn Quý Anh, Q. Tân Phú
                </p>
                <p className="tel">
                  <i className="fa-solid fa-phone"></i> Hotline: 0889555559
                </p>
                <button
                  type="button"
                  className="btn-choose-branch"
                  onClick={() => onNavigate('booking')}
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  {t.sections.directions} <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <div className="branch-item-card">
              <div className="branch-img-header bg-hb">
                <span className="court-count-tag">2 Sân Riêng Tư</span>
              </div>
              <div className="branch-item-info">
                <h3>Ways Station HB</h3>
                <p className="addr">
                  <i className="fa-solid fa-location-dot"></i> 135 Hiệp Bình, TP. Thủ Đức
                </p>
                <p className="tel">
                  <i className="fa-solid fa-phone"></i> Hotline: 0889555559
                </p>
                <button
                  type="button"
                  className="btn-choose-branch"
                  onClick={() => onNavigate('booking')}
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  {t.sections.directions} <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BẢNG GIÁ NIÊM YẾT */}
      <section className="section-price-table" id="pricingSection">
        <div className="container-white">
          <div className="section-title-wrap">
            <span className="tag-label">{t.sections.priceTag}</span>
            <h2 className="title-main">{t.sections.priceTitle}</h2>
            <p className="title-sub">{t.sections.priceSub}</p>
          </div>

          <div className="pricing-flex-container">
            <div className="price-box-card">
              <div className="price-box-top">
                <h3>Giờ Thường (Off-Peak)</h3>
                <p>00:00 - 17:00</p>
              </div>
              <div className="price-figure">
                <span className="val">70.000</span>
                <span className="unit">đ / giờ</span>
              </div>
              <ul className="benefit-list">
                <li>
                  <i className="fa-solid fa-circle-check"></i> Khung giờ: <strong>00:00 - 17:00</strong>
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i> Sân vắng, không gian thoáng đãng
                </li>
              </ul>
              <button
                type="button"
                className="btn-book-plan"
                onClick={() => onNavigate('booking')}
                style={{ border: 'none', cursor: 'pointer', width: '100%' }}
              >
                {t.sections.viewCart}
              </button>
            </div>

            <div className="price-box-card highlight">
              <div className="price-box-top">
                <span className="badge-highlight">HOT</span>
                <h3>Giờ Vàng (Peak Hours)</h3>
                <p>17:00 - 22:00</p>
              </div>
              <div className="price-figure">
                <span className="val">120.000</span>
                <span className="unit">đ / giờ</span>
              </div>
              <ul className="benefit-list">
                <li>
                  <i className="fa-solid fa-circle-check"></i> Khung giờ: <strong>17:00 - 22:00</strong>
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i> Bật full hệ thống đèn LED cao cấp
                </li>
              </ul>
              <button
                type="button"
                className="btn-book-plan highlight"
                onClick={() => onNavigate('booking')}
                style={{ border: 'none', cursor: 'pointer', width: '100%' }}
              >
                {t.sections.viewCart}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. VIP MEMBERSHIP MODAL */}
      <MembershipModal
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
      />

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, color: '#ffffff', fontSize: '18px' }}>
          {t.footer.aboutTitle}
        </p>
        <p style={{ marginTop: '8px', fontSize: '14px', maxWidth: '720px', margin: '8px auto 0' }}>
          {t.footer.aboutDesc}
        </p>
        <p style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
          {t.footer.copyright}
        </p>
      </footer>
    </div>
  );
}
