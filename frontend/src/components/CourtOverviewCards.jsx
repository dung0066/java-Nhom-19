import React from 'react';
import { Award, ShieldCheck, Wind, Zap, CheckCircle2 } from 'lucide-react';

export default function CourtOverviewCards({ courts, onSelectCourtForSlots, activeCourtId }) {
  return (
    <div className="courts-overview-grid">
      {courts.map((court) => {
        const isActive = court.id === activeCourtId;
        const availableCount = 17 - court.bookedSlots.length;

        return (
          <div
            key={court.id}
            onClick={() => onSelectCourtForSlots(court.id)}
            className={`court-card-item ${isActive ? 'active' : ''} ${court.isVip ? 'vip-card' : ''}`}
          >
            {/* Court Mini Diagram */}
            <div className="court-card-header">
              <div className="court-badge-code">
                <span>{court.code}</span>
                {court.isVip && <span className="vip-tag">VIP</span>}
              </div>
              <span className={`status-pill ${court.currentStatus}`}>
                {court.currentStatus === 'playing' ? 'Đang có trận' : 'Sẵn sàng'}
              </span>
            </div>

            <h4 className="court-card-name">{court.name}</h4>
            <div className="court-card-type">{court.type}</div>

            {/* Visual Badminton Court Mini Canvas */}
            <div className="court-mini-diagram">
              <svg viewBox="0 0 200 110" className="mini-court-svg">
                <rect x="0" y="0" width="200" height="110" rx="6" fill="#064E3B" />
                <rect x="10" y="8" width="180" height="94" rx="4" fill="#047857" stroke="#FFFFFF" strokeWidth="1.5" />
                {/* Singles inner line */}
                <line x1="10" y1="18" x2="190" y2="18" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.8" />
                <line x1="10" y1="92" x2="190" y2="92" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.8" />
                {/* Short service lines */}
                <line x1="75" y1="8" x2="75" y2="102" stroke="#FFFFFF" strokeWidth="1.2" />
                <line x1="125" y1="8" x2="125" y2="102" stroke="#FFFFFF" strokeWidth="1.2" />
                {/* Net in center */}
                <line x1="100" y1="5" x2="100" y2="105" stroke="#FFFFFF" strokeWidth="2.5" />
                {/* Center line */}
                <line x1="10" y1="55" x2="75" y2="55" stroke="#FFFFFF" strokeWidth="1" />
                <line x1="125" y1="55" x2="190" y2="55" stroke="#FFFFFF" strokeWidth="1" />
              </svg>
            </div>

            <div className="court-specs-list">
              <div className="spec-row">
                <ShieldCheck size={13} className="text-emerald" />
                <span>{court.surface}</span>
              </div>
              <div className="spec-row">
                <Wind size={13} className="text-muted" />
                <span>Trần 9.2m chuẩn BWF</span>
              </div>
            </div>

            <div className="court-card-footer">
              <span className="avail-slots-text">Còn {availableCount} ca trống hôm nay</span>
              <span className="select-btn-text">
                {isActive ? 'Đang xem lịch' : 'Chọn xem lịch'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
