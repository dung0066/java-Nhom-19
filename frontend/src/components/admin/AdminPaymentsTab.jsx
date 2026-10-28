import React, { useState, useEffect } from 'react';
import { fetchAdminPayments, confirmPaymentAdmin } from '../../services/api';

export default function AdminPaymentsTab() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminPayments(0, 100, statusFilter);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách thanh toán:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const handleConfirmPayment = async (payment) => {
    if (!window.confirm(`Xác nhận duyệt giao dịch #${payment.paymentCode || payment.id} với số tiền ${(payment.amount || 0).toLocaleString('vi-VN')} đ?`)) {
      return;
    }

    setProcessingId(payment.id);
    try {
      await confirmPaymentAdmin(payment.id);
      alert('Đã duyệt thanh toán thành công! Tiền đã được cộng vào ví hoặc cập nhật đơn.');
      loadPayments();
    } catch (err) {
      alert('Lỗi duyệt thanh toán: ' + (err.message || err));
    } finally {
      setProcessingId(null);
    }
  };

  // Filter Payments
  const filteredPayments = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      (p.paymentCode && p.paymentCode.toLowerCase().includes(q)) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(q)) ||
      (p.user?.fullName && p.user.fullName.toLowerCase().includes(q)) ||
      (p.user?.username && p.user.username.toLowerCase().includes(q));

    return matchSearch;
  });

  // Calculate quick stats
  let totalAmount = 0;
  let pendingCount = 0;
  let paidCount = 0;

  payments.forEach((p) => {
    if (p.status === 'PAID') {
      totalAmount += Number(p.amount || 0);
      paidCount++;
    } else if (p.status === 'PENDING') {
      pendingCount++;
    }
  });

  return (
    <section id="paymentsTab" className="tab-pane">
      {/* 1. TOP STATS CARDS */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <i className="fa-solid fa-money-bill-transfer"></i>
          </div>
          <div className="stat-meta">
            <h4>Doanh Thu Giao Dịch Đã Thu</h4>
            <div className="stat-val" style={{ color: '#10b981' }}>
              {totalAmount.toLocaleString('vi-VN')} đ
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {paidCount} giao dịch đã thanh toán thành công
            </p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className="stat-meta">
            <h4>Giao Dịch Chờ Duyệt (Pending)</h4>
            <div className="stat-val" style={{ color: '#ea580c' }}>
              {pendingCount} Giao Dịch
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Khách chuyển khoản nạp ví / đặt sân cần đối soát
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <i className="fa-solid fa-receipt"></i>
          </div>
          <div className="stat-meta">
            <h4>Tổng Số Giao Dịch</h4>
            <div className="stat-val" style={{ color: '#0284c7' }}>
              {payments.length} Bản Ghi
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Bao gồm nạp ví, gói VIP và đặt sân
            </p>
          </div>
        </div>
      </div>

      {/* 2. TABLE CARD */}
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3 style={{ margin: 0 }}>
              <i className="fa-solid fa-credit-card"></i> Lịch Sử Giao Dịch & Quản Lý Nạp Tiền
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Đối soát chuyển khoản ngân hàng, duyệt nạp ví điện tử và kiểm tra doanh thu tức thì
            </p>
          </div>

          <div className="filter-tools-row">
            <div className="input-search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Tìm mã giao dịch, mã đối soát, tên khách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt (PENDING)</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="FAILED">Thất bại (FAILED)</option>
            </select>

            <button
              type="button"
              className="btn-action-add"
              onClick={loadPayments}
            >
              <i className="fa-solid fa-rotate"></i> Làm mới
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã GD</th>
                <th>Khách Hàng</th>
                <th>Mục Đích</th>
                <th>Số Tiền</th>
                <th>Phương Thức</th>
                <th>Mã Đối Soát Ngân Hàng</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu giao dịch...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Không có giao dịch nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isPending = p.status === 'PENDING';
                  const isPaid = p.status === 'PAID';
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ color: '#0284c7' }}>{p.paymentCode || `#PAY-${p.id}`}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : '---'}
                        </div>
                      </td>
                      <td>
                        <strong>{p.user?.fullName || p.user?.username || 'Khách vãng lai'}</strong>
                        {p.user?.phone && (
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{p.user.phone}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge-cat" style={{ background: '#f0fdf4', color: '#166534' }}>
                          {p.purpose === 'WALLET_TOPUP' ? 'Nạp Tiền Ví' :
                           p.purpose === 'MEMBERSHIP' ? 'Mua Gói Hội Viên' :
                           p.purpose === 'BOOKING' ? 'Thanh Toán Đơn Sân' : p.purpose}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#0284c7', fontSize: '15px' }}>
                          {Number(p.amount || 0).toLocaleString('vi-VN')} đ
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{p.method || 'CHUYỂN KHOẢN'}</span>
                      </td>
                      <td>
                        <code>{p.transactionRef || '---'}</code>
                      </td>
                      <td>
                        <span className={`status-pill ${
                          isPaid ? 'status-pill-paid' : isPending ? 'status-pill-pending' : 'status-pill-cancelled'
                        }`}>
                          {isPaid ? 'Đã Thanh Toán' : isPending ? 'Chờ Duyệt' : p.status}
                        </span>
                      </td>
                      <td>
                        {isPending && (
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-edit"
                            style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                            disabled={processingId === p.id}
                            onClick={() => handleConfirmPayment(p)}
                          >
                            {processingId === p.id ? (
                              <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                              <>
                                <i className="fa-solid fa-check"></i> Duyệt Nạp Tiền
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

