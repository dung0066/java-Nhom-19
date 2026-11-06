import React, { useState, useEffect, useCallback } from 'react';
import { fetchMyBookings, cancelBooking } from '../../services/api';
import useMembershipStatus from '../../hooks/useMembershipStatus';
import PendingMembershipBanner from './PendingMembershipBanner';
import { formatVnd } from '../../services/payment';
import AccountWalletTab from './AccountWalletTab';
import OrderPayModal from '../booking/OrderPayModal';
import '../../styles/membership.css';

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
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [payingBooking, setPayingBooking] = useState(null);
  const { membership, pending, balance, refresh: loadAccount } = useMembershipStatus(isOpen ? user : null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const userId = user?.id;

  const loadOrders = useCallback(async () => {
    if (!userId) return;
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const list = await fetchMyBookings(userId);
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      setOrders([]);
      setOrdersError(err.message || 'Không thể tải danh sách đơn đặt sân');
    } finally {
      setOrdersLoading(false);
    }
  }, [userId]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Quý khách có chắc chắn muốn hủy đơn đặt sân này không?\n\nToàn bộ số tiền quý khách đã thanh toán (bao gồm cả tiền đặt cọc 50%) sẽ được hoàn trả 100% trực tiếp vào Ví D2 BadmintonShop của quý khách ngay lập tức!')) {
      return;
    }
    try {
      const res = await cancelBooking(orderId);
      const refunded = res?.refundedAmount;
      alert(refunded && refunded > 0
        ? `Đã hủy đơn thành công! Hệ thống đã hoàn trả ${formatVnd(refunded)} về Ví D2 BadmintonShop của bạn.`
        : (res?.message || 'Đã hủy đơn đặt sân thành công! Tiền thanh toán đã được hoàn về ví.'));
      if (userId) loadOrders();
      if (loadAccount) loadAccount();
    } catch (err) {
      alert(`Lỗi khi hủy đơn: ${err.message || 'Không thể hủy đơn lúc này.'}`);
    }
  };

  // Dữ liệu luôn lấy từ máy chủ mỗi lần mở hộp thoại (không dùng dữ liệu mẫu lưu trong trình duyệt)
  useEffect(() => {
    if (isOpen && userId) {
      loadOrders();
    }
  }, [isOpen, userId, loadOrders]);

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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'wallet' ? '#e0f2fe' : 'transparent',
                color: activeTab === 'wallet' ? '#009fe3' : '#64748b',
                fontSize: '13.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fa-solid fa-wallet"></i>
              <span>{isVietnamese ? 'Ví & hội viên' : 'Wallet'}</span>
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
                      {isAdmin ? 'Quản Trị Viên (Admin)' : 'Thành Viên D2 BadmintonShop'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                      {isVietnamese ? 'Đang hoạt động' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <PendingMembershipBanner pending={pending} />

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
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{user.phoneNumber || user.phone || (isVietnamese ? 'Chưa cập nhật' : 'Not set')}</strong>
                </div>

                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                    Email
                  </span>
                  <strong style={{ fontSize: '14px', color: '#0f172a', wordBreak: 'break-all' }}>{user.email || (isVietnamese ? 'Chưa cập nhật' : 'Not set')}</strong>
                </div>

                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                    {isVietnamese ? 'Hạng thành viên' : 'Membership'}
                  </span>
                  {membership ? (
                    <strong style={{ fontSize: '14px', color: '#ea580c' }}>
                      <i className="fa-solid fa-crown" style={{ marginRight: '4px' }}></i>
                      {membership.package?.name}
                      <small style={{ display: 'block', color: '#64748b', fontWeight: 600 }}>
                        {isVietnamese ? 'Giảm' : 'Discount'} {Number(membership.discountPercent) || 0}% · {isVietnamese ? 'hết hạn' : 'expires'}{' '}
                        {membership.expiresAt ? new Date(membership.expiresAt).toLocaleDateString('vi-VN') : ''}
                      </small>
                    </strong>
                  ) : (
                    <strong style={{ fontSize: '14px', color: '#64748b' }}>
                      {isVietnamese ? 'Chưa là hội viên' : 'Not a member'}
                    </strong>
                  )}
                </div>

                <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                    {isVietnamese ? 'Số dư ví' : 'Wallet balance'}
                  </span>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                    {balance === null ? '—' : formatVnd(balance)}
                  </strong>
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
          ) : activeTab === 'wallet' ? (
            /* TAB 3: VÍ & HỘI VIÊN */
            <AccountWalletTab
              balance={balance}
              membership={membership}
              pending={pending}
              onChanged={loadAccount}
              onOpenMembership={() => {
                onClose();
                if (onNavigate) onNavigate('home');
                setTimeout(() => window.dispatchEvent(new Event('d2_open_membership')), 300);
              }}
            />
          ) : (
            /* TAB 2: ORDERS / BOOKING HISTORY */
            <div>
              {ordersLoading ? (
                <div className="mem-state"><i className="fa-solid fa-spinner fa-spin"></i>{isVietnamese ? 'Đang tải đơn đặt sân...' : 'Loading bookings...'}</div>
              ) : ordersError ? (
                <div className="mem-state">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <p>{ordersError}</p>
                  <button type="button" className="mem-btn primary" onClick={loadOrders}>{isVietnamese ? 'Thử lại' : 'Retry'}</button>
                </div>
              ) : orders.length === 0 ? (
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
                <div className="acc-list">
                  {orders.map((ord) => {
                    const discount = Number(ord.discountAmount) || 0;
                    const isDeposited = ord.status === 'DEPOSITED';
                    const isDepositOrder = ord.isDeposit || isDeposited || (ord.notes && ord.notes.includes('COC_50%'));

                    let statusBadge;
                    if (ord.status === 'CONFIRMED' || ord.status === 'COMPLETED') {
                      statusBadge = <span className="acc-status ok"><i className="fa-solid fa-circle-check" style={{ marginRight: '4px' }}></i>{isVietnamese ? 'Đã thanh toán đủ' : 'Fully Paid'}</span>;
                    } else if (isDeposited) {
                      statusBadge = (
                        <span className="acc-status" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                          <i className="fa-solid fa-shield-halved" style={{ marginRight: '4px' }}></i>{isVietnamese ? 'Đã đặt cọc 50%' : '50% Deposited'}
                        </span>
                      );
                    } else if (ord.status === 'PENDING') {
                      statusBadge = <span className="acc-status wait"><i className="fa-solid fa-clock" style={{ marginRight: '4px' }}></i>{isVietnamese ? 'Chờ thanh toán' : 'Pending'}</span>;
                    } else {
                      statusBadge = <span className="acc-status bad">{ord.status}</span>;
                    }

                    return (
                      <div key={ord.id} style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#009fe3', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                            <i className="fa-solid fa-ticket" style={{ marginRight: '4px' }}></i>
                            {ord.bookingCode}
                          </span>
                          {statusBadge}
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                          {ord.branch?.name || ''}
                        </h4>
                        <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '10px' }}>
                          <i className="fa-solid fa-calendar-day" style={{ color: '#009fe3', marginRight: '6px' }}></i>
                          <strong>{ord.bookingDate ? new Date(ord.bookingDate).toLocaleDateString('vi-VN') : ''}</strong>
                          {' · '}{ord.totalHours || 0} {isVietnamese ? 'ca' : 'slots'}
                        </div>

                        {/* Chi tiết cọc nếu là đơn đặt cọc */}
                        {isDepositOrder && (
                          <div style={{ margin: '8px 0', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#059669', fontWeight: '700' }}>
                              <span>Đã cọc 50%:</span>
                              <span>
                                {formatVnd(ord.paidAmount || (ord.totalPrice * 0.5))} {isDeposited || ord.status === 'CONFIRMED' ? '(Đã thanh toán)' : '(Chưa trả)'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ea580c', fontWeight: '700' }}>
                              <span>Còn lại thu tại quầy:</span>
                              <span>
                                {ord.status === 'CONFIRMED' || ord.status === 'COMPLETED' ? '0 đ (Đã thanh toán đủ)' : formatVnd(ord.remainingAmount || (ord.totalPrice * 0.5))}
                              </span>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9', gap: '8px', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{isVietnamese ? 'Tổng tiền' : 'Total'}:</span>
                            <strong style={{ fontSize: '16px', color: '#ea580c', marginLeft: '6px' }}>{formatVnd(ord.totalPrice)}</strong>
                            {discount > 0 && (
                              <small style={{ display: 'block', color: '#059669', fontWeight: 700 }}>
                                {isVietnamese ? 'Đã giảm hội viên' : 'Member discount'} −{formatVnd(discount)}
                              </small>
                            )}
                          </div>
                          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('vi-VN') : ''}
                          </span>
                        </div>

                        {/* Hàng nút hành động: Thanh toán tiếp & Hủy đơn */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                          {ord.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => setPayingBooking(ord)}
                              style={{
                                flex: 1,
                                minWidth: '180px',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: '#ffffff',
                                fontSize: '12.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                              }}
                            >
                              <i className="fa-solid fa-qrcode" style={{ fontSize: '14px' }}></i>
                              <span>
                                {isDepositOrder
                                  ? `Tiếp tục cọc 50% (${formatVnd(ord.depositAmount || (ord.totalPrice * 0.5))})`
                                  : `Thanh toán (${formatVnd(ord.totalPrice)})`}
                              </span>
                            </button>
                          )}

                          {ord.status === 'DEPOSITED' && (
                            <button
                              type="button"
                              onClick={() => setPayingBooking(ord)}
                              style={{
                                flex: 1,
                                minWidth: '180px',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                color: '#ffffff',
                                fontSize: '12.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                              }}
                            >
                              <i className="fa-solid fa-qrcode" style={{ fontSize: '14px' }}></i>
                              <span>Thanh toán nốt 50% ({formatVnd(ord.remainingAmount || (ord.totalPrice * 0.5))})</span>
                            </button>
                          )}

                          {ord.status !== 'CANCELLED' && ord.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(ord.id)}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1.5px solid #fecaca',
                                background: '#fff5f5',
                                color: '#dc2626',
                                fontSize: '12.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                              title="Hủy đơn đặt sân và hoàn tiền 100% về ví"
                            >
                              <i className="fa-solid fa-ban"></i>
                              <span>Hủy đơn</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {payingBooking && (
        <OrderPayModal
          isOpen={!!payingBooking}
          onClose={() => setPayingBooking(null)}
          booking={payingBooking}
          currentUser={user}
          onSuccess={() => {
            setPayingBooking(null);
            loadOrders();
            loadAccount();
          }}
        />
      )}
    </div>
  );
}

