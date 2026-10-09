import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function InitialWelcomeModal({
  isOpen,
  onClose,
  initialDate,
  initialBranch,
  onConfirm
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedBranch, setSelectedBranch] = useState(initialBranch || 'NVL');
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpen && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.8, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedDate, selectedBranch);
    onClose();
  };

  return (
    <div className="initial-popup-backdrop show">
      <div className="initial-popup-card" ref={cardRef}>
        <h3 className="initial-popup-title">
          Vui lòng chọn ngày và chi nhánh bạn muốn đặt sân!
        </h3>

        <div className="initial-field-group">
          <label className="initial-field-label">Chọn ngày:</label>
          <div className="initial-date-box">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="initial-date-input"
            />
            <i className="fa-solid fa-calendar-days initial-calendar-icon"></i>
          </div>
        </div>

        <div className="initial-field-group">
          <label className="initial-field-label">Chọn chi nhánh:</label>
          <div className="initial-branch-list">
            {[
              { code: 'NVL', short: 'NVL', desc: '70 Nguyễn Văn Lượng, P. 10, Gò Vấp' },
              { code: 'DQII', short: 'DQH', desc: '262 Dương Quảng Hàm, Gò Vấp' },
              { code: 'NQA', short: 'NQA', desc: '86 Nguyễn Quý Anh, Tân Phú' },
              { code: 'HB', short: 'HB', desc: '135 Hiệp Bình, Thủ Đức' }
            ].map((b) => (
              <label
                key={b.code}
                className="initial-branch-item"
                onClick={() => setSelectedBranch(b.code)}
              >
                <input
                  type="radio"
                  name="initBranch"
                  value={b.code}
                  checked={selectedBranch === b.code}
                  readOnly
                />
                <span className="init-dot-radio"></span>
                <span>
                  <strong>{b.short}</strong> = {b.desc}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="initial-popup-action">
          <button
            type="button"
            className="btn-init-confirm"
            onClick={handleConfirm}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
