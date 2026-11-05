import React, { useCallback, useEffect, useState } from 'react';
import { fetchAdminUserDetail, fetchMyBookings } from '../../services/api';
import { formatVnd } from '../../services/payment';
import ModalPortal from './ModalPortal';
import '../../styles/membership.css';

const ROLE_LABEL = { ROLE_ADMIN: 'Quản trị viên', ROLE_STAFF: 'Nhân viên', ROLE_USER: 'Khách hàng' };
const STATUS_LABEL = { ACTIVE: 'Đang hoạt động', LOCKED: 'Đã khóa', DELETED: 'Đã xóa' };
const BOOKING_STATUS = {
  PENDING: ['Chờ thanh toán', 'wait'],
  CONFIRMED: ['Đã xác nhận', 'ok'],
  COMPLETED: ['Đã hoàn tất', 'ok'],
  CANCELLED: ['Đã hủy', 'bad'],
  EXPIRED: ['Hết hạn', 'bad'],
  NO_SHOW: ['Không đến', 'bad']
};

const fmtDateTime = (v) => (v ? new Date(v).toLocaleString('vi-VN') : '—');
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('vi-VN') : '—');

function Field({ label, children }) {
  return (
    <div style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
      <strong style={{ fontSize: '14px', color: '#0f172a', overflowWrap: 'anywhere' }}>{children}</strong>
    </div>
  );
}

/**
 * Hộp thoại xem thông tin đầy đủ của một tài khoản (hồ sơ, ví, hội viên, thống kê)
 * và toàn bộ đơn đặt sân của tài khoản đó. Dữ liệu lấy từ máy chủ mỗi lần mở.
 */
