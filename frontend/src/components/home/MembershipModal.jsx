import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchMembershipPackages, buyMembershipPackage } from '../../services/api';

export default function MembershipModal({ isOpen, onClose }) {
  const { currentUser, isLoggedIn, openAuthModal, refreshUser } = useAuth();
  const { isVietnamese } = useLanguage();
  const modalBoxRef = useRef(null);

  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [step, setStep] = useState(1); // 1: List packages, 2: Checkout/Payment, 3: Success
  const [paymentMethod, setPaymentMethod] = useState('VIETQR');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState(null);

  // Load packages on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMsg('');
      setReceipt(null);
      const load = async () => {
        try {
          const list = await fetchMembershipPackages();
          if (list && list.length > 0) {
            setPackages(list);
            setSelectedPackage(list[1] || list[0]); // default to Gold or first
          }
        } catch (e) {
          console.error('Error fetching membership packages:', e);
        }
      };
      load();

      if (modalBoxRef.current) {
        gsap.fromTo(
          modalBoxRef.current,
          { scale: 0.85, autoAlpha: 0, y: -25 },
          { scale: 1, autoAlpha: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectToBuy = (pkg) => {
    setSelectedPackage(pkg);
    if (!isLoggedIn) {
      onClose();
      openAuthModal('login');
      return;
    }
    setStep(2);
  };

  const handleConfirmPurchase = async () => {
    if (!currentUser?.id || !selectedPackage?.id) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await buyMembershipPackage(
        currentUser.id,
        selectedPackage.id,
        paymentMethod,
        notes
      );
      setReceipt(res);
      await refreshUser();
      setStep(3);
    } catch (err) {
      setErrorMsg(err.message || 'Không thể đăng ký gói hội viên lúc này, vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  // VietQR URL builder
  const vietQrUrl = selectedPackage && currentUser
    ? `https://api.vietqr.io/image/970436-102874136458-qr_only.jpg?amount=${selectedPackage.price}&addInfo=${encodeURIComponent(`VIP_${currentUser.username}_${selectedPackage.code}`)}`
    : '';

  return (
    <div
      className="membership-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="membership-modal-box"
        ref={modalBoxRef}
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            padding: '24px 28px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.5px'
              }}
            >
              WAYS STATION BADMINTON VIP CLUB
            </span>
            <h2 style={{ margin: '8px 0 2px', fontSize: '20px', fontWeight: 800 }}>
              <i className="fa-solid fa-crown" style={{ marginRight: '8px' }}></i>
              {isVietnamese ? 'Đặc Quyền Hội Viên Thân Thiết VIP' : 'VIP Membership Privileges'}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.95 }}>
              {isVietnamese
                ? 'Giảm trực tiếp đến 10% giờ chơi, gửi đồ miễn phí, sấy khử khuẩn giày và ưu tiên giữ sân vàng'
                : 'Save up to 10% on all court hours, free lockers & priority reservations'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            &times;
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: CHỌN GÓI HỘI VIÊN */}
          {step === 1 && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}
              >
                {packages.map((pkg) => {
                  const isGold = pkg.code === 'GOLD';
                  const isSelected = selectedPackage?.id === pkg.id;
                  const borderCol = isSelected ? '#f59e0b' : '#e2e8f0';

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      style={{
                        background: isGold ? '#fffbeb' : '#fff',
                        border: `2px solid ${borderCol}`,
                        borderRadius: '16px',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: isSelected ? '0 10px 25px -5px rgba(245, 158, 11, 0.25)' : 'none',
                        transform: isSelected ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      {isGold && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '16px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}
                        >
                          PHỔ BIẾN NHẤT
                        </span>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <i
                          className={pkg.icon || 'fa-solid fa-medal'}
                          style={{ color: pkg.badgeColor || '#f59e0b', fontSize: '20px' }}
                        ></i>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                          {pkg.name}
                        </h4>
                      </div>

                      <div style={{ margin: '8px 0 12px' }}>
                        <span style={{ fontSize: '22px', fontWeight: 900, color: '#f59e0b' }}>
                          {(pkg.price || 0).toLocaleString('vi-VN')} đ
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>
                          / {pkg.durationDays} ngày
                        </span>
                      </div>

                      <div
                        style={{
                          background: '#f1f5f9',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#0284c7',
                          marginBottom: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <i className="fa-solid fa-percent"></i>
                        <span>Giảm {pkg.discountPercent}% giá sân thi đấu</span>
                      </div>

                      <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: '0 0 16px', flex: 1 }}>
                        {pkg.description}
                      </p>

                      {pkg.perks && (
                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', fontSize: '11.5px', color: '#64748b' }}>
                          {pkg.perks.split(';').map((p, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                              <i className="fa-solid fa-check" style={{ color: '#10b981', marginTop: '2px', fontSize: '10px' }}></i>
                              <span>{p.trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectToBuy(pkg);
                        }}
                        style={{
                          marginTop: '16px',
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          border: 'none',
                          background: isSelected
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            : '#e2e8f0',
                          color: isSelected ? '#fff' : '#334155',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <i className="fa-solid fa-crown" style={{ marginRight: '6px' }}></i>
                        {isLoggedIn ? (isVietnamese ? 'Nâng Cấp Gói Này' : 'Select Plan') : (isVietnamese ? 'Đăng Nhập Để Mua' : 'Sign In To Buy')}
                      </button>
                    </div>
                  );
                })}
              </div>

              {!isLoggedIn && (
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-user-lock" style={{ color: '#0284c7', fontSize: '20px' }}></i>
                    <div>
                      <strong style={{ color: '#1e3a8a', fontSize: '13.5px' }}>
                        {isVietnamese ? 'Bạn chưa đăng nhập tài khoản' : 'You are not logged in'}
                      </strong>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#1d4ed8' }}>
                        {isVietnamese
                          ? 'Vui lòng đăng nhập hoặc tạo tài khoản để hệ thống lưu trữ thông tin hội viên của bạn.'
                          : 'Please log in to link VIP membership to your account.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAuthModal('login');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer'
                    }}
                  >
                    {isVietnamese ? 'Đăng Nhập Ngay' : 'Sign In Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: XÁC NHẬN THANH TOÁN (VIETQR / VÍ / TIỀN MẶT) */}
          {step === 2 && selectedPackage && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Left: Summary */}
                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#334155' }}>
                    {isVietnamese ? '1. THÔNG TIN GÓI VIP ĐÃ CHỌN' : '1. SELECTED VIP PLAN'}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#f59e0b' }}>
                      <i className={selectedPackage.icon || 'fa-solid fa-crown'}></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{selectedPackage.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Thời hạn: {selectedPackage.durationDays} ngày</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '12px 0', margin: '12px 0', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Chiết khấu giờ chơi:</span>
                      <strong style={{ color: '#10b981' }}>Giảm {selectedPackage.discountPercent}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Tài khoản kích hoạt:</span>
                      <strong>{currentUser.username} ({currentUser.fullName})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Số điện thoại:</span>
                      <strong>{currentUser.phone || 'Chưa có'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#334155', fontSize: '14px' }}>Tổng thanh toán:</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#f59e0b' }}>
                      {(selectedPackage.price || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {/* Payment Method Selector */}
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      {isVietnamese ? 'Chọn phương thức thanh toán:' : 'Payment method:'}
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', border: paymentMethod === 'VIETQR' ? '2px solid #0284c7' : '1px solid #cbd5e1', background: paymentMethod === 'VIETQR' ? '#f0f9ff' : '#fff', cursor: 'pointer', fontSize: '13px' }}>
                        <input type="radio" name="paymethod" checked={paymentMethod === 'VIETQR'} onChange={() => setPaymentMethod('VIETQR')} />
                        <span style={{ fontWeight: 700, color: '#0284c7' }}>🏦 Chuyển khoản VietQR (Kích hoạt tức thì)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', border: paymentMethod === 'WALLET' ? '2px solid #0284c7' : '1px solid #cbd5e1', background: paymentMethod === 'WALLET' ? '#f0f9ff' : '#fff', cursor: 'pointer', fontSize: '13px' }}>
                        <input type="radio" name="paymethod" checked={paymentMethod === 'WALLET'} onChange={() => setPaymentMethod('WALLET')} />
                        <span style={{ fontWeight: 700, color: '#059669' }}>💳 Ví Ways Station (Dư: {(currentUser.walletBalance || 0).toLocaleString('vi-VN')} đ)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', border: paymentMethod === 'CASH' ? '2px solid #0284c7' : '1px solid #cbd5e1', background: paymentMethod === 'CASH' ? '#f0f9ff' : '#fff', cursor: 'pointer', fontSize: '13px' }}>
                        <input type="radio" name="paymethod" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} />
                        <span style={{ fontWeight: 700, color: '#475569' }}>💵 Thanh toán tiền mặt tại quầy lễ tân</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right: VietQR Code & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', textAlign: 'center' }}>
                  {paymentMethod === 'VIETQR' ? (
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0369a1', marginBottom: '10px' }}>
                        QUÉT MÃ VIETQR ĐỂ KÍCH HOẠT VIP
                      </div>
                      <img
                        src={vietQrUrl}
                        alt="VietQR Code"
                        style={{ width: '210px', height: '210px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      />
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '10px' }}>
                        Ngân hàng: <strong>VietinBank</strong> • STK: <strong>102874136458</strong><br />
                        Nội dung: <strong>VIP_{currentUser.username}_{selectedPackage.code}</strong>
                      </div>
                    </div>
                  ) : paymentMethod === 'WALLET' ? (
                    <div style={{ padding: '20px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>💳</div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>Thanh toán từ số dư ví</h4>
                      <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px' }}>
                        Hệ thống sẽ trừ trực tiếp {(selectedPackage.price || 0).toLocaleString('vi-VN')} đ từ ví Ways Station của bạn.
                      </p>
                    </div>
                  ) : (
                    <div style={{ padding: '20px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>💵</div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>Thanh toán tại quầy lễ tân</h4>
                      <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '6px' }}>
                        Nhân viên tại chi nhánh sẽ xác nhận thu tiền và kích hoạt ngay khi bạn đến nhận sân.
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#475569',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Quay Lại
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleConfirmPurchase}
                      style={{
                        flex: 2,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          <span>Đang kích hoạt...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-circle-check"></i>
                          <span>Xác Nhận Kích Hoạt VIP</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: THÀNH CÔNG */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                <i className="fa-solid fa-check"></i>
              </div>

              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                🎉 {isVietnamese ? 'Chúc Mừng Bạn Đã Trở Thành Hội Viên VIP!' : 'Welcome to the VIP Club!'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '13.5px', margin: '8px 0 20px' }}>
                {receipt?.message || 'Gói hội viên của bạn đã được kích hoạt thành công trên toàn hệ thống 4 chi nhánh.'}
              </p>

              <div
                style={{
                  maxWidth: '380px',
                  margin: '0 auto 24px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Gói VIP:</span>
                  <strong style={{ color: '#f59e0b' }}>{selectedPackage?.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Ưu đãi giờ chơi:</span>
                  <strong style={{ color: '#10b981' }}>Giảm {selectedPackage?.discountPercent}% tự động</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Trạng thái:</span>
                  <strong style={{ color: '#10b981' }}>ACTIVE (Đang hoạt động)</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {isVietnamese ? 'Bắt Đầu Đặt Sân Nhận Ưu Đãi' : 'Start Booking Courts'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
