import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Calendar, MapPin, CheckCircle2, Trophy, ArrowRight, X } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function InitialWelcomeModal({
  isOpen,
  onClose,
  branches,
  selectedBranch,
  setSelectedBranch,
  selectedDate,
  setSelectedDate
}) {
  const modalRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(() => {
    if (isOpen) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(cardRef.current, { scale: 0.9, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)' });
    }
  }, { scope: modalRef, dependencies: [isOpen] });

  if (!isOpen) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="modal-backdrop" ref={modalRef} onClick={onClose}>
      <div className="modal-panel welcome-modal-card" ref={cardRef} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="welcome-modal-header">
          <div className="welcome-trophy-icon">
            <Trophy size={32} className="text-emerald" />
          </div>
          <h3 className="welcome-title">Chào Mừng Đến Với Ways Station</h3>
          <p className="welcome-sub">Hệ thống sân cầu lông tiêu chuẩn quốc tế BWF - Mở cửa 24/7</p>
        </div>

        <form onSubmit={handleConfirm} className="welcome-form-body">
          {/* 1. Chọn ngày chơi */}
          <div className="welcome-step-box">
            <label className="step-label">
              <Calendar size={15} className="text-emerald" />
              <span>1. Chọn ngày bạn muốn đặt sân:</span>
            </label>
            <input
              type="date"
              className="welcome-date-input"
              value={selectedDate?.id || new Date().toISOString().split('T')[0]}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                const parts = e.target.value.split('-');
                setSelectedDate({
                  id: e.target.value,
                  dayTitle: 'Ngày đã chọn',
                  dayNumber: parseInt(parts[2]),
                  month: parseInt(parts[1])
                });
              }}
              required
            />
          </div>

          {/* 2. Chọn chi nhánh */}
          <div className="welcome-step-box mt-3">
            <label className="step-label">
              <MapPin size={15} className="text-cyan" />
              <span>2. Chọn chi nhánh sân gần bạn nhất:</span>
            </label>
            <div className="welcome-branches-list">
              {branches.map((b) => {
                const isSelected = selectedBranch?.code === b.code;
                return (
                  <label key={b.code} className={`welcome-branch-item ${isSelected ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="welcomeBranch"
                      value={b.code}
                      checked={isSelected}
                      onChange={() => setSelectedBranch(b)}
                    />
                    <div className="branch-label-content">
                      <span className="branch-code-pill">{b.code}</span>
                      <div className="branch-texts">
                        <strong>{b.name}</strong>
                        <small>{b.address}</small>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn-welcome-submit mt-4">
            <span>Vào Xem Bảng Lịch Đặt Sân</span>
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
