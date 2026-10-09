import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Clock, Flame, Check, Lock, Filter, ZoomIn, ZoomOut, Sparkles, MapPin, Calendar, HelpCircle } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function CourtScheduleMatrix({
  courts,
  timeSlots,
  selectedSlots,
  slotStatusMap = {},
  onToggleSlot,
  selectedDate,
  filterPeriod,
  setFilterPeriod,
  selectedBranch,
  onClaimPassSlot,
  onProceedBooking
}) {
  const matrixRef = useRef(null);
  const [cellWidth, setCellWidth] = useState(72); // Default zoom cell width
  const [filterOnlyPass, setFilterOnlyPass] = useState(false);

  // Group courts in pairs: (Sân 1+2), (Sân 3+4), (Sân 5+6), (Sân 7)
  const courtBlocks = [];
  for (let i = 0; i < courts.length; i += 2) {
    if (i + 1 < courts.length) {
      courtBlocks.push([courts[i], courts[i + 1]]);
    } else {
      courtBlocks.push([courts[i]]);
    }
  }

  // Filter slots by period
  const filteredSlots = timeSlots.filter((slot) => {
    if (filterPeriod === 'morning') return slot.period === 'morning';
    if (filterPeriod === 'afternoon') return slot.period === 'afternoon';
    if (filterPeriod === 'evening') return slot.period === 'evening';
    if (filterPeriod === 'night') return slot.period === 'night';
    return true;
  });

  // GSAP animation on matrix render
  useGSAP(() => {
    gsap.from('.court-block-box', {
      opacity: 0,
      y: 16,
      duration: 0.35,
      stagger: 0.06,
      ease: 'power2.out'
    });
  }, { scope: matrixRef, dependencies: [selectedBranch?.code, selectedDate?.id] });

  const formatPriceK = (price) => `${Math.round(price / 1000)}k`;

  // Animate slot click with GSAP spring
  const handleCellClick = (court, slot, event) => {
    const el = event.currentTarget;
    gsap.fromTo(el, { scale: 0.88 }, { scale: 1, duration: 0.28, ease: 'back.out(2)' });
    onToggleSlot(court, slot);
  };

  return (
    <div className="ways-matrix-schedule-component" ref={matrixRef}>
      {/* 1. TOP TOOLBAR: ZOOM SLIDER & TIME FILTERS */}
      <div className="matrix-control-toolbar">
        <div className="toolbar-left-info">
          <Clock size={16} className="text-emerald" />
          <h3 className="toolbar-facility-title">
            Bảng Lịch Ma Trận {selectedBranch?.name || 'Ways Station'}
          </h3>
          <span className="toolbar-date-badge">
            {selectedDate.dayTitle} ({String(selectedDate.dayNumber).padStart(2, '0')}/{String(selectedDate.month).padStart(2, '0')})
          </span>
        </div>

        <div className="toolbar-right-actions">
          {/* Zoom Slider */}
          <div className="zoom-slider-box">
            <ZoomOut size={13} className="text-muted" />
            <input
              type="range"
              min="58"
              max="96"
              value={cellWidth}
              onChange={(e) => setCellWidth(Number(e.target.value))}
              className="zoom-range-input"
              title="Kéo để thu nhỏ / phóng to độ rộng ô giờ"
            />
            <ZoomIn size={13} className="text-muted" />
          </div>

          {/* Time Filters */}
          <div className="time-filter-pills">
            <button
              type="button"
              onClick={() => { setFilterPeriod('all'); setFilterOnlyPass(false); }}
              className={`filter-pill-btn ${filterPeriod === 'all' && !filterOnlyPass ? 'active' : ''}`}
            >
              Cả ngày ({timeSlots.length})
            </button>
            <button
              type="button"
              onClick={() => { setFilterPeriod('morning'); setFilterOnlyPass(false); }}
              className={`filter-pill-btn ${filterPeriod === 'morning' ? 'active' : ''}`}
            >
              Sáng (4h-12h)
            </button>
            <button
              type="button"
              onClick={() => { setFilterPeriod('afternoon'); setFilterOnlyPass(false); }}
              className={`filter-pill-btn ${filterPeriod === 'afternoon' ? 'active' : ''}`}
            >
              Chiều (12h-17h)
            </button>
            <button
              type="button"
              onClick={() => { setFilterPeriod('evening'); setFilterOnlyPass(false); }}
              className={`filter-pill-btn ${filterPeriod === 'evening' ? 'active' : ''}`}
            >
              Tối vàng 🔥
            </button>
            <button
              type="button"
              onClick={() => setFilterOnlyPass(!filterOnlyPass)}
              className={`filter-pill-btn pass-toggle ${filterOnlyPass ? 'active-purple' : ''}`}
            >
              <Flame size={12} className="text-purple" />
              <span>Cần Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. LEGEND ROW */}
      <div className="matrix-legend-strip">
        <div className="legend-item">
          <span className="legend-color-box box-white"></span>
          <span>Trống (70k / 120k)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box box-selected"></span>
          <span>Đang chọn</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box box-red"></span>
          <span>Đã có khách</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box box-purple"></span>
          <span className="text-purple font-bold">Cần Pass (Nhượng ca)</span>
        </div>
        <div className="legend-item">
          <Flame size={12} className="text-amber" />
          <span>Giờ vàng cao điểm (120k)</span>
        </div>
      </div>

      {/* 3. GROUPED BLOCKS MATRIX (Matching the exact Ways Station Layout) */}
      <div className="matrix-scroll-wrapper">
        <div className="matrix-blocks-list">
          {courtBlocks.map((pair, blockIdx) => (
            <div key={blockIdx} className="court-block-box">
              {/* Block Header: Sticky Corner + Time Slots Header */}
              <div className="block-header-track">
                <div className="block-sticky-corner">
                  <span className="block-group-tag">
                    {pair.length === 2 ? `${pair[0].name} + ${pair[1].name}` : pair[0].name}
                  </span>
                </div>

                <div className="block-time-slots-row">
                  {filteredSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="header-time-cell"
                      style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                    >
                      <span className="slot-time-text">{slot.displayLabel}</span>
                      {slot.isPeakHour && <Flame size={10} className="peak-icon text-amber" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Court Rows */}
              {pair.map((court) => (
                <div key={court.id} className="court-data-row-track">
                  {/* Sticky Court Title Cell */}
                  <div className="court-sticky-label">
                    <span className="branch-mini-code">CN {selectedBranch?.code || 'NVL'}</span>
                    <span className="court-main-name">{court.name}</span>
                    {court.isVip && <span className="vip-mini-tag">VIP</span>}
                  </div>

                  {/* Slot Cells */}
                  <div className="court-slots-row">
                    {filteredSlots.map((slot) => {
                      const slotKey = `${court.id}_${slot.id}`;
                      const statusInfo = slotStatusMap[slotKey];
                      const isBooked = statusInfo && statusInfo.status === 'BOOKED';
                      const isPassWanted = statusInfo && statusInfo.status === 'PASS_WANTED';
                      const isSelected = selectedSlots.some((s) => s.key === slotKey);
                      const isPeak = slot.isPeakHour;
                      const price = isPeak ? slot.peakPrice : slot.standardPrice;

                      // 1. Pass Wanted Cell
                      if (isPassWanted) {
                        return (
                          <div
                            key={slot.id}
                            className="slot-grid-cell-wrapper"
                            style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                          >
                            <button
                              type="button"
                              onClick={() => onClaimPassSlot({
                                key: slotKey,
                                courtId: court.id,
                                courtName: court.name,
                                slotId: slot.id,
                                time: slot.displayLabel,
                                price: statusInfo.price || price,
                                customerName: statusInfo.customerName,
                                passContact: statusInfo.passContact,
                                bookingDetailId: statusInfo.bookingDetailId
                              })}
                              className={`slot-box pass-box ${isSelected ? 'selected' : ''}`}
                              title={`Cần pass: ${statusInfo.customerName} (SĐT: ${statusInfo.passContact || 'Nhận ca'})`}
                            >
                              <span className="pass-pill-mini">PASS</span>
                              <span className="slot-price-txt text-purple">{formatPriceK(statusInfo.price || price)}</span>
                            </button>
                          </div>
                        );
                      }

                      // 2. Booked Cell
                      if (isBooked) {
                        return (
                          <div
                            key={slot.id}
                            className="slot-grid-cell-wrapper"
                            style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                          >
                            <div className="slot-box booked-box" title={`Đã đặt bởi: ${statusInfo.customerName || 'Khách'}`}>
                              <Lock size={10} className="lock-icon" />
                              <span className="booked-label">ĐÃ ĐẶT</span>
                            </div>
                          </div>
                        );
                      }

                      // 3. Available Cell
                      return (
                        <div
                          key={slot.id}
                          className="slot-grid-cell-wrapper"
                          style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleCellClick(court, { ...slot, price }, e)}
                            className={`slot-box avail-box ${isSelected ? 'selected' : ''} ${isPeak ? 'peak-box' : ''}`}
                            title={`Ca ${slot.displayLabel} - Giá: ${price.toLocaleString('vi-VN')} đ`}
                          >
                            <span className="slot-price-txt">{formatPriceK(price)}</span>
                            {isSelected ? (
                              <Check size={11} strokeWidth={3} className="check-icon" />
                            ) : (
                              <span className="avail-dot"></span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="matrix-instruction-bar">
        <span>💡 Nhấn giữ <strong>Shift</strong> và lăn chuột để cuộn ngang. Bấm ô màu tím để nhận lại ca cần pass.</span>
      </div>
    </div>
  );
}
