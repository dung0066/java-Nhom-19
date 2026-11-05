import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { HelpCircle, Clock, ShieldCheck, Flame, Phone, X, Award } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function GuidePriceModal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useGSAP(() => {
    if (isOpen) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo('.guide-panel', { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out' });
    }
  }, { scope: modalRef, dependencies: [isOpen] });

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" ref={modalRef} onClick={onClose}>
      <div className="modal-panel medium-modal guide-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="modal-header-section">
          <div className="section-pill">
            <HelpCircle size={13} className="text-emerald" />
            <span>Thông Tin Dịch Vụ</span>
          </div>
          <h3 className="modal-heading">Bảng Giá & Quy Định Đặt Sân Ways Station</h3>
        </div>

        <div className="guide-content-body">
          {/* Price Table */}
          <div className="guide-pricing-card">
            <h4>Bảng Giá Thuê Sân Theo Ca (60 Phút)</h4>
            <div className="guide-price-row">
              <div className="price-type">
                <Clock size={15} className="text-emerald" />
                <span>Khung Giờ Thường (00h15 - 17h40):</span>
              </div>
              <strong className="text-emerald">70.000 đ / ca</strong>
            </div>

            <div className="guide-price-row">
              <div className="price-type">
                <Flame size={15} className="text-amber" />
                <span>Khung Giờ Vàng Cao Điểm (17h45 - 23h05):</span>
              </div>
              <strong className="text-amber">120.000 đ / ca</strong>
            </div>
          </div>

          {/* Rules */}
          <div className="guide-rules-list mt-3">
            <div className="rule-item">
              <ShieldCheck size={16} className="text-emerald shrink-0" />
              <span><strong>Thời gian giữ chỗ:</strong> Đơn đặt sân được giữ chỗ tối đa 10 phút kể từ lúc bấm xác nhận để hoàn tất thanh toán VietQR.</span>
            </div>

            <div className="rule-item">
              <ShieldCheck size={16} className="text-emerald shrink-0" />
              <span><strong>Quy định hủy & đổi lịch:</strong> Khách hàng được đổi lịch hoặc hủy hoàn tiền trước giờ chơi tối thiểu 4 tiếng qua hotline CSKH.</span>
            </div>

            <div className="rule-item">
              <ShieldCheck size={16} className="text-emerald shrink-0" />
              <span><strong>Nhượng ca (Cần Pass):</strong> Nếu bạn bận đột xuất, hãy dùng tính năng "Đăng tin nhượng ca" để pass lại slot cho cơ thủ khác trên Chợ Pass Sân.</span>
            </div>

            <div className="rule-item">
              <Phone size={16} className="text-cyan shrink-0" />
              <span><strong>Đặt lịch cố định tháng & Tổ chức giải:</strong> Vui lòng liên hệ Hotline trực tiếp: <strong>0889 555 559</strong> để nhận hợp đồng ưu đãi.</span>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn-confirm-final mt-4 w-full">
            Đã Hiểu & Đóng Hướng Dẫn
          </button>
        </div>
      </div>
    </div>
  );
}
