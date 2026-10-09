import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Trophy, CheckCircle2, ArrowRight, ShieldCheck, CalendarCheck, Users } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CourtPackages({ packages, onSelectPackage }) {
  const sectionRef = useRef(null);

  useGSAP(() => {
    gsap.from('.package-card', {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 85%',
        once: true
      },
      opacity: 0,
      y: 20,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power2.out'
    });
  }, { scope: sectionRef });

  return (
    <section className="court-packages-section" id="packages-section" ref={sectionRef}>
      <div className="section-pill">
        <Trophy size={13} className="text-amber" />
        <span>Quyền Lợi & Gói Thuê Sân</span>
      </div>
      <h2 className="section-main-title">Gói Thuê Sân Linh Hoạt & Cố Định Tháng</h2>
      <p className="section-desc">
        Đáp ứng mọi nhu cầu từ người chơi tự do, nhóm sinh hoạt cố định hàng tuần đến doanh nghiệp tổ chức giải giao lưu nội bộ.
      </p>

      <div className="packages-grid">
        {packages.map((pkg, idx) => (
          <div key={pkg.id} className={`package-card ${idx === 1 ? 'featured' : ''}`}>
            {idx === 1 && <div className="featured-banner">Được chọn nhiều nhất</div>}

            <div className="package-top">
              <span className="pkg-badge">{pkg.badge}</span>
              <h3 className="pkg-name">{pkg.name}</h3>
              <p className="pkg-desc">{pkg.desc}</p>
            </div>

            <div className="pkg-discount-tag">
              <span className="discount-highlight">{pkg.discount}</span>
            </div>

            <div className="pkg-benefits-list">
              {pkg.benefits.map((b, i) => (
                <div key={i} className="benefit-item">
                  <CheckCircle2 size={15} className="text-emerald" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <a
              href="#booking-section"
              className="pkg-action-btn"
              onClick={() => onSelectPackage?.(pkg)}
            >
              <span>{idx === 1 ? 'Đăng Ký Giữ Giờ Vàng' : idx === 2 ? 'Liên Hệ Báo Giá Giải' : 'Đặt Sân Ngay'}</span>
              <ArrowRight size={15} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
