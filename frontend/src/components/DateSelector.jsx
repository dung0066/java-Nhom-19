import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Calendar, ChevronRight } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function DateSelector({ selectedDate, setSelectedDate }) {
  const containerRef = useRef(null);

  const days = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    const dayOfWeek = d.getDay();
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const shortNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    return {
      dateObj: d,
      id: d.toISOString().split('T')[0],
      dayTitle: index === 0 ? 'Hôm nay' : index === 1 ? 'Ngày mai' : dayNames[dayOfWeek],
      dayShort: shortNames[dayOfWeek],
      dayNumber: d.getDate(),
      month: d.getMonth() + 1,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      slotsLeft: 18 + ((index * 4) % 12)
    };
  });

  useGSAP(() => {
    gsap.from('.date-tab-item', {
      opacity: 0,
      y: 6,
      duration: 0.3,
      stagger: 0.03,
      ease: 'power2.out'
    });
  }, { scope: containerRef });

  return (
    <div className="date-selection-panel" ref={containerRef}>
      <div className="date-header-row">
        <div className="panel-title-group">
          <Calendar size={16} className="text-emerald" />
          <span className="panel-title">Chọn Ngày Đặt Sân</span>
        </div>
        <span className="panel-subtitle">
          Lịch hiển thị theo thời gian thực (7 ngày tới)
        </span>
      </div>

      <div className="date-tabs-grid">
        {days.map((item) => {
          const isSelected = selectedDate.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedDate(item)}
              className={`date-tab-item ${isSelected ? 'active' : ''} ${item.isWeekend ? 'weekend' : ''}`}
            >
              <div className="tab-day-title">{item.dayTitle}</div>
              <div className="tab-date-num">
                {String(item.dayNumber).padStart(2, '0')}/{String(item.month).padStart(2, '0')}
              </div>
              <div className="tab-slot-count">
                {item.slotsLeft} ca trống
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
