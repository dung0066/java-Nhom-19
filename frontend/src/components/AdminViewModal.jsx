import React, { useState, useEffect } from 'react';
import { Shield, X, RefreshCw, Trash2, Calendar, MapPin, User, CheckCircle2, Clock, DollarSign, ListFilter } from 'lucide-react';
import { fetchAllBookings, cancelBooking } from '../services/api';

export default function AdminViewModal({ isOpen, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterBranch, setFilterBranch] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      loadBookings();
    }
  }, [isOpen]);

  const loadBookings = async () => {
    setIsLoading(true);
    const data = await fetchAllBookings();
    setBookings(data || []);
    setIsLoading(false);
  };

  const handleCancel = async (id) => {
    if (window.confirm('Xác nhận hủy đơn đặt sân này trong hệ thống?')) {
      await cancelBooking(id);
      loadBookings();
    }
  };

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  if (!isOpen) return null;

  const filtered = bookings.filter((b) => {
    if (filterBranch === 'ALL') return true;
    return b.branch && b.branch.code === filterBranch;
  });

  const totalRev = filtered
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel large-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="modal-header-section">
          <div className="admin-badge-row">
            <span className="admin-tag">
              <Shield size={13} /> QUẢN TRỊ VIÊN WAYS STATION
            </span>
            <button type="button" onClick={loadBookings} className="btn-refresh-admin" title="Tải lại dữ liệu">
              <RefreshCw size={13} className={isLoading ? 'spin-icon' : ''} />
              <span>Làm mới</span>
            </button>
          </div>
          <h3 className="modal-heading">Bảng Điều Khiển & Danh Sách Đơn Đặt Sân</h3>
          <p className="modal-sub">Dữ liệu đồng bộ trực tiếp từ Spring Boot Backend API (/api/booking/all)</p>
        </div>

        {/* Quick Admin Stats */}
        <div className="admin-stats-strip">
          <div className="admin-stat-box">
            <span className="stat-label">Tổng Số Đơn</span>
            <span className="stat-value">{filtered.length}</span>
          </div>
          <div className="admin-stat-box">
            <span className="stat-label">Đơn Thành Công</span>
            <span className="stat-value text-emerald">
              {filtered.filter((b) => b.status === 'CONFIRMED').length}
            </span>
          </div>
          <div className="admin-stat-box">
            <span className="stat-label">Đơn Đã Hủy</span>
            <span className="stat-value text-muted">
              {filtered.filter((b) => b.status === 'CANCELLED').length}
            </span>
          </div>
          <div className="admin-stat-box">
            <span className="stat-label">Tổng Doanh Thu</span>
            <span className="stat-value text-emerald">{formatVND(totalRev)}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="admin-filter-bar">
          <div className="filter-group">
            <ListFilter size={14} className="text-muted" />
            <span>Lọc chi nhánh:</span>
            <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
              <option value="ALL">Tất cả chi nhánh</option>
              <option value="NVL">Ways Station NVL</option>
              <option value="DQII">Ways Station DQII</option>
              <option value="NQA">Ways Station NQA</option>
              <option value="HB">Ways Station HB</option>
            </select>
          </div>
        </div>

        {/* Table of Bookings */}
        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng & SĐT</th>
                <th>Chi Nhánh</th>
                <th>Ngày Chơi</th>
                <th>Tổng Giờ</th>
                <th>Thành Tiền</th>
                <th>Phương Thức</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">Chưa có đơn đặt sân nào</td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id || b.bookingCode}>
                    <td><strong>{b.bookingCode}</strong></td>
                    <td>
                      <div>{b.customerName}</div>
                      <small className="text-muted">{b.customerPhone}</small>
                    </td>
                    <td>{b.branch?.code || 'NVL'}</td>
                    <td>{b.bookingDate}</td>
                    <td>{b.totalHours || 1}h</td>
                    <td><strong className="text-emerald">{formatVND(b.totalPrice)}</strong></td>
                    <td>{b.paymentMethod || 'VIETQR'}</td>
                    <td>
                      <span className={`status-pill ${b.status === 'CANCELLED' ? 'cancelled' : 'confirmed'}`}>
                        {b.status === 'CANCELLED' ? 'ĐÃ HỦY' : 'CONFIRMED'}
                      </span>
                    </td>
                    <td>
                      {b.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={() => handleCancel(b.id)}
                          className="btn-admin-cancel"
                          title="Hủy đơn"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
