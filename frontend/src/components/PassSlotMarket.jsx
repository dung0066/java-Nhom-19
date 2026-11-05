import React, { useState } from 'react';
import { Flame, Phone, CheckCircle2, Clock, MapPin, Tag, User, PlusCircle, AlertCircle } from 'lucide-react';

export default function PassSlotMarket({
  slotStatusMap,
  courts,
  timeSlots,
  selectedBranch,
  selectedDate,
  onClaimPassSlot,
  onRequestPassSlot
}) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [contactPhoneInput, setContactPhoneInput] = useState('');
  const [slotCodeInput, setSlotCodeInput] = useState('');
  const [offerSuccessMsg, setOfferSuccessMsg] = useState('');

  // Extract all slots that have status === 'PASS_WANTED'
  const passSlotsList = [];
  if (slotStatusMap) {
    Object.entries(slotStatusMap).forEach(([key, info]) => {
      if (info && info.status === 'PASS_WANTED') {
        const [courtIdStr, slotIdStr] = key.split('_');
        const court = courts.find((c) => String(c.id) === courtIdStr) || { name: `Sân ${courtIdStr}` };
        const slot = timeSlots.find((s) => String(s.id) === slotIdStr) || { displayLabel: `Ca ${slotIdStr}`, price: info.price || 70000 };

        passSlotsList.push({
          key,
          courtId: Number(courtIdStr),
          courtName: court.name,
          slotId: Number(slotIdStr),
          time: slot.displayLabel,
          price: info.price || (slot.isPeakHour ? 120000 : 70000),
          customerName: info.customerName || 'Khách nhượng',
          passContact: info.passContact || '0889 555 559',
          bookingDetailId: info.bookingDetailId
        });
      }
    });
  }

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handlePostOffer = (e) => {
    e.preventDefault();
    if (onRequestPassSlot) {
      onRequestPassSlot(slotCodeInput, contactPhoneInput);
    }
    setOfferSuccessMsg('Đã tiếp nhận yêu cầu đăng tin nhượng ca sân của bạn!');
    setTimeout(() => {
      setOfferSuccessMsg('');
      setShowOfferModal(false);
      setSlotCodeInput('');
      setContactPhoneInput('');
    }, 2000);
  };

  return (
    <section className="pass-market-section" id="pass-market-section">
      <div className="section-title-wrap">
        <div className="section-pill text-purple-pill">
          <Flame size={13} className="text-purple" />
          <span>Cộng Đồng Người Chơi Cầu Lông</span>
        </div>
        <div className="pass-title-row">
          <div>
            <h2 className="section-main-title">Chợ Pass Sân & Nhượng Ca Giờ Chơi</h2>
            <p className="section-desc">
              Bạn bận việc đột xuất? Nhượng lại ca đã đặt cho cơ thủ khác hoặc tìm kiếm khung giờ vàng giá hời mà không lo lỡ trận đấu.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowOfferModal(true)}
            className="btn-open-offer-modal"
          >
            <PlusCircle size={15} />
            <span>Đăng Tin Nhượng Ca</span>
          </button>
        </div>
      </div>

      {/* Notice Bar */}
      <div className="pass-notice-card">
        <div className="notice-icon">
          <Flame size={20} className="text-purple" />
        </div>
        <div className="notice-text">
          <strong>Lưu ý giao dịch an toàn:</strong> Người nhận ca có thể bấm "Nhận Ca Ngay" để thanh toán bảo đảm trực tiếp qua hệ thống Ways Station, hoặc liên hệ trực tiếp số điện thoại chủ slot bên dưới để giao lưu.
        </div>
      </div>

      {/* Grid of Pass Slots */}
      {passSlotsList.length === 0 ? (
        <div className="pass-empty-box">
          <Flame size={36} className="text-muted" />
          <h4>Hiện tại chưa có ca nào cần pass</h4>
          <p>Tất cả các cơ thủ đều đang giữ lịch hoặc đã có khách nhận. Bạn có thể kiểm tra lại sau hoặc xem bảng lịch ma trận để đặt sân mới!</p>
        </div>
      ) : (
        <div className="pass-cards-grid">
          {passSlotsList.map((item) => (
            <div key={item.key} className="pass-slot-card">
              <div className="pass-card-header">
                <span className="pass-badge">
                  <Flame size={12} /> CẦN PASS GẤP
                </span>
                <span className="pass-price-tag">{formatVND(item.price)}</span>
              </div>

              <div className="pass-card-body">
                <div className="pass-slot-court">{item.courtName}</div>
                <div className="pass-slot-time">
                  <Clock size={14} className="text-amber" />
                  <span>{item.time}</span>
                </div>

                <div className="pass-slot-meta">
                  <div className="meta-line">
                    <MapPin size={13} className="text-emerald" />
                    <span>{selectedBranch?.name || 'Ways Station NVL'}</span>
                  </div>
                  <div className="meta-line">
                    <User size={13} className="text-muted" />
                    <span>Chủ sân: <strong>{item.customerName}</strong></span>
                  </div>
                  <div className="meta-line">
                    <Phone size={13} className="text-purple" />
                    <span>SĐT Pass: <strong>{item.passContact}</strong></span>
                  </div>
                </div>

                <div className="pass-card-actions">
                  <button
                    type="button"
                    onClick={() => onClaimPassSlot(item)}
                    className="btn-claim-slot"
                  >
                    <span>Nhận Ca Ngay</span>
                    <CheckCircle2 size={15} />
                  </button>

                  <a
                    href={`tel:${item.passContact}`}
                    className="btn-call-pass"
                    title="Gọi cho người nhượng"
                  >
                    <Phone size={14} />
                    <span>Gọi trao đổi</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal đăng tin nhượng ca */}
      {showOfferModal && (
        <div className="modal-backdrop" onClick={() => setShowOfferModal(false)}>
          <div className="modal-panel small-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-section">
              <h3 className="modal-heading">Đăng Tin Nhượng Ca Sân</h3>
              <p className="modal-sub">Nhập thông tin đơn đặt sân để bật trạng thái Cần Pass trên bảng lịch</p>
            </div>

            {offerSuccessMsg ? (
              <div className="offer-success-view">
                <CheckCircle2 size={40} className="text-emerald" />
                <p>{offerSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handlePostOffer} className="modal-form-content">
                <div className="field-group">
                  <label>Mã đơn đặt sân hoặc Số ca cần pass</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: WAY-20261009-5001 hoặc Sân 1 (18h-19h)"
                    value={slotCodeInput}
                    onChange={(e) => setSlotCodeInput(e.target.value)}
                  />
                </div>

                <div className="field-group mt-2">
                  <label>Số điện thoại liên hệ nhận pass</label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0909 123 456"
                    value={contactPhoneInput}
                    onChange={(e) => setContactPhoneInput(e.target.value)}
                  />
                </div>

                <div className="field-note mt-2">
                  <AlertCircle size={12} className="text-amber" />
                  <span>Sau khi đăng, ô giờ của bạn sẽ chuyển sang màu Tím (Cần Pass) kèm SĐT để cơ thủ khác nhận lại.</span>
                </div>

                <div className="modal-footer-action mt-3">
                  <button type="button" onClick={() => setShowOfferModal(false)} className="btn-cancel">
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn-confirm-final">
                    Xác Nhận Đăng Tin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
