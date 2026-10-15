import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function BookingBottomBar({ selectedSlots, onNext }) {
  const barRef = useRef(null);

  const hours = selectedSlots.length;
  const totalPrice = selectedSlots.reduce((sum, s) => sum + (s.slot?.price || 70000), 0);

  useEffect(() => {
    if (barRef.current && hours > 0) {
      gsap.fromTo(
        barRef.current,
        { scale: 0.99 },
        { scale: 1, duration: 0.2, ease: 'power2.out' }
      );
    }
  }, [hours]);

  return (
    <footer className="bottom-bar-fixed" ref={barRef}>
      <div className="bottom-status-row">
        <span className="bottom-selected-text">
          Đang chọn: {hours}h00
        </span>
        <span className="bottom-total-text">
          Tổng:{totalPrice.toLocaleString('vi-VN')} đ
        </span>
      </div>
      <div className="bottom-button-row">
        <button
          type="button"
          className="btn-bottom-submit active"
          onClick={onNext}
        >
          Tiếp theo
        </button>
      </div>
    </footer>
  );
}

