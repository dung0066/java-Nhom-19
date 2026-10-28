import React, { useState, useEffect } from 'react';

export default function AccountModal({
  isOpen,
  onClose,
  initialTab = 'profile',
  user,
  onNavigate,
  isVietnamese = true
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem('d2_user_bookings');
        if (raw) {
          const parsed = JSON.parse(raw);
          setOrders(Array.isArray(parsed) ? parsed : []);
        } else {
          // Default sample demo order if none in localStorage
          setOrders([
            {
              id: 1,
              bookingCode: 'D2-849201',
              branchName: 'D2 Shop Nguyễn Văn Lượng - Gò Vấp',
              courtName: 'Sân 03 (Thảm Taraflex BWF)',
              playDate: 'Hôm nay',
              timeRange: '18:00 - 19:30 (3 ca)',
              totalPrice: 180000,
              paymentType: 'VIETQR (MB Bank)',
              status: 'CONFIRMED',
              createdAt: new Date().toLocaleDateString('vi-VN')
            }
          ]);
        }
      } catch {
        setOrders([]);
      }
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' || user.username === 'admin';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'profile' ? '#e0f2fe' : 'transparent',
                color: activeTab === 'profile' ? '#009fe3' : '#64748b',
                fontSize: '13.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fa-solid fa-user"></i>
              <span>{isVietnamese ? 'Thông tin người dùng' : 'User Profile'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'orders' ? '#e0f2fe' : 'transparent',
                color: activeTab === 'orders' ? '#009fe3' : '#64748b',
                fontSize: '13.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fa-solid fa-receipt"></i>
              <span>{isVietnamese ? 'Đơn hàng đã đặt' : 'Bookings'}</span>
              <span style={{ background: activeTab === 'orders' ? '#009fe3' : '#cbd5e1', color: '#fff', fontSize: '11px', padding: '1px 6px', borderRadius: '10px' }}>
                {orders.length}
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              color: '#64748b',
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
        <div style={{ padding: '22px 24px', overflowY: 'auto' }}>
          {activeTab === 'profile' ? (
            /* TAB 1: USER INFO */
            <div>
              {/* Profile Card Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #009fe3 0%, #0060df 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', flexShrink: 0, boxShadow: '0 4px 12px rgba(0, 159, 227, 0.3)' }}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                    {user.fullName || user.username}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: isAdmin ? '#fee2e2' : '#e0f2fe', color: isAdmin ? '#dc2626' : '#009fe3', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                      {isAdmin ? 'Quản Trị Viên (Admin)' : 'Thành Viên D2 Shop'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                      {isVietnamese ? 'Đang hoạt động' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Info Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                    {isVietnamese ? 'Tên đăng nhập' : 'Username'}
                  </span>
                  <strong style={{ fontSize: '14px', color: '#0f172a', wordBreak: 'break-all' }}>{user.username}</strong>
                </div>

                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                    {isVietnamese ? 'Số điện thoại' : 'Phone'}
                  </span>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{user.phoneNumber || user.phone || '0914 977 030'}</strong>
                </div>

                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                    Email
                  </span>
                  <strong style={{ fontSize: '14px', color: '#0f172a', wordBreak: 'break-all' }}>{user.email || `${user.username}@d2shop.vn`}</strong>
                </div>

                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                    {isVietnamese ? 'Hạng thành viên' : 'Membership'}
                  </span>
                  <strong style={{ fontSize: '14px', color: '#ea580c' }}>
                    <i className="fa-solid fa-crown" style={{ marginRight: '4px' }}></i> VIP Member
                  </strong>
                </div>

                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                    {isVietnamese ? 'Ngày tham gia' : 'Joined'}
                  </span>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>2026-10-28</strong>
                </div>
              </div>

              {/* Action Button */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('admin');
                  }}
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#002d62',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="fa-solid fa-gauge-high"></i>
                  <span>{isVietnamese ? 'Truy Cập Trang Quản Trị' : 'Go to Admin Dashboard'}</span>
                </button>
              )}
            </div>
          ) : (
            /* TAB 2: ORDERS / BOOKING HISTORY */
            <div>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                  <i className="fa-solid fa-receipt" style={{ fontSize: '42px', color: '#cbd5e1', marginBottom: '12px' }}></i>
                  <h4 style={{ fontSize: '16px', color: '#0f172a', margin: '0 0 6px 0' }}>
                    {isVietnamese ? 'Chưa có đơn đặt sân nào' : 'No bookings found'}
                  </h4>
                  <p style={{ fontSize: '13px', margin: '0 0 18px 0' }}>
                    {isVietnamese ? 'Hãy chọn khung giờ và đặt sân ngay hôm nay!' : 'Pick your favorite slot and book today!'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate('booking');
                    }}
                    style={{
                      background: '#009fe3',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {isVietnamese ? 'Đặt sân ngay' : 'Book Now'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {orders.map((ord, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '16px',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#009fe3', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                          <i className="fa-solid fa-ticket" style={{ marginRight: '4px' }}></i>
                          {ord.bookingCode || `#D2-${100000 + idx}`}
                        </span>
                        <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                          ✓ {isVietnamese ? 'Đã xác nhận' : 'Confirmed'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                        {ord.branchName || 'D2 Shop - Gò Vấp'}
                      </h4>

                      <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                        <div>
                          <i className="fa-solid fa-calendar-day" style={{ color: '#009fe3', marginRight: '6px' }}></i>
                          <strong>{ord.playDate || ord.date || 'Hôm nay'}</strong> • {ord.timeRange || (ord.slots && ord.slots.length ? `${ord.slots.length} ca` : '18:00 - 19:30')}
                        </div>
                        <div>
                          <i className="fa-solid fa-credit-card" style={{ color: '#10b981', marginRight: '6px' }}></i>
                          {ord.paymentType || 'VietQR MB Bank'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{isVietnamese ? 'Tổng tiền' : 'Total'}:</span>
                          <strong style={{ fontSize: '16px', color: '#ea580c', marginLeft: '6px' }}>
                            {(ord.totalPrice || 180000).toLocaleString('vi-VN')} đ
                          </strong>
                        </div>
                        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                          {ord.createdAt || new Date().toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

