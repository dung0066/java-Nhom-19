import React from 'react';
import { MapPin, Phone, ShieldCheck, Users, Clock, ArrowRight, Award } from 'lucide-react';

export default function BranchShowcase({ branches, selectedBranch, onSelectBranch, onNavigateBooking }) {
  const branchImages = {
    NVL: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop',
    DQII: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=600&auto=format&fit=crop',
    NQA: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop',
    HB: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop'
  };

  return (
    <section className="branches-showcase-section" id="branches-section">
      <div className="section-title-wrap">
        <div className="section-pill">
          <MapPin size={13} className="text-emerald" />
          <span>Hệ Thống Sân Toàn Thành Phố</span>
        </div>
        <h2 className="section-main-title">4 Chi Nhánh Tiêu Chuẩn Quốc Tế Ways Station</h2>
        <p className="section-desc">
          Tất cả chi nhánh đều sử dụng thảm thi đấu chính hãng, đèn LED chống chói 500 Lux, máy lạnh và tiện ích quầy nước, giặt giày UV.
        </p>
      </div>

      <div className="branches-cards-grid">
        {branches.map((b) => {
          const isCurrent = selectedBranch && selectedBranch.code === b.code;
          const bgImg = branchImages[b.code] || branchImages.NVL;

          return (
            <div
              key={b.id || b.code}
              className={`branch-card ${isCurrent ? 'active-branch' : ''}`}
            >
              <div
                className="branch-card-media"
                style={{ backgroundImage: `linear-gradient(to top, rgba(10, 15, 29, 0.95), rgba(10, 15, 29, 0.2)), url('${bgImg}')` }}
              >
                <div className="branch-top-tags">
                  <span className="branch-code-badge">{b.code}</span>
                  <span className="branch-courts-count">{b.totalCourts || b.courtsCount || 6} Sân thi đấu</span>
                </div>
                <h3 className="branch-card-name">{b.name}</h3>
              </div>

              <div className="branch-card-body">
                <div className="branch-info-line">
                  <MapPin size={15} className="text-emerald shrink-0" />
                  <span>{b.address}</span>
                </div>
                <div className="branch-info-line">
                  <Clock size={15} className="text-amber shrink-0" />
                  <span>{b.openHours || '05:00 - 00:00 (Mở cửa 24/7)'}</span>
                </div>
                <div className="branch-info-line">
                  <Phone size={15} className="text-cyan shrink-0" />
                  <span>Hotline: <strong>{b.phone || '0889 555 559'}</strong></span>
                </div>

                <div className="branch-facilities-list">
                  {(b.facilities || ['Thảm BWF 7.5mm', 'Đèn LED 500 Lux', 'Giặt giày UV']).map((fac, idx) => (
                    <span key={idx} className="facility-pill">
                      <ShieldCheck size={11} className="text-emerald" />
                      {fac}
                    </span>
                  ))}
                </div>

                <div className="branch-card-actions">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBranch(b);
                      if (onNavigateBooking) onNavigateBooking();
                    }}
                    className={`btn-branch-choose ${isCurrent ? 'btn-selected' : ''}`}
                  >
                    <span>{isCurrent ? 'Đang chọn chi nhánh này' : 'Đặt sân tại chi nhánh này'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