export default function AdminUserDetailModal({ user, initialTab = 'info', onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState('');

  const userId = user?.id;

  const loadDetail = useCallback(async () => {
    setDetail(null);
    setDetailError('');
    try {
      setDetail(await fetchAdminUserDetail(userId));
    } catch (err) {
      setDetailError(err.message || 'Không thể tải thông tin tài khoản');
    }
  }, [userId]);

  const loadOrders = useCallback(async () => {
    setOrders(null);
    setOrdersError('');
    try {
      const list = await fetchMyBookings(userId);
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      setOrdersError(err.message || 'Không thể tải danh sách đơn đặt sân');
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    loadDetail();
    loadOrders();
  }, [userId, loadDetail, loadOrders]);

  if (!user) return null;

  const u = detail?.user;
  const stats = detail?.stats;

  return (
    <ModalPortal><div className="admin-modal-backdrop show" onClick={onClose}>
      <div className="admin-modal-box" style={{ maxWidth: '860px', width: '96%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>
            <i className="fa-solid fa-id-card"></i> {user.fullName || user.username} <small style={{ color: '#64748b' }}>(@{user.username})</small>
          </h3>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Đóng">&times;</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', padding: '10px 20px 0', flexWrap: 'wrap' }}>
          <button type="button" className={`btn-tbl ${tab === 'info' ? 'btn-tbl-view' : ''}`} onClick={() => setTab('info')}>
            <i className="fa-solid fa-user"></i> Thông tin
          </button>
          <button type="button" className={`btn-tbl ${tab === 'orders' ? 'btn-tbl-view' : ''}`} onClick={() => setTab('orders')}>
            <i className="fa-solid fa-receipt"></i> Tất cả đơn hàng{orders ? ` (${orders.length})` : ''}
          </button>
        </div>

        <div style={{ padding: '16px 20px 20px', overflowY: 'auto' }}>
          {tab === 'info' && (
            <>
              {!detail && !detailError && <div className="mem-state"><i className="fa-solid fa-spinner fa-spin"></i>Đang tải thông tin...</div>}
              {detailError && (
                <div className="mem-state">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <p>{detailError}</p>
                  <button type="button" className="mem-btn primary" onClick={loadDetail}>Thử lại</button>
                </div>
              )}
              {detail && (
                <>
                  <h4 style={{ margin: '0 0 8px' }}>Hồ sơ</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                    <Field label="ID">#{u.id}</Field>
                    <Field label="Tên đăng nhập">{u.username}</Field>
                    <Field label="Họ và tên">{u.fullName || '—'}</Field>
                    <Field label="Số điện thoại">{u.phone || '—'}</Field>
                    <Field label="Email">{u.email || '—'}</Field>
                    <Field label="Vai trò">{ROLE_LABEL[u.role] || u.role}</Field>
                    <Field label="Trạng thái">{STATUS_LABEL[u.status] || u.status}</Field>
                    <Field label="Xác thực sinh viên">{u.studentVerifiedAt ? `Đã xác thực (${fmtDate(u.studentVerifiedAt)})` : 'Chưa xác thực'}</Field>
                    <Field label="Ngày tạo tài khoản">{fmtDateTime(u.createdAt)}</Field>
                    <Field label="Cập nhật lần cuối">{fmtDateTime(u.updatedAt)}</Field>
                  </div>

                  <h4 style={{ margin: '0 0 8px' }}>Ví và hội viên</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                    <Field label="Số dư ví">{formatVnd(detail.walletBalance)}</Field>
                    <Field label="Gói hội viên">
                      {detail.membership
                        ? `${detail.membership.packageName} (giảm ${Number(detail.membership.discountPercent)}%)`
                        : 'Chưa là hội viên'}
                    </Field>
                    {detail.membership && <Field label="Hiệu lực">{fmtDate(detail.membership.startDate)} – {fmtDate(detail.membership.endDate)}</Field>}
                    {detail.pendingMembership && (
                      <Field label="Gói đang chờ thanh toán">
                        {detail.pendingMembership.packageName} ({formatVnd(detail.pendingMembership.pricePaid)}) · {detail.pendingMembership.subscriptionCode}
                      </Field>
                    )}
                  </div>

                  <h4 style={{ margin: '0 0 8px' }}>Thống kê đơn đặt sân</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                    <Field label="Tổng số đơn">{stats.totalBookings}</Field>
                    <Field label="Chờ thanh toán">{stats.pendingBookings}</Field>
                    <Field label="Đã xác nhận">{stats.confirmedBookings}</Field>
                    <Field label="Đã hoàn tất">{stats.completedBookings}</Field>
                    <Field label="Đã hủy">{stats.cancelledBookings}</Field>
                    <Field label="Tổng đã chi">{formatVnd(stats.totalSpent)}</Field>
                    <Field label="Đặt gần nhất">{fmtDateTime(stats.lastBookingAt)}</Field>
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'orders' && (
            <>
              {!orders && !ordersError && <div className="mem-state"><i className="fa-solid fa-spinner fa-spin"></i>Đang tải đơn đặt sân...</div>}
              {ordersError && (
                <div className="mem-state">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <p>{ordersError}</p>
                  <button type="button" className="mem-btn primary" onClick={loadOrders}>Thử lại</button>
                </div>
              )}
              {orders && orders.length === 0 && <div className="mem-state"><i className="fa-solid fa-receipt"></i>Tài khoản này chưa có đơn đặt sân nào.</div>}
              {orders && orders.length > 0 && (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Chi nhánh</th>
                        <th>Ngày chơi</th>
                        <th>Số ca</th>
                        <th>Tổng tiền</th>
                        <th>Giảm giá</th>
                        <th>Trạng thái</th>
                        <th>Ngày đặt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => {
                        const [label, cls] = BOOKING_STATUS[o.status] || [o.status, ''];
                        return (
                          <tr key={o.id}>
                            <td><strong>{o.bookingCode}</strong></td>
                            <td>{o.branch?.name || '—'}</td>
                            <td>{fmtDate(o.bookingDate)}</td>
                            <td>{o.totalHours ?? 0}</td>
                            <td><strong style={{ color: '#ea580c' }}>{formatVnd(o.totalPrice)}</strong></td>
                            <td>{o.status !== 'CANCELLED' && Number(o.discountAmount) > 0 ? `−${formatVnd(o.discountAmount)}` : '—'}</td>
                            <td><span className={`acc-status ${cls}`}>{label}</span></td>
                            <td>{fmtDateTime(o.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div></ModalPortal>
  );
}
