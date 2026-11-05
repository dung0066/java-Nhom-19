import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { lookupBookingByCode } from '../../services/api';

export default function SuccessReceiptModal({
  isOpen,
  onClose,
  bookingResult
}) {
  const modalBoxRef = useRef(null);
  const [currentStatus, setCurrentStatus] = useState(bookingResult?.status || 'PENDING');
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');

  useEffect(() => {
    if (bookingResult?.status) {
      setCurrentStatus(bookingResult.status);
    }
  }, [bookingResult]);

  // Entrance GSAP animation
  useEffect(() => {
    if (isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.85, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.8)' }
      );
    }
  }, [isOpen]);

  // Hold expiration countdown
  useEffect(() => {
    if (!isOpen || !bookingResult) return;

    const expiresAt = bookingResult.holdExpiresAt
      ? new Date(bookingResult.holdExpiresAt).getTime()
      : Date.now() + 15 * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffMs = expiresAt - now;

      if (diffMs <= 0) {
        setTimeLeftStr('Đã hết hạn giữ chỗ');
        clearInterval(interval);
      } else {
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        setTimeLeftStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, bookingResult]);

  // Auto-poll payment status every 10 seconds if PENDING
  useEffect(() => {
    if (!isOpen || !bookingResult?.bookingCode || currentStatus === 'CONFIRMED') return;

    const pollInterval = setInterval(async () => {
      try {
        const data = await lookupBookingByCode(bookingResult.bookingCode);
        if (data && data.status) {
          setCurrentStatus(data.status);
          if (data.status === 'CONFIRMED') {
            setCheckMessage('Tuyệt vời! Thanh toán đã được xác nhận.');
            clearInterval(pollInterval);
          }
        }
      } catch (e) {
        // silently ignore poll failure
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [isOpen, bookingResult, currentStatus]);

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

  const handleManualCheck = async () => {
    setIsCheckingPayment(true);
    setCheckMessage('');
    try {
      const data = await lookupBookingByCode(bookingCode);
      if (data && data.status) {
        setCurrentStatus(data.status);
        if (data.status === 'CONFIRMED') {
          setCheckMessage('Thanh toán đã được xác nhận thành công!');
        } else {
          setCheckMessage(`Đơn đang ở trạng thái: ${data.status}. Chưa nhận được giao dịch.`);
        }
      }
    } catch (e) {
      setCheckMessage('Không thể kết nối máy chủ để kiểm tra. Vui lòng thử lại sau.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  return (
    <div className="modal-overlay show">
      <div className="modal-box modal-box-success" ref={modalBoxRef} style={{ maxWidth: '520px' }}>
        <div className="success-top-banner">
          <i className={currentStatus === 'CONFIRMED' ? 'fa-solid fa-circle-check' : 'fa-solid fa-clock'} style={{ color: currentStatus === 'CONFIRMED' ? '#10b981' : '#f59e0b' }}></i>
          <h2>{currentStatus === 'CONFIRMED' ? 'Thanh Toán Thành Công!' : 'Đã Ghi Nhận Giữ Chỗ!'}</h2>
          <p>
            Mã đặt sân: <strong style={{ color: '#0284c7' }}>{bookingCode}</strong>
          </p>
        </div>

        <div className="modal-content-area">
          {/* Status badge & countdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: currentStatus === 'CONFIRMED' ? '#ecfdf5' : '#fffbeb', border: `1px solid ${currentStatus === 'CONFIRMED' ? '#a7f3d0' : '#fde68a'}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: currentStatus === 'CONFIRMED' ? '#047857' : '#b45309' }}>
                Trạng Thái
              </span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: currentStatus === 'CONFIRMED' ? '#065f46' : '#92400e' }}>
                {currentStatus === 'CONFIRMED' ? 'Đã Xác Nhận (CONFIRMED)' : 'Chờ Thanh Toán (PENDING)'}
              </div>
            </div>

            {currentStatus !== 'CONFIRMED' && timeLeftStr && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: '#dc2626' }}>
                  Giữ chỗ còn lại
                </span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#b91c1c', fontFamily: 'monospace' }}>
                  {timeLeftStr}
                </div>
              </div>
            )}
          </div>

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
              <span className="text-orange" style={{ fontSize: '16px', fontWeight: 800 }}>
                {totalPrice.toLocaleString('vi-VN')} đ
              </span>
            </p>

            {paymentType === 'VIETQR' && currentStatus !== 'CONFIRMED' && (
              <div className="vietqr-block" style={{ marginTop: '16px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1e293b' }}>
                  Quét mã VietQR để thanh toán giữ chỗ
                </h4>
                <img
                  src={qrImageUrl}
                  alt="Mã VietQR"
                  className="qr-img"
                  style={{ maxWidth: '240px', margin: '8px auto', display: 'block', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <div className="bank-sub-info" style={{ fontSize: '12px', textAlign: 'left', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', margin: '10px 0' }}>
                  <p style={{ margin: '2px 0' }}>Ngân hàng: <strong>MB Bank (Quân Đội)</strong></p>
                  <p style={{ margin: '2px 0' }}>Số tài khoản: <strong>0889555559</strong></p>
                  <p style={{ margin: '2px 0' }}>Chủ TK: <strong>D2 BADMINTONSHOP</strong></p>
                  <p style={{ margin: '2px 0' }}>Nội dung CK: <strong style={{ color: '#0284c7' }}>{bookingCode}</strong></p>
                </div>

                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isCheckingPayment}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}
                >
                  {isCheckingPayment ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-rotate"></i> Kiểm Tra Trạng Thái Thanh Toán
                    </>
                  )}
                </button>
                {checkMessage && (
                  <p style={{ fontSize: '12px', marginTop: '6px', color: currentStatus === 'CONFIRMED' ? '#059669' : '#d97706', fontWeight: 600 }}>
                    {checkMessage}
                  </p>
                )}
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
