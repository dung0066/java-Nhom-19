import React, { useState } from 'react';
import { ShoppingCart, Trash2, ArrowRight, Tag, CheckCircle2, AlertCircle, Shield, Flame } from 'lucide-react';

export default function BookingSummary({
  selectedSlots,
  onRemoveSlot,
  onClearAllSlots,
  addons,
  addonQuantities,
  onProceedBooking,
  selectedDate,
  selectedBranch
}) {
  const [voucherCode, setVoucherCode] = useState('');
  const [discountVoucher, setDiscountVoucher] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  // Calculations
  const rawCourtTotal = selectedSlots.reduce((sum, s) => sum + (s.price || 70000), 0);
  const multiSlotDiscount = selectedSlots.length >= 2 ? Math.round(rawCourtTotal * 0.1) : 0;

  const addonsTotal = addons.reduce((sum, addon) => {
    const qty = addonQuantities[addon.id] || 0;
    return sum + addon.price * qty;
  }, 0);

  const subTotal = rawCourtTotal - multiSlotDiscount + addonsTotal;
  const finalTotal = Math.max(0, subTotal - discountVoucher);

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    const code = voucherCode.trim().toUpperCase();
    if (code === 'WAYS20' || code === 'SMASH20') {
      setDiscountVoucher(20000);
      setVoucherApplied(true);
      setVoucherError('');
    } else if (code === 'WAYSVIP' || code === 'SMASHVIP') {
      setDiscountVoucher(50000);
      setVoucherApplied(true);
      setVoucherError('');
    } else if (code === 'PASS10') {
      setDiscountVoucher(Math.round(rawCourtTotal * 0.1));
      setVoucherApplied(true);
      setVoucherError('');
    } else {
      setVoucherError('Mã không hợp lệ (Thử: WAYS20 hoặc WAYSVIP)');
    }
  };

  if (selectedSlots.length === 0 && addonsTotal === 0) {
    return (
      <aside className="summary-empty-card">
        <div className="empty-icon-wrap">
          <ShoppingCart size={28} className="text-muted" />
        </div>
        <h4 className="empty-title">Chưa chọn khung giờ</h4>
        <p className="empty-desc">
          Nhấp vào ô giờ trống trên bảng ma trận hoặc chọn nhận ca trong Chợ Pass Sân để đặt chỗ.
        </p>
        <div className="voucher-hint-box">
          <Tag size={13} className="text-emerald" />
          <span>Mã ưu đãi: <strong>WAYS20</strong> (giảm 20.000đ)</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="summary-active-card">
      <div className="summary-card-header">
        <div className="summary-title-wrap">
          <ShoppingCart size={18} className="text-emerald" />
          <h4 className="summary-title">Tóm Tắt Đặt Chỗ</h4>
          <span className="slots-badge">{selectedSlots.length} ca</span>
        </div>
        <button
          type="button"
          onClick={onClearAllSlots}
          className="btn-clear-slots"
          title="Xóa tất cả ca đã chọn"
        >
          <Trash2 size={13} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="summary-meta-box">
        <div className="meta-branch-name">{selectedBranch?.name || 'Ways Station NVL'}</div>
        <div className="meta-date-info">
          {selectedDate.dayTitle}, {String(selectedDate.dayNumber).padStart(2, '0')}/{String(selectedDate.month).padStart(2, '0')}
        </div>
      </div>

      {/* Selected Slots List */}
      <div className="slots-scroll-list">
        {selectedSlots.map((slot) => (
          <div key={slot.key} className="selected-slot-row">
            <div className="slot-info">
              <span className="slot-court-name">{slot.courtName}</span>
              <span className="slot-time-text">{slot.time}</span>
            </div>
            <div className="slot-cost-actions">
              <span className="slot-price-label">{formatVND(slot.price)}</span>
              <button
                type="button"
                onClick={() => onRemoveSlot(slot.key)}
                className="btn-remove-slot"
                title="Bỏ chọn ca này"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Addons if any */}
      {addonsTotal > 0 && (
        <div className="summary-addons-section">
          <div className="addons-title">Dụng cụ & dịch vụ:</div>
          {addons.map((item) => {
            const qty = addonQuantities[item.id] || 0;
            if (qty === 0) return null;
            return (
              <div key={item.id} className="addon-line-item">
                <span>{item.name} (x{qty})</span>
                <span>{formatVND(item.price * qty)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Voucher Input */}
      <form onSubmit={handleApplyVoucher} className="voucher-section">
        <div className="voucher-input-group">
          <Tag size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Mã ưu đãi (WAYS20)"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            className="voucher-field"
          />
          <button type="submit" className="btn-apply-voucher">
            Áp dụng
          </button>
        </div>
        {voucherApplied && (
          <div className="voucher-msg-success">
            <CheckCircle2 size={12} />
            <span>Đã giảm {formatVND(discountVoucher)} vào hóa đơn!</span>
          </div>
        )}
        {voucherError && (
          <div className="voucher-msg-error">
            <AlertCircle size={12} />
            <span>{voucherError}</span>
          </div>
        )}
      </form>

      {/* Price Calculation Breakdown */}
      <div className="price-breakdown-list">
        <div className="price-row">
          <span>Tiền sân ({selectedSlots.length} ca):</span>
          <span>{formatVND(rawCourtTotal)}</span>
        </div>
        {multiSlotDiscount > 0 && (
          <div className="price-row text-discount">
            <span>Ưu đãi đặt từ 2 ca (-10%):</span>
            <span>-{formatVND(multiSlotDiscount)}</span>
          </div>
        )}
        {addonsTotal > 0 && (
          <div className="price-row">
            <span>Dịch vụ & Dụng cụ:</span>
            <span>+{formatVND(addonsTotal)}</span>
          </div>
        )}
        {discountVoucher > 0 && (
          <div className="price-row text-discount">
            <span>Mã giảm giá:</span>
            <span>-{formatVND(discountVoucher)}</span>
          </div>
        )}
        <div className="price-row final-total-row">
          <span>Tổng thanh toán:</span>
          <span className="final-price">{formatVND(finalTotal)}</span>
        </div>
      </div>

      {/* Confirm & Book Button */}
      <button
        type="button"
        disabled={selectedSlots.length === 0}
        onClick={() => onProceedBooking({ rawCourtTotal, multiSlotDiscount, addonsTotal, discountVoucher, finalTotal })}
        className="btn-checkout-proceed"
      >
        <span>Xác Nhận Đặt Chỗ Ngay</span>
        <ArrowRight size={16} />
      </button>

      <div className="policy-note">
        <Shield size={12} className="text-muted" />
        <span>Giữ chỗ an toàn 10 phút • Hỗ trợ đổi giờ & nhượng ca linh hoạt</span>
      </div>
    </aside>
  );
}
