import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { formatVnd } from '../../services/payment';
import { fetchMyBookings, lookupBookingByCode } from '../../services/api';
import OrderPayModal from './OrderPayModal';

export default function OrderHistoryModal({
  isOpen,
  onClose,
  currentUser = null
}) {
  const modalBoxRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [payingBooking, setPayingBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, DEPOSITED, CONFIRMED
  const [searchCode, setSearchCode] = useState('');

  // Tải danh sách đơn đặt sân: kết hợp từ API cá nhân (nếu đã đăng nhập) + localStorage (d2_user_bookings)
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    let combined = [];

    // 1. Đọc từ localStorage (đơn vừa đặt trực tiếp trên trình duyệt này)
    let localBookings = [];
    try {
      const raw = localStorage.getItem('d2_user_bookings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) localBookings = parsed;
      }
    } catch (_) {}

    // 2. Đọc từ Backend SQL nếu có user đăng nhập
    let serverBookings = [];
    const user = currentUser || JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.id) {
      try {
        const list = await fetchMyBookings(user.id);
        if (Array.isArray(list)) serverBookings = list;
      } catch (_) {}
    }

    // Ghép 2 nguồn và khử trùng lặp theo bookingCode / id
    const map = new Map();
    // Ưu tiên đơn từ server nếu có
    serverBookings.forEach((b) => {
      if (b.bookingCode) map.set(b.bookingCode, b);
      else if (b.id) map.set(`ID-${b.id}`, b);
    });
    // Gộp đơn từ local nếu chưa có hoặc cập nhật
    localBookings.forEach((b) => {
      const key = b.bookingCode || `ID-${b.id}`;
      if (!map.has(key)) {
        map.set(key, b);
      } else {
        // Hợp nhất dữ liệu
        map.set(key, { ...b, ...map.get(key) });
      }
    });

    combined = Array.from(map.values());
    // Sắp xếp đơn mới nhất lên đầu
    combined.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.bookingDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.bookingDate || 0).getTime();
      return timeB - timeA;
    });

    setOrders(combined);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      loadOrders();
      if (modalBoxRef.current) {
        gsap.fromTo(
          modalBoxRef.current,
          { scale: 0.92, opacity: 0, y: -20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        );
      }
    }
  }, [isOpen, loadOrders]);

  if (!isOpen) return null;

  const filteredOrders = orders.filter((ord) => {
    if (filterStatus === 'PENDING' && ord.status !== 'PENDING') return false;
    if (filterStatus === 'DEPOSITED' && ord.status !== 'DEPOSITED') return false;
    if (filterStatus === 'CONFIRMED' && ord.status !== 'CONFIRMED' && ord.status !== 'COMPLETED') return false;
    if (searchCode.trim()) {
      const q = searchCode.trim().toLowerCase();
      const code = (ord.bookingCode || '').toLowerCase();
      const name = (ord.customerName || '').toLowerCase();
      const phone = (ord.customerPhone || '').toLowerCase();
      return code.includes(q) || name.includes(q) || phone.includes(q);
    }
    return true;
  });

  const handlePaySuccess = () => {
    // Cập nhật trạng thái trong localStorage nếu cần
    if (payingBooking) {
      try {
        const raw = localStorage.getItem('d2_user_bookings');
        if (raw) {
          const list = JSON.parse(raw);
          const updated = list.map((b) => {
            if (b.bookingCode === payingBooking.bookingCode) {
              const newStatus = payingBooking.isDeposit && payingBooking.status === 'PENDING' ? 'DEPOSITED' : 'CONFIRMED';
              return { ...b, status: newStatus, paymentStatus: 'PAID' };
            }
            return b;
          });
          localStorage.setItem('d2_user_bookings', JSON.stringify(updated));
        }
      } catch (_) {}
    }
    setPayingBooking(null);
    loadOrders();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        ref={modalBoxRef}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              <i className="fa-solid fa-receipt"></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                Lịch Sử Đơn Đặt Sân D2 BadmintonShop
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', opacity: 0.9 }}>
                Quản lý các đơn đặt sân, kiểm tra tình trạng cọc & tiếp tục thanh toán online
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            &times;
          </button>
        </div>

        {/* Filters Bar */}
        <div
          style={{
            padding: '12px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: filterStatus === 'ALL' ? '#0284c7' : '#ffffff',
                color: filterStatus === 'ALL' ? '#ffffff' : '#64748b',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: filterStatus === 'ALL' ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none'
              }}
            >
              Tất Cả ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('PENDING')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: filterStatus === 'PENDING' ? '#f59e0b' : '#ffffff',
                color: filterStatus === 'PENDING' ? '#ffffff' : '#64748b',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Chờ Thanh Toán
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('DEPOSITED')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: filterStatus === 'DEPOSITED' ? '#059669' : '#ffffff',
                color: filterStatus === 'DEPOSITED' ? '#ffffff' : '#64748b',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Đã Cọc 50%
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('CONFIRMED')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: filterStatus === 'CONFIRMED' ? '#10b981' : '#ffffff',
                color: filterStatus === 'CONFIRMED' ? '#ffffff' : '#64748b',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Đã Trả Đủ
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px' }}
              ></i>
              <input
                type="text"
                placeholder="Tìm mã đơn, tên, SĐT..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                style={{
                  padding: '6px 12px 6px 30px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  width: '180px'
                }}
              />
            </div>
            <button
              type="button"
              onClick={loadOrders}
              title="Tải lại danh sách"
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '6px 10px',
                borderRadius: '8px',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              <i className={`fa-solid fa-rotate ${isLoading ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
        </div>

        {/* Body list of orders */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#0284c7', marginBottom: '10px' }}></i>
              <p style={{ margin: 0, fontSize: '14px' }}>Đang tải lịch sử đơn đặt sân...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto',
                  fontSize: '28px',
                  color: '#94a3b8'
                }}
              >
                <i className="fa-solid fa-receipt"></i>
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a' }}>
                {orders.length === 0 ? 'Bạn chưa có đơn đặt sân nào' : 'Không tìm thấy đơn phù hợp'}
              </h4>
              <p style={{ margin: 0, fontSize: '13px' }}>
                {orders.length === 0
                  ? 'Hãy chọn sân đấu tại D2 BadmintonShop và hoàn tất đặt chỗ để bắt đầu trận đấu!'
                  : 'Hãy thử tìm kiếm với từ khóa khác hoặc bấm "Tất Cả".'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredOrders.map((ord, idx) => {
                const isDeposited = ord.status === 'DEPOSITED';
                const isDepositOrder = ord.isDeposit || isDeposited || (ord.notes && ord.notes.includes('COC_50%'));
                const depositVal = Number(ord.depositAmount) || Number(ord.paidAmount) || (Number(ord.totalPrice) * 0.5);
                const remainingVal = Number(ord.remainingAmount) || (Number(ord.totalPrice) * 0.5);

                let badge = null;
                if (ord.status === 'CONFIRMED' || ord.status === 'COMPLETED') {
                  badge = (
                    <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fa-solid fa-circle-check"></i> Đã thanh toán đủ 100%
                    </span>
                  );
                } else if (isDeposited) {
                  badge = (
                    <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #6ee7b7', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fa-solid fa-shield-halved"></i> Đã đặt cọc 50%
                    </span>
                  );
                } else if (ord.status === 'PENDING') {
                  badge = (
                    <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fa-solid fa-clock"></i> Chờ thanh toán
                    </span>
                  );
                } else {
                  badge = (
                    <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                      {ord.status}
                    </span>
                  );
                }

                return (
                  <div
                    key={ord.id || ord.bookingCode || idx}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '16px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '3px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <i className="fa-solid fa-ticket"></i> {ord.bookingCode}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleString('vi-VN') : (ord.bookingDate || '')}
                        </span>
                      </div>
                      <div>{badge}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '13px', marginBottom: '10px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Chi nhánh:</span>{' '}
                        <strong style={{ color: '#0f172a' }}>{ord.branch?.name || ord.branchName || 'D2 BadmintonShop'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Ngày chơi:</span>{' '}
                        <strong style={{ color: '#0f172a' }}>{ord.bookingDate || ord.date || ''}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Khách hàng:</span>{' '}
                        <strong style={{ color: '#0f172a' }}>{ord.customerName}</strong> ({ord.customerPhone})
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Tổng giá trị đơn:</span>{' '}
                        <strong style={{ color: '#ea580c', fontSize: '14.5px' }}>{formatVnd(ord.totalPrice)}</strong>
                      </div>
                    </div>

                    {/* Breakdown tiền cọc nếu có */}
                    {isDepositOrder && (
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          fontSize: '12.5px',
                          marginBottom: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}
                      >
                        <div style={{ color: '#059669', fontWeight: '700' }}>
                          <i className="fa-solid fa-circle-check" style={{ marginRight: '5px' }}></i>
                          Tiền cọc 50%: <strong>{formatVnd(depositVal)}</strong> {isDeposited || ord.status === 'CONFIRMED' ? '(Đã thanh toán)' : '(Cần thanh toán)'}
                        </div>
                        <div style={{ color: '#ea580c', fontWeight: '700' }}>
                          <i className="fa-solid fa-coins" style={{ marginRight: '5px' }}></i>
                          Còn lại: <strong>{ord.status === 'CONFIRMED' || ord.status === 'COMPLETED' ? '0 đ' : formatVnd(remainingVal)}</strong> {ord.status === 'CONFIRMED' ? '(Đã xong)' : '(Thu tại quầy / online)'}
                        </div>
                      </div>
                    )}

                    {/* NÚT TIẾP TỤC THANH TOÁN (VIETQR / VÍ) */}
                    {ord.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => setPayingBooking(ord)}
                        style={{
                          width: '100%',
                          padding: '11px 16px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          color: '#ffffff',
                          fontSize: '13.5px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                        }}
                      >
                        <i className="fa-solid fa-qrcode" style={{ fontSize: '15px' }}></i>
                        <span>
                          {isDepositOrder
                            ? `Tiếp tục thanh toán cọc 50% (${formatVnd(depositVal)})`
                            : `Tiếp tục thanh toán đơn hàng (${formatVnd(ord.totalPrice)})`}
                        </span>
                      </button>
                    )}

                    {isDeposited && (
                      <button
                        type="button"
                        onClick={() => setPayingBooking(ord)}
                        style={{
                          width: '100%',
                          padding: '11px 16px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          color: '#ffffff',
                          fontSize: '13.5px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                        }}
                      >
                        <i className="fa-solid fa-qrcode" style={{ fontSize: '15px' }}></i>
                        <span>
                          Tiếp tục thanh toán nốt 50% online ({formatVnd(remainingVal)})
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            <i className="fa-solid fa-shield-halved" style={{ color: '#0284c7', marginRight: '6px' }}></i>
            Thanh toán VietQR tự động qua ACB <strong>18900291</strong> DAO DUY DUNG
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Đóng
          </button>
        </div>
      </div>

      {/* MODAL THANH TOÁN TIẾP TỤC VỚI MÃ QR TỰ ĐỘNG */}
      {payingBooking && (
        <OrderPayModal
          isOpen={!!payingBooking}
          onClose={() => setPayingBooking(null)}
          booking={payingBooking}
          currentUser={currentUser}
          onSuccess={handlePaySuccess}
        />
      )}
    </div>
  );
}
