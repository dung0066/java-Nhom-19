import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedSlots,
  date,
  branch,
  onSubmitBooking
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [payType, setPayType] = useState('VIETQR');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalBoxRef = useRef(null);

  const hours = selectedSlots.length;
  const totalPrice = selectedSlots.reduce((sum, s) => sum + (s.slot?.price || 0), 0);

  useEffect(() => {
    if (isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.85, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Vui lòng điền họ tên và số điện thoại!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitBooking({
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        paymentType: payType,
        notes: notes,
        branchCode: branch,
        bookingDate: date,
        slots: selectedSlots,
        totalPrice: totalPrice,
        totalHours: hours
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay show">
      <div className="modal-box" ref={modalBoxRef}>
        <div className="modal-head">
          <h3>
            <i className="fa-solid fa-receipt"></i> Xác Nhận Đặt Sân Cầu Lông
          </h3>
          <button className="close-x" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-content-area">
          <div className="booking-recap">
            <h4>Danh sách sân đã chọn:</h4>
            <div className="recap-list">
              {selectedSlots.map((s, idx) => (
                <div key={idx} className="recap-item">
                  <span>
                    <strong>{s.court?.name}</strong>: {s.slot?.displayLabel}
                  </span>
                  <span>{(s.slot?.price || 0).toLocaleString('vi-VN')} đ</span>
                </div>
              ))}
            </div>
            <div className="recap-total">
              <span>
                Tổng tiền (<strong>{hours}h</strong>):
              </span>
              <span className="recap-price">
                {totalPrice.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>
                Họ và tên khách hàng <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label>
                  Số điện thoại <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="0909123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Email nhận thông báo</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Hình thức thanh toán</label>
              <div className="pay-options">
                <label
                  className={`pay-card ${payType === 'VIETQR' ? 'active' : ''}`}
                  onClick={() => setPayType('VIETQR')}
                >
                  <input
                    type="radio"
                    name="payType"
                    value="VIETQR"
                    checked={payType === 'VIETQR'}
                    readOnly
                  />
                  <div>
                    <strong>
                      <i className="fa-solid fa-qrcode"></i> Quét mã VietQR
                    </strong>
                    <small>Chuyển khoản tức thì</small>
                  </div>
                </label>

                <label
                  className={`pay-card ${payType === 'CASH' ? 'active' : ''}`}
                  onClick={() => setPayType('CASH')}
                >
                  <input
                    type="radio"
                    name="payType"
                    value="CASH"
                    checked={payType === 'CASH'}
                    readOnly
                  />
                  <div>
                    <strong>
                      <i className="fa-solid fa-money-bill-wave"></i> Tiền mặt
                    </strong>
                    <small>Thanh toán tại quầy</small>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-field">
              <label>Ghi chú đơn (Thuê vợt, giày, mua nước...)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Thuê 2 vợt Yonex, 1 đôi giày size 41..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="form-btn-group">
              <button type="button" className="btn-back" onClick={onClose}>
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn-confirm-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang xử lý...
                  </>
                ) : (
                  'Xác Nhận Đặt Sân'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
