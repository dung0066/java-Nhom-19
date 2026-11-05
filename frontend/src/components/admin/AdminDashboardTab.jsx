import React, { useState, useEffect } from 'react';
import { fetchAdminDashboardStats } from '../../services/api';

export default function AdminDashboardTab({ onNavigateTab, onConfirmPayment, onCheckinBooking }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu thống kê tổng quan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
        <p style={{ marginTop: '12px', fontWeight: 600 }}>Đang tải báo cáo tổng quan hệ thống...</p>
      </div>
    );
  }

  const totalRevenue = stats?.totalRevenue || 0;
  const totalBookings = stats?.totalBookings || 0;
  const pendingBookings = stats?.pendingBookings || 0;
  const confirmedBookings = stats?.confirmedBookings || 0;
  const completedBookings = stats?.completedBookings || 0;
  const cancelledBookings = stats?.cancelledBookings || 0;
  const totalUsers = stats?.totalUsers || 0;
  const totalCourts = stats?.totalCourts || 0;
  const totalBranches = stats?.totalBranches || 0;
  const pendingPayments = stats?.pendingPayments || 0;
  const recentBookings = stats?.recentBookings || [];
  const branchRevenue = stats?.branchRevenue || {};

  return (
    <section id="dashboardTab" className="tab-pane">
      {/* 1. TOP STATS CARDS */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {/* DOANH THU */}
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <i className="fa-solid fa-sack-dollar"></i>
          </div>
          <div className="stat-meta">
            <h4>Tổng Doanh Thu Hệ Thống</h4>
            <div className="stat-val" style={{ color: '#10b981' }}>
              {Number(totalRevenue).toLocaleString('vi-VN')} đ
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Từ các đơn đặt sân & giao dịch hợp lệ
            </p>
          </div>
        </div>

        {/* TỔNG ĐƠN ĐẶT SÂN */}
        <div className="stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="stat-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <i className="fa-solid fa-calendar-check"></i>
          </div>
          <div className="stat-meta">
            <h4>Tổng Đơn Đặt Sân</h4>
            <div className="stat-val" style={{ color: '#0284c7' }}>
              {totalBookings} Đơn
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              <strong style={{ color: '#ea580c' }}>{pendingBookings}</strong> chờ duyệt •{' '}
              <strong style={{ color: '#10b981' }}>{confirmedBookings}</strong> đã xác nhận
            </p>
          </div>
        </div>

        {/* KHÁCH HÀNG / TÀI KHOẢN */}
        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="stat-meta">
            <h4>Tài Khoản Khách Hàng</h4>
            <div className="stat-val" style={{ color: '#8b5cf6' }}>
              {totalUsers} Thành Viên
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Đã đăng ký tài khoản trên hệ thống
            </p>
          </div>
        </div>

        {/* QUY MÔ SÂN & CƠ SỞ */}
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <i className="fa-solid fa-building-circle-check"></i>
          </div>
          <div className="stat-meta">
            <h4>Quy Mô Sân Thi Đấu</h4>
            <div className="stat-val" style={{ color: '#f59e0b' }}>
              {totalCourts} Sân / {totalBranches} Cơ Sở
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Hoạt động liên tục 24/7 BWF
            </p>
          </div>
        </div>
      </div>

      {/* 2. CHÚ Ý NHANH (ALERT BARS) */}
      {(pendingBookings > 0 || pendingPayments > 0) && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#d97706', fontSize: '22px' }}></i>
            <div>
              <strong style={{ color: '#92400e', fontSize: '14px' }}>
                Hệ thống có {pendingBookings} đơn đặt sân & {pendingPayments} giao dịch cần xử lý!
              </strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#b45309' }}>
                Vui lòng kiểm tra và xác nhận kịp thời để giữ slot cho khách.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {pendingBookings > 0 && (
              <button
                type="button"
                className="btn-action-add"
                style={{ fontSize: '12px', padding: '6px 14px' }}
                onClick={() => onNavigateTab && onNavigateTab('bookings')}
              >
                <i className="fa-solid fa-calendar"></i> Xem Đơn Chờ Duyệt
              </button>
            )}
            {pendingPayments > 0 && (
              <button
                type="button"
                className="btn-action-add"
                style={{ fontSize: '12px', padding: '6px 14px', background: '#d97706' }}
                onClick={() => onNavigateTab && onNavigateTab('payments')}
              >
                <i className="fa-solid fa-credit-card"></i> Duyệt Giao Dịch
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. GRID 2 CỘT: DOANH THU THEO CƠ SỞ & 5 ĐƠN GẦN NHẤT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* CỘT 1: PHÂN BỔ DOANH THU */}
        <div className="admin-content-card">
          <div className="card-header-flex">
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                <i className="fa-solid fa-chart-pie"></i> Doanh Thu Theo Cơ Sở
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Tỷ lệ đóng góp doanh thu của từng chi nhánh
              </p>
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            {Object.keys(branchRevenue).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                <i className="fa-solid fa-chart-simple fa-2x" style={{ marginBottom: '8px', opacity: 0.5 }}></i>
                <p>Chưa phát sinh doanh thu từ các cơ sở.</p>
              </div>
            ) : (
              Object.entries(branchRevenue).map(([branchName, amount]) => {
                const percent = totalRevenue > 0 ? Math.round((Number(amount) / Number(totalRevenue)) * 100) : 0;
                return (
                  <div key={branchName} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                      <strong>{branchName}</strong>
                      <span style={{ color: '#0284c7', fontWeight: 700 }}>
                        {Number(amount).toLocaleString('vi-VN')} đ ({percent}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT 2: TRẠNG THÁI ĐƠN HÀNG */}
        <div className="admin-content-card">
          <div className="card-header-flex">
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                <i className="fa-solid fa-chart-column"></i> Thống Kê Trạng Thái Đơn Đặt Sân
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Tổng quan tiến độ phục vụ khách hàng
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div style={{ background: '#fff7ed', padding: '14px', borderRadius: '8px', borderLeft: '3px solid #ea580c' }}>
              <div style={{ fontSize: '12px', color: '#9a3412', fontWeight: 600 }}>Chờ Duyệt (PENDING)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#c2410c', marginTop: '4px' }}>{pendingBookings}</div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', borderLeft: '3px solid #16a34a' }}>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Đã Xác Nhận (CONFIRMED)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>{confirmedBookings}</div>
            </div>

            <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '8px', borderLeft: '3px solid #2563eb' }}>
              <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 600 }}>Hoàn Tất (COMPLETED)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1d4ed8', marginTop: '4px' }}>{completedBookings}</div>
            </div>

            <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '8px', borderLeft: '3px solid #dc2626' }}>
              <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: 600 }}>Đã Hủy (CANCELLED)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>{cancelledBookings}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BẢNG 5 ĐƠN GẦN NHẤT */}
      <div className="admin-content-card" style={{ marginTop: '24px' }}>
        <div className="card-header-flex">
          <div>
            <h3 style={{ margin: 0, fontSize: '16px' }}>
              <i className="fa-solid fa-clock-rotate-left"></i> Đơn Đặt Sân Mới Nhất
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Các đơn đặt sân vừa gửi lên hệ thống từ khách hàng
            </p>
          </div>

          <button
            type="button"
            className="btn-tbl btn-tbl-edit"
            onClick={() => onNavigateTab && onNavigateTab('bookings')}
          >
            Xem tất cả đơn &rarr;
          </button>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Số Điện Thoại</th>
                <th>Cơ Sở</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    Chưa có đơn đặt sân nào trong CSDL.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ color: '#0284c7' }}>{b.bookingCode || `#${b.id}`}</strong>
                    </td>
                    <td>{b.customerName}</td>
                    <td>{b.customerPhone}</td>
                    <td>{b.branch?.name || b.branchCode}</td>
                    <td>
                      <strong style={{ color: '#0284c7' }}>
                        {(b.totalPrice || b.totalAmount || 0).toLocaleString('vi-VN')} đ
                      </strong>
                    </td>
                    <td>
                      <span className={`status-pill ${
                        b.status === 'CONFIRMED' || b.status === 'PAID' ? 'status-pill-paid' :
                        b.status === 'COMPLETED' ? 'status-pill-completed' :
                        b.status === 'CANCELLED' ? 'status-pill-cancelled' : 'status-pill-pending'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'PENDING' && (
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-edit"
                          onClick={() => onConfirmPayment && onConfirmPayment(b.id)}
                        >
                          <i className="fa-solid fa-check"></i> Duyệt
                        </button>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          className="btn-tbl btn-tbl-edit"
                          style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                          onClick={() => onCheckinBooking && onCheckinBooking(b.id)}
                        >
                          <i className="fa-solid fa-user-check"></i> Check-in
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
    </section>
  );
}

