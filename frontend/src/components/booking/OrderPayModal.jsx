import React, { useState, useEffect } from 'react';
import { buildVietQrUrl, formatVnd, BANK_NAME, BANK_ACCOUNT_NO, BANK_ACCOUNT_NAME } from '../../services/payment';
import { payRemainingBooking, payPendingBookingWithWallet, fetchMyWalletBalance } from '../../services/api';

export default function OrderPayModal({ isOpen, onClose, booking, currentUser, onSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('VIETQR');
  const [walletBalance, setWalletBalance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !booking) return;
    setIsSuccess(false);
    setMessage('');
    setSelectedMethod('VIETQR');

    if (currentUser) {
      fetchMyWalletBalance()
        .then((res) => {
          if (res && res.balance != null) setWalletBalance(res.balance);
        })
        .catch(() => {});
    }
  }, [isOpen, booking, currentUser]);

  // Tự động kiểm tra trạng thái chuyển khoản VietQR qua polling
  useEffect(() => {
    if (!isOpen || !booking || isSuccess || selectedMethod !== 'VIETQR') return;

    const targetStatus = booking.status === 'DEPOSITED' ? 'CONFIRMED' : (booking.isDeposit ? 'DEPOSITED' : 'CONFIRMED');

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/booking/code/${booking.bookingCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.status === 'CONFIRMED' || (booking.status === 'PENDING' && data.status === 'DEPOSITED'))) {
            setIsSuccess(true);
            setMessage('🎉 Thanh toán thành công! Hệ thống đã ghi nhận giao dịch.');
            clearInterval(interval);
            setTimeout(() => {
              if (onSuccess) onSuccess();
            }, 2000);
          }
        }
      } catch (e) {
        // ignore polling error
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, booking, isSuccess, selectedMethod, onSuccess]);

  if (!isOpen || !booking) return null;

  const isDeposited = booking.status === 'DEPOSITED';
  const isDepositOrder = booking.isDeposit || isDeposited || (booking.notes && booking.notes.includes('COC_50%'));

  let amountToPay = 0;
  let actionTitle = '';

  if (isDeposited) {
    amountToPay = Number(booking.remainingAmount) || (Number(booking.totalPrice) * 0.5);
    actionTitle = 'Thanh toán nốt 50% còn lại';
  } else if (isDepositOrder) {
    amountToPay = Number(booking.depositAmount) || Number(booking.paidAmount) || (Number(booking.totalPrice) * 0.5);
    actionTitle = 'Thanh toán tiền cọc 50%';
  } else {
    amountToPay = Number(booking.totalPrice) || 0;
    actionTitle = 'Thanh toán toàn bộ 100%';
  }

  const handlePayWithWallet = async () => {
    setIsSubmitting(true);
    setMessage('');
    try {
      if (isDeposited) {
        await payRemainingBooking(booking.id, 'WALLET');
      } else {
        await payPendingBookingWithWallet(booking.id);
      }
      setIsSuccess(true);
      setMessage('🎉 Đã thanh toán thành công bằng ví D2 BadmintonShop!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1800);
    } catch (err) {
      setMessage(`Lỗi: ${err.message || 'Không thể thanh toán bằng ví'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
              <i className="fa-solid fa-credit-card" style={{ marginRight: '8px' }}></i>
              {actionTitle}
            </h3>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>
              Đơn hàng: <strong>{booking.bookingCode}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: '#ffffff',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {/* Amount Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Số tiền cần thanh toán</span>
              <strong style={{ fontSize: '20px', color: '#0284c7' }}>{formatVnd(amountToPay)}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Tổng đơn</span>
              <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>{formatVnd(booking.totalPrice)}</span>
            </div>
          </div>

          {/* Payment Method Switcher */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setSelectedMethod('VIETQR')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: selectedMethod === 'VIETQR' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: selectedMethod === 'VIETQR' ? '#f0f9ff' : '#ffffff',
                color: selectedMethod === 'VIETQR' ? '#0369a1' : '#475569',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <i className="fa-solid fa-qrcode"></i> Quét VietQR
            </button>
            {currentUser && (
              <button
                type="button"
                onClick={() => setSelectedMethod('WALLET')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: selectedMethod === 'WALLET' ? '2px solid #059669' : '1px solid #cbd5e1',
                  background: selectedMethod === 'WALLET' ? '#ecfdf5' : '#ffffff',
                  color: selectedMethod === 'WALLET' ? '#047857' : '#475569',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-wallet"></i> Ví D2
              </button>
            )}
          </div>

          {/* Method 1: VietQR */}
          {selectedMethod === 'VIETQR' && (
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'center'
              }}
            >
              <img
                src={buildVietQrUrl(amountToPay, booking.bookingCode)}
                alt="VietQR code"
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'contain',
                  margin: '0 auto 10px auto',
                  display: 'block',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}
              />
              <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                {BANK_NAME}
                <br />
                STK: <strong>{BANK_ACCOUNT_NO}</strong> - Tên: <strong>{BANK_ACCOUNT_NAME}</strong>
                <br />
                Nội dung CK: <strong style={{ color: '#0284c7' }}>{booking.bookingCode}</strong>
              </div>
              <div
                style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#2563eb',
                  fontWeight: '600',
                  background: '#eff6ff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-spinner fa-spin"></i> Chờ hệ thống tự động xác nhận sau khi chuyển...
              </div>
            </div>
          )}

          {/* Method 2: Wallet */}
          {selectedMethod === 'WALLET' && (
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '13.5px' }}>
                <span style={{ color: '#64748b' }}>Số dư ví hiện tại:</span>
                <strong style={{ color: '#0f172a' }}>{formatVnd(walletBalance || 0)}</strong>
              </div>
              {Number(walletBalance || 0) < amountToPay ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', marginBottom: '14px' }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                  Số dư ví không đủ. Vui lòng nạp thêm tiền hoặc chọn thanh toán qua VietQR.
                </div>
              ) : (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', marginBottom: '14px' }}>
                  <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>
                  Số dư đủ thanh toán. Tiền sẽ được khấu trừ trực tiếp từ ví D2 BadmintonShop.
                </div>
              )}
              <button
                type="button"
                disabled={Number(walletBalance || 0) < amountToPay || isSubmitting || isSuccess}
                onClick={handlePayWithWallet}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: Number(walletBalance || 0) < amountToPay ? '#cbd5e1' : '#059669',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: Number(walletBalance || 0) < amountToPay || isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? (
                  <span><i className="fa-solid fa-spinner fa-spin"></i> Đang xử lý...</span>
                ) : (
                  <span>Xác nhận thanh toán {formatVnd(amountToPay)}</span>
                )}
              </button>
            </div>
          )}

          {/* Success or Error Alert */}
          {message && (
            <div
              style={{
                marginTop: '14px',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                background: isSuccess ? '#ecfdf5' : '#fef2f2',
                color: isSuccess ? '#065f46' : '#b91c1c',
                border: isSuccess ? '1px solid #a7f3d0' : '1px solid #fecaca',
                textAlign: 'center',
                fontWeight: '600'
              }}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
