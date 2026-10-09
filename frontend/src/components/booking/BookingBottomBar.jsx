import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function BookingBottomBar({ selectedSlots, onNext }) {
  const barRef = useRef(null);

  const hours = selectedSlots.length;
  const totalPrice = selectedSlots.reduce((sum, s) => sum + (s.slot?.price || 0), 0);

  useEffect(() => {
    if (barRef.current && hours > 0) {
      gsap.fromTo(
        barRef.current,
        { y: 50, opacity: 0.8 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [hours]);

  return (
    <footer className="bottom-bar-fixed" ref={barRef}>
      <div className="bottom-status-row">
        <span className="bottom-selected-text">
          <i className="fa-solid fa-clock"></i> Đang chọn: <strong>{hours}h00</strong> ({selectedSlots.length} ca sân)
        </span>
        <span className="bottom-total-text">
          Tạm tính: <strong>{totalPrice.toLocaleString('vi-VN')} đ</strong>
        </span>
      </div>
      <button
        type="button"
        className={`btn-bottom-submit ${hours > 0 ? 'active' : ''}`}
        disabled={hours === 0}
        onClick={onNext}
      >
        <span>Tiếp Tục: Chọn Nước, Khăn & Căng Vợt</span>
        <i className="fa-solid fa-arrow-right"></i>
      </button>
    </footer>
  );
}
