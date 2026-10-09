import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AdminBookingsTab({
  bookings = [],
  onRefresh,
  onConfirmPayment,
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

  bookings.forEach((b) => {
    if (b.status !== 'CANCELLED') {
      totalRevenue += b.totalAmount || 0;
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

    const matchBranch = !branchFilter || (b.branch && b.branch.code === branchFilter);
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
      {/* 1. STATS CARDS WITH GSAP STAGGER */}
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
            <i className="fa-solid fa-share-nodes"></i>
          </div>
          <div className="stat-meta">
            <h4>Yêu Cầu Cần Pass</h4>
            <div className="stat-val">1</div>
          </div>
        </div>
      </div>

      {/* 2. TABLE CARD */}
      <div className="admin-content-card">
        <div className="card-header-flex">
          <h3>
            <i className="fa-solid fa-list-check"></i> Danh Sách Khách Đặt Sân Trực Tuyến
          </h3>
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
              <option value="NVL">Ways Station NVL</option>
              <option value="DQII">Ways Station DQII</option>
              <option value="NQA">Ways Station NQA</option>
              <option value="HB">Ways Station HB</option>
            </select>
            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="PENDING">Chờ xác nhận (PENDING)</option>
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
                <th>Thao Tác</th>
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

                  if (b.status === 'PAID') {
                    badgeClass = 'badge-active';
                    statusText = 'Đã thanh toán';
                  } else if (b.status === 'CANCELLED') {
                    badgeClass = 'badge-danger';
                    statusText = 'Đã hủy';
                  }

                  const slotsStr = b.details && b.details.length > 0
                    ? b.details.map((d) => `${d.court ? d.court.name : 'Sân'}: ${d.timeSlot ? d.timeSlot.displayLabel : ''}`).join(', ')
                    : 'Ca tiêu chuẩn';

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong>#{b.id}</strong>
                        <br />
                        <small style={{ color: '#64748b' }}>{b.bookingCode}</small>
                      </td>
                      <td>
                        <strong>{b.customerName || 'Khách Vãng Lai'}</strong>
                      </td>
                      <td>{b.customerPhone || '---'}</td>
                      <td>
                        <span className="badge-status badge-active">
                          {b.branch ? b.branch.code : 'NVL'}
                        </span>
                      </td>
                      <td>{b.bookingDate || '---'}</td>
                      <td style={{ fontSize: '12px', lineHeight: 1.4 }}>{slotsStr}</td>
                      <td>
                        <strong style={{ color: '#ea580c' }}>
                          {(b.totalAmount || 0).toLocaleString('vi-VN')} đ
                        </strong>
                      </td>
                      <td>
                        <span className={`badge-status ${badgeClass}`}>{statusText}</span>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          {b.status !== 'PAID' && (
                            <button
                              type="button"
                              className="btn-tbl btn-tbl-success"
                              title="Xác nhận thanh toán"
                              onClick={() => onConfirmPayment(b.id)}
                            >
                              <i className="fa-solid fa-check"></i>
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              className="btn-tbl btn-tbl-delete"
                              title="Hủy đơn đặt sân"
                              onClick={() => onCancelBooking(b.id)}
                            >
                              <i className="fa-solid fa-ban"></i>
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

        {/* 3. PAGINATION BAR */}
        {filteredBookings.length > 0 && (
          <div className="admin-pagination-bar">
            <div className="pagination-info">
              Hiển thị <strong>{startIndex + 1} - {endIndex}</strong> trên tổng <strong>{filteredBookings.length}</strong> đơn đặt sân
              &nbsp;&bull;&nbsp;
              <label style={{ marginLeft: '8px' }}>
                Số đơn/trang:
                <select
                  className="pagination-size-select"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{ marginLeft: '6px' }}
                >
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                </select>
              </label>
            </div>

            <div className="pagination-controls">
              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <i className="fa-solid fa-chevron-left"></i> Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`page-number-btn ${currentPage === pageNumber ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Tiếp <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
