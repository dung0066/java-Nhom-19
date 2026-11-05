import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Clock, Check, Flame, Lock, Sparkles, AlertCircle } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function TimeSlotGrid({
  courts,
  activeCourtId,
  timeSlots,
  selectedSlots,
  onToggleSlot,
  selectedDate
}) {
  const gridContainerRef = useRef(null);

  const activeCourt = courts.find((c) => c.id === activeCourtId) || courts[0];

  useGSAP(() => {
    gsap.from('.slot-btn', {
      scale: 0.92,
      opacity: 0,
      duration: 0.35,
      stagger: 0.02,
      ease: 'power2.out'
    });
  }, { scope: gridContainerRef, dependencies: [activeCourtId, selectedDate.id] });

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSlotClick = (court, slot, isBooked, e) => {
    if (isBooked) return;

    // Trigger micro-bounce GSAP animation
    if (e?.currentTarget) {
      gsap.fromTo(
        e.currentTarget,
        { scale: 0.88 },
        { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }
      );
    }

    onToggleSlot(court, slot);
  };

  return (
    <div className="timeslot-section" ref={gridContainerRef}>
      {/* Legend and Section Bar */}
      <div className="timeslot-header">
        <div className="section-title-wrap">
          <Clock size={18} className="text-emerald" />
          <h2 className="section-title">Khung Giờ Đặt Chỗ ({activeCourt.name.split(' - ')[0]})</h2>
          <span className="date-hint">Ngày {selectedDate.dayName} ({String(selectedDate.dateNumber).padStart(2, '0')}/{String(selectedDate.month).padStart(2, '0')})</span>
        </div>

        {/* Legend */}
        <div className="slot-legends">
          <div className="legend-item">
            <span className="legend-box available"></span>
            <span>Còn trống</span>
          </div>
          <div className="legend-item">
            <span className="legend-box peak">
              <Flame size={10} className="text-orange" />
            </span>
            <span>Giờ vàng (17h-21h)</span>
          </div>
          <div className="legend-item">
            <span className="legend-box selected"></span>
            <span>Đang chọn</span>
          </div>
          <div className="legend-item">
            <span className="legend-box booked"></span>
            <span>Đã đặt</span>
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="slots-grid">
        {timeSlots.map((slot) => {
          const slotKey = `${activeCourt.id}_${slot.id}`;
          const isSelected = selectedSlots.some((s) => s.key === slotKey);
          const isBooked = activeCourt.bookedSlots.includes(slot.id);

          return (
            <button
              key={slot.id}
              type="button"
              disabled={isBooked}
              onClick={(e) => handleSlotClick(activeCourt, slot, isBooked, e)}
              className={`slot-btn ${
                isBooked
                  ? 'booked'
                  : isSelected
                  ? 'selected'
                  : slot.isPeak
                  ? 'peak'
                  : 'available'
              }`}
            >
              <div className="slot-top">
                <span className="slot-time-label">{slot.time}</span>
                {slot.isPeak && !isBooked && (
                  <span className="peak-badge" title="Khung giờ cao điểm">
                    <Flame size={11} />
                  </span>
                )}
                {isBooked && (
                  <span className="booked-badge" title="Đã có khách đặt">
                    <Lock size={11} />
                  </span>
                )}
                {isSelected && (
                  <span className="check-badge">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>

              <div className="slot-price-row">
                <span className="slot-price-val">
                  {formatVND(slot.price)}
                </span>
                <span className="slot-status-text">
                  {isBooked ? 'Hết chỗ' : isSelected ? 'Đã chọn' : 'Còn trống'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid-footer-note">
        <Sparkles size={14} className="text-emerald" />
        <span>Khách hàng đặt từ <strong>2 ca liên tiếp</strong> trở lên được giảm ngay 10% tổng hóa đơn!</span>
      </div>
    </div>
  );
}
