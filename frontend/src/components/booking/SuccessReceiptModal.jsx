import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SuccessReceiptModal({
  isOpen,
  onClose,
  bookingResult
}) {
  const modalBoxRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.85, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.8)' }
      );
    }
  }, [isOpen]);

  if (!isOpen || !bookingResult) return null;

  const {
    bookingCode = 'WAY-202610-001',
    customerName = '---',
    customerPhone = '---',
    bookingDate = '---',
    totalHours = 0,
    totalPrice = 0,
    paymentType = 'VIETQR'
  } = bookingResult;

  const qrImageUrl = `https://img.vietqr.io/image/MB-0889555559-compact2.png?amount=${totalPrice}&addInfo=${encodeURIComponent(
    bookingCode
  )}&accountName=WAYS%20STATION%20BADMINTON`;

  return (
    <div className="modal-overlay show">
      <div className="modal-box modal-box-success" ref={modalBoxRef}>
        <div className="success-top-banner">
          <i className="fa-solid fa-circle-check"></i>
          <h2>Đặt Sân Thành Công!</h2>
          <p>
            Mã đặt sân: <strong style={{ color: '#0284c7' }}>{bookingCode}</strong>
          </p>
        </div>

        <div className="modal-content-area">
          <div className="receipt-card">
            <p>
              <strong>Khách hàng:</strong> <span>{customerName}</span>
            </p>
            <p>
              <strong>Số điện thoại:</strong> <span>{customerPhone}</span>
            </p>
            <p>
              <strong>Ngày đặt:</strong> <span>{bookingDate}</span>
            </p>
            <p>
              <strong>Tổng giờ chơi:</strong> <span>{totalHours}h</span>
            </p>
            <p>
              <strong>Tổng thanh toán:</strong>{' '}
              <span className="text-orange">
                {totalPrice.toLocaleString('vi-VN')} đ
              </span>
            </p>

            {paymentType === 'VIETQR' && (
              <div className="vietqr-block">
                <h4>Quét mã VietQR để thanh toán</h4>
                <img
                  src={qrImageUrl}
                  alt="Mã VietQR"
                  className="qr-img"
                  style={{ maxWidth: '280px', margin: '12px auto', display: 'block', borderRadius: '8px' }}
                />
                <div className="bank-sub-info">
                  <p>
                    Ngân hàng: <strong>MB Bank (Quân Đội)</strong>
                  </p>
                  <p>
                    Số tài khoản: <strong>0889555559</strong>
                  </p>
                  <p>
                    Chủ TK: <strong>WAYS STATION BADMINTON</strong>
                  </p>
                  <p>
                    Nội dung CK: <strong>{bookingCode}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="form-btn-group" style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="btn-back"
              onClick={() => window.print()}
            >
              <i className="fa-solid fa-print"></i> In Hóa Đơn
            </button>
            <button
              type="button"
              className="btn-confirm-submit"
              onClick={onClose}
            >
              Hoàn Tất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
