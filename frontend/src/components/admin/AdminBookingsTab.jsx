import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AdminBookingsTab({
  bookings = [],
  onRefresh,
  onConfirmPayment,
  onCheckinBooking,
  onPayRemaining,
  onCancelBooking,
  isLoading
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const statsGridRef = useRef(null);
  const tableBodyRef = useRef(null);

  // Calculations for Stats
  let totalRevenue = 0;
  let totalHours = 0;
  const totalBookings = bookings.length;
  let pendingCount = 0;

  bookings.forEach((b) => {
    if (b.status === 'PENDING' || b.status === 'WAITING_PAYMENT') {
      pendingCount++;
    }
    // Doanh thu chỉ tính đơn đã xác nhận thanh toán; đơn chờ thanh toán hoặc đã hủy chưa tính
    if (b.status === 'CONFIRMED' || b.status === 'COMPLETED') {
      totalRevenue += b.totalPrice ?? b.totalAmount ?? 0;
    }
    if (b.status !== 'CANCELLED') {
      totalHours += b.details ? b.details.length : 1;
    }
  });

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchQuery =
      !q ||
      (b.bookingCode && b.bookingCode.toLowerCase().includes(q)) ||
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.customerPhone && b.customerPhone.toLowerCase().includes(q));

    const branchCode = b.branch?.code || b.branchCode || '';
    const matchBranch = !branchFilter || branchCode === branchFilter;
    const matchStatus = !statusFilter || b.status === statusFilter;

    return matchQuery && matchBranch && matchStatus;
  });

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, branchFilter, statusFilter, pageSize]);

  // Paginated Data
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredBookings.length);
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // GSAP: Animate Stats Cards on initial load
  useEffect(() => {
    if (statsGridRef.current && statsGridRef.current.children.length > 0) {
      gsap.fromTo(
        statsGridRef.current.children,
        { autoAlpha: 0, y: 16, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, []);

  // GSAP: Animate Table Rows on pagination/filter change
  useEffect(() => {
    if (tableBodyRef.current && tableBodyRef.current.children.length > 0) {
      gsap.fromTo(
        tableBodyRef.current.children,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.22, ease: 'power1.out' }
      );
    }
  }, [currentPage, pageSize, searchTerm, branchFilter, statusFilter, bookings]);

  return (
    <section id="bookingsTab" className="tab-pane">
      {/* 1. STATS CARDS */}
      <div className="stats-grid" ref={statsGridRef}>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fa-solid fa-receipt"></i>
          </div>
          <div className="stat-meta">
            <h4>Tổng Đơn Đặt Sân</h4>
            <div className="stat-val">{totalBookings}</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">
            <i className="fa-solid fa-money-bill-wave"></i>
          </div>
          <div className="stat-meta">
            <h4>Doanh Thu Đặt Sân</h4>
            <div className="stat-val">
              {totalRevenue.toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className="stat-meta">
            <h4>Tổng Giờ Đã Đặt</h4>
            <div className="stat-val">{totalHours}h</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">
            <i className="fa-solid fa-bell"></i>
          </div>
          <div className="stat-meta">
            <h4>Đơn Cần Xử Lý</h4>
            <div className="stat-val">{pendingCount}</div>
          </div>
        </div>
      </div>

      {/* 2. TABLE CARD */}
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3 style={{ margin: 0 }}>
              <i className="fa-solid fa-list-check"></i> Danh Sách Khách Đặt Sân Trực Tuyến
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: '4px 0 0 0' }}>
              Quản lý tất cả đơn đặt sân thực tế của khách hàng, xác nhận duyệt đơn, check-in vào sân và xử lý hủy đơn
            </p>
          </div>
          <div className="filter-tools-row">
            <div className="input-search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Tìm theo Mã đơn, Tên KH, Số ĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select-filter"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">Tất cả chi nhánh</option>
              <option value="NVL">D2 NVL (Gò Vấp)</option>
              <option value="DQII">D2 DQII (Gò Vấp)</option>
              <option value="NQA">D2 NQA (Tân Phú)</option>
              <option value="HB">D2 HB (TP. Thủ Đức)</option>
            </select>
            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
              <option value="COMPLETED">Đã nhận sân (COMPLETED)</option>
              <option value="PENDING">Chờ duyệt (PENDING)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
            <button
              type="button"
              className="btn-action-add"
              onClick={onRefresh}
            >
              <i className="fa-solid fa-rotate"></i> Làm mới
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Số Điện Thoại</th>
                <th>Chi Nhánh</th>
                <th>Ngày Đặt</th>
                <th>Khung Giờ & Sân</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody ref={tableBodyRef}>
              {isLoading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu đơn đặt sân...
                  </td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Không tìm thấy đơn đặt sân nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => {
                  let badgeClass = 'badge-pending';
                  let statusText = 'Chờ xử lý';

                  if (b.status === 'PAID' || b.status === 'CONFIRMED') {
                    badgeClass = 'badge-active';
                    statusText = 'Đã thanh toán đủ';
                  } else if (b.status === 'DEPOSITED') {
                    badgeClass = 'badge-active';
                    statusText = 'Đã cọc 50%';
                  } else if (b.status === 'COMPLETED') {
                    badgeClass = 'badge-active';
                    statusText = 'Đã nhận sân';
                  } else if (b.status === 'CANCELLED') {
                    badgeClass = 'badge-danger';
                    statusText = 'Đã hủy đơn';
                  }

                  const slotsStr = b.details && b.details.length > 0
                    ? b.details.map((d) => `${d.court ? (d.court.name || `Sân ${d.court.courtNumber}`) : (d.courtName || 'Sân')}: ${d.timeSlot ? d.timeSlot.displayLabel : (d.timeSlotStr || '')}`).join(', ')
                    : (b.timeSlotStr || 'Ca tiêu chuẩn');

                  return (
                    <tr key={b.id || b.bookingCode}>
                      <td>
                        <strong style={{ color: '#0284c7' }}>#{b.id || b.bookingCode?.slice(-4)}</strong>
                        <br />
                        <small style={{ color: '#64748b' }}>{b.bookingCode}</small>
                      </td>
                      <td>
                        <strong>{b.customerName || 'Khách Vãng Lai'}</strong>
                      </td>
                      <td>{b.customerPhone || '---'}</td>
                      <td>
                        <span className="badge-status badge-active">
                          {b.branch?.code || b.branchCode || 'NVL'}
                        </span>
                      </td>
                      <td>{b.bookingDate || 'Hôm nay'}</td>
                      <td style={{ fontSize: '12px', lineHeight: 1.4, maxWidth: '200px' }}>{slotsStr}</td>
                      <td>
                        <strong style={{ color: '#0f172a', fontSize: '14px' }}>
                          {(b.totalPrice ?? b.totalAmount ?? 0).toLocaleString('vi-VN')} đ
                        </strong>
                        {b.isDeposit || b.deposit || (b.notes && (b.notes.includes('COC_50%') || b.notes.includes('50%'))) ? (
                          <div style={{ marginTop: '3px' }}>
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700, display: 'inline-block' }}>
                              Cọc 50%: {(b.paidAmount || ((b.totalPrice ?? b.totalAmount ?? 0) * 0.5)).toLocaleString('vi-VN')} đ
                            </span>
                            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                              Thiếu: {((b.remainingAmount != null ? b.remainingAmount : ((b.totalPrice ?? b.totalAmount ?? 0) - (b.paidAmount || 0)))).toLocaleString('vi-VN')} đ
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: '3px' }}>
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700, display: 'inline-block' }}>
                              <i className="fa-solid fa-check"></i> Thanh toán 100%
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge-status ${badgeClass}`}>{statusText}</span>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          {b.status !== 'PAID' && b.status !== 'CONFIRMED' && b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              className="btn-tbl btn-tbl-success"
                              title={b.isDeposit || b.deposit || (b.notes && (b.notes.includes('COC_50%') || b.notes.includes('50%'))) ? "Duyệt xác nhận tiền cọc 50%" : "Duyệt xác nhận thanh toán đủ 100%"}
                              onClick={() => onConfirmPayment && onConfirmPayment(b.id)}
                            >
                              <i className="fa-solid fa-check"></i> {b.isDeposit || b.deposit || (b.notes && (b.notes.includes('COC_50%') || b.notes.includes('50%'))) ? 'Duyệt Cọc' : 'Duyệt 100%'}
                            </button>
                          )}
                          {(b.isDeposit || b.deposit || (b.notes && (b.notes.includes('COC_50%') || b.notes.includes('50%')))) && b.status !== 'CANCELLED' && ((b.remainingAmount > 0) || ((b.totalPrice ?? b.totalAmount ?? 0) > (b.paidAmount || 0))) && (
                            <button
                              type="button"
                              className="btn-tbl"
                              style={{ background: '#10b981', color: '#fff', border: 'none' }}
                              title="Khách thanh toán nốt 50% còn lại tại quầy"
                              onClick={() => onPayRemaining && onPayRemaining(b)}
                            >
                              <i className="fa-solid fa-hand-holding-dollar"></i> Thu nốt 50%
                            </button>
                          )}
                          {(b.status === 'PAID' || b.status === 'CONFIRMED') && (
                            <button
                              type="button"
                              className="btn-tbl btn-tbl-primary"
                              style={{ background: '#0284c7', color: '#fff', border: 'none' }}
                              title="Khách đến sân, bấm Check-in"
                              onClick={() => onCheckinBooking && onCheckinBooking(b.id)}
                            >
                              <i className="fa-solid fa-right-to-bracket"></i> Check-in
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              className="btn-tbl btn-tbl-delete"
                              title="Hủy đơn đặt sân (hoàn tiền về ví khách hàng)"
                              onClick={() => onCancelBooking && onCancelBooking(b.id)}
                            >
                              <i className="fa-solid fa-xmark"></i> Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {filteredBookings.length > pageSize && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Hiển thị <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> / <strong>{filteredBookings.length}</strong> đơn đặt sân
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Trước
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f1f5f9' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
