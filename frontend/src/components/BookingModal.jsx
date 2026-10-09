import React, { useRef, useState, useEffect } from 'react';
import { X, CheckCircle2, QrCode, CreditCard, Clock, User, Phone, Mail, FileText, Check, Copy, Download, ShieldCheck } from 'lucide-react';
import { createBooking } from '../services/api';

export default function BookingModal({
  isOpen,
  onClose,
  bookingDetails,
  selectedSlots,
  selectedDate,
  selectedBranch,
  onBookingSuccess
}) {
  const [fullName, setFullName] = useState('Nguyễn Văn Tuấn');
  const [phoneNumber, setPhoneNumber] = useState('0909 123 456');
  const [email, setEmail] = useState('tuan.badminton@gmail.com');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('vietqr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedBookingCode, setConfirmedBookingCode] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || isSuccess) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSuccess]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const finalTotal = bookingDetails?.finalTotal || 0;
  const tempCode = confirmedBookingCode || `WAY-${selectedDate.id.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // VietQR Dynamic URL (MB Bank - Hotline Ways Station 0889 555 559)
  const qrUrl = `https://img.vietqr.io/image/MB-0889555559-compact.png?amount=${finalTotal}&addInfo=${encodeURIComponent(tempCode)}&accountName=WAYS%20STATION%20BADMINTON`;

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        branchCode: selectedBranch?.code || 'NVL',
        bookingDate: selectedDate?.id || new Date().toISOString().split('T')[0],
        customerName: fullName,
        customerPhone: phoneNumber,
        customerEmail: email,
        paymentMethod: paymentMethod.toUpperCase(),
        notes: notes,
        selectedSlots: selectedSlots.map((s) => ({
          courtId: s.courtId,
          timeSlotId: s.slotId
        }))
      };

      const res = await createBooking(payload);
      const assignedCode = res.bookingCode || tempCode;
      setConfirmedBookingCode(assignedCode);
      setIsSuccess(true);
      if (onBookingSuccess) {
        onBookingSuccess(assignedCode);
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi đặt sân. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {!isSuccess ? (
          <div>
            <div className="modal-header-section">
              <div className="reservation-timer-pill">
                <Clock size={13} className="text-amber" />
                <span>Thời gian giữ chỗ: <strong>{formatTime(countdown)}</strong></span>
              </div>
              <h3 className="modal-heading">Xác Nhận Đặt Sân Ways Station</h3>
              <p className="modal-sub">
                {selectedBranch?.name || 'Ways Station NVL'} • {selectedDate.dayTitle} ({String(selectedDate.dayNumber).padStart(2, '0')}/{String(selectedDate.month).padStart(2, '0')})
              </p>
            </div>

            <form onSubmit={handleConfirmSubmit} className="modal-form-content">
              {/* Customer info */}
              <div className="form-block">
                <span className="block-title">Thông tin người đặt sân</span>
                <div className="input-fields-row">
                  <div className="field-group">
                    <label>Họ và tên *</label>
                    <div className="input-box">
                      <User size={14} className="text-muted" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="VD: Nguyễn Văn Tuấn"
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Số điện thoại *</label>
                    <div className="input-box">
                      <Phone size={14} className="text-muted" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="VD: 0909 123 456"
                      />
                    </div>
                  </div>
                </div>

                <div className="input-fields-row mt-2">
                  <div className="field-group">
                    <label>Email (Nhận biên lai điện tử)</label>
                    <div className="input-box">
                      <Mail size={14} className="text-muted" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="VD: tuan.badminton@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Ghi chú cho quản lý sân</label>
                    <div className="input-box">
                      <FileText size={14} className="text-muted" />
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="VD: Yêu cầu bật quạt, căng cước sớm..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="form-block">
                <span className="block-title">Phương thức thanh toán</span>
                <div className="payment-radios-list">
                  <label className={`payment-radio-item ${paymentMethod === 'vietqr' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="vietqr"
                      checked={paymentMethod === 'vietqr'}
                      onChange={() => setPaymentMethod('vietqr')}
                    />
                    <div className="payment-label-wrap">
                      <QrCode size={18} className="text-emerald" />
                      <div>
                        <div className="payment-title">Quét Mã VietQR (Khuyên dùng)</div>
                        <div className="payment-sub">Xác nhận tự động 24/7 qua MB Bank / VCB / Momo</div>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-radio-item ${paymentMethod === 'cash' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                    />
                    <div className="payment-label-wrap">
                      <CreditCard size={18} className="text-amber" />
                      <div>
                        <div className="payment-title">Thanh toán tại quầy khi nhận sân</div>
                        <div className="payment-sub">Tiền mặt hoặc quẹt thẻ POS trước giờ chơi 15 phút</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* QR Preview if VietQR */}
              {paymentMethod === 'vietqr' && (
                <div className="qr-checkout-box">
                  <div className="qr-img-wrapper">
                    <img
                      src={qrUrl}
                      alt="Mã QR Chuyển Khoản Ways Station"
                      className="qr-img-live"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="qr-meta-info">
                    <div className="qr-title">Quét mã bằng App Ngân Hàng bất kỳ</div>
                    <div className="qr-bank-tag">MB BANK • STK: <strong>0889555559</strong></div>
                    <div className="qr-owner">Chủ TK: WAYS STATION BADMINTON</div>
                    <div className="qr-memo-row">
                      <span>Nội dung CK: <strong>{tempCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(tempCode)}
                        className="btn-copy-memo"
                        title="Sao chép nội dung"
                      >
                        <Copy size={12} />
                        <span>{copySuccess ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                    <div className="qr-total-label">
                      Số tiền: <strong>{formatVND(finalTotal)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Total & Submit Button */}
              <div className="modal-footer-action">
                <div className="footer-total-view">
                  <span className="total-hint">Tổng thanh toán ({selectedSlots.length} ca)</span>
                  <span className="total-sum">{formatVND(finalTotal)}</span>
                </div>
                <button type="submit" className="btn-confirm-final" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Đang xác nhận...' : 'Hoàn Tất Đặt Sân'}</span>
                  <Check size={16} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="modal-success-view">
            <div className="success-icon-wrap">
              <CheckCircle2 size={54} className="text-emerald" />
            </div>
            <h3 className="success-title">Đặt Sân Thành Công!</h3>
            <p className="success-desc">
              Hệ thống Ways Station đã ghi nhận thông tin đặt sân. Bạn có thể đến sân trước 10 phút để nhận vợt và khởi động.
            </p>

            <div className="receipt-card">
              <div className="receipt-header">
                <span className="receipt-tag">MÃ ĐẶT SÂN WAYS</span>
                <span className="receipt-code">{confirmedBookingCode || tempCode}</span>
              </div>
              <div className="receipt-body">
                <div className="receipt-row">
                  <span>Chi nhánh:</span>
                  <strong>{selectedBranch?.name || 'Ways Station NVL'}</strong>
                </div>
                <div className="receipt-row">
                  <span>Ngày chơi:</span>
                  <strong>{selectedDate.dayTitle} ({String(selectedDate.dayNumber).padStart(2, '0')}/{String(selectedDate.month).padStart(2, '0')})</strong>
                </div>
                <div className="receipt-row">
                  <span>Khung giờ đã chọn:</span>
                  <strong>{selectedSlots.map((s) => `${s.courtName}: ${s.time}`).join(' | ')}</strong>
                </div>
                <div className="receipt-row">
                  <span>Khách hàng:</span>
                  <strong>{fullName} ({phoneNumber})</strong>
                </div>
                <div className="receipt-row total">
                  <span>Tổng tiền thanh toán:</span>
                  <strong className="text-emerald">{formatVND(finalTotal)}</strong>
                </div>
              </div>
            </div>

            <button type="button" onClick={onClose} className="btn-return-home">
              Hoàn Tất & Về Trang Chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
