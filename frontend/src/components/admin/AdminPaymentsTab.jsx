import React, { useState, useEffect, useMemo } from 'react';
import ModalPortal from './ModalPortal';
import { PaginationBar } from './Pagination';
import { usePagination } from './usePagination';
import { fetchAdminPayments, confirmPaymentAdmin } from '../../services/api';

// Dữ liệu mẫu phong phú đúng theo các nghiệp vụ thực tế
const DEFAULT_PAYMENTS = [
  {
    id: 9821,
    paymentCode: 'PAY-9821',
    user: {
      fullName: 'Nguyễn Văn An',
      phone: '0901 234 567',
      email: 'an.nguyen@gmail.com'
    },
    purpose: 'BOOKING',
    purposeLabel: 'Đặt sân cầu lông',
    amount: 150000,
    method: 'VietQR',
    transactionRef: 'FT26110488219',
    status: 'PENDING', // Chờ duyệt
    createdAt: '2026-11-04T13:45:00',
    paidAt: null,
    branchName: 'Chi nhánh Quận 7 - Nam Sài Gòn',
    courtName: 'Sân VIP 1',
    playDate: '2026-11-04',
    timeSlot: '17:30 - 19:00',
    note: 'Chuyển khoản VietQR qua Techcombank, nội dung: PAY9821'
  },
  {
    id: 9820,
    paymentCode: 'PAY-9820',
    user: {
      fullName: 'Trần Thị Bình',
      phone: '0912 888 000',
      email: 'binh.tran@student.edu.vn'
    },
    purpose: 'MEMBERSHIP',
    purposeLabel: 'Gói Sinh Viên VIP',
    amount: 99000,
    method: 'VietQR',
    transactionRef: 'FT26110477123',
    status: 'PENDING', // Chờ duyệt
    createdAt: '2026-11-04T13:10:00',
    paidAt: null,
    branchName: 'Tất cả chi nhánh',
    courtName: 'Thẻ VIP',
    playDate: '30 ngày',
    timeSlot: 'Ưu đãi 20% giờ thường',
    note: 'Đăng ký gói sinh viên 30 ngày, đối soát thẻ SV'
  },
  {
    id: 9819,
    paymentCode: 'PAY-9819',
    user: {
      fullName: 'Đặng Tuấn Kiệt',
      phone: '0918 222 333',
      email: 'kiet.dang@outlook.com'
    },
    purpose: 'WALLET_TOPUP',
    purposeLabel: 'Nạp ví D2 Pay',
    amount: 1000000,
    method: 'VietQR',
    transactionRef: 'FT26110466541',
    status: 'PENDING', // Chờ duyệt
    createdAt: '2026-11-04T12:30:00',
    paidAt: null,
    branchName: 'Hệ thống D2 Badminton',
    courtName: 'Ví điện tử',
    playDate: 'Ngay tức thì',
    timeSlot: 'Cộng số dư ví',
    note: 'Khách nạp tiền ví D2 Pay 1.000.000 đ'
  },
  {
    id: 9818,
    paymentCode: 'PAY-9818',
    user: {
      fullName: 'Lê Hoàng Cường',
      phone: '0987 111 222',
      email: 'cuong.le@yahoo.com'
    },
    purpose: 'MEMBERSHIP',
    purposeLabel: 'Gói VIP Gold',
    amount: 499000,
    method: 'Ví D2 Pay',
    transactionRef: 'WAL-24018',
    status: 'PAID', // Đã thanh toán
    createdAt: '2026-11-04T10:15:00',
    paidAt: '2026-11-04T10:15:02',
    branchName: 'Toàn hệ thống',
    courtName: 'Thẻ VIP Gold',
    playDate: '90 ngày',
    timeSlot: 'Giảm 15% tất cả các ca',
    note: 'Thanh toán tự động qua số dư ví D2 Pay'
  },
  {
    id: 9817,
    paymentCode: 'PAY-9817',
    user: {
      fullName: 'Phạm Minh Đức',
      phone: '0903 555 777',
      email: 'duc.pham@company.vn'
    },
    purpose: 'BOOKING',
    purposeLabel: 'Đặt sân cố định tháng',
    amount: 1800000,
    method: 'Tiền mặt',
    transactionRef: 'CASH-881',
    status: 'PAID', // Đã thanh toán
    createdAt: '2026-11-04T09:00:00',
    paidAt: '2026-11-04T09:05:00',
    branchName: 'Chi nhánh Quận 1 - Nguyễn Du',
    courtName: 'Sân 2 & Sân 3',
    playDate: 'Tháng 11/2026',
    timeSlot: 'Thứ 2-4-6 (19:00 - 21:00)',
    note: 'Thu tiền mặt tại quầy tiếp tân, xuất phiếu thu'
  },
  {
    id: 9816,
    paymentCode: 'PAY-9816',
    user: {
      fullName: 'Vũ Đình Trọng',
      phone: '0977 123 456',
      email: 'trong.vu@gmail.com'
    },
    purpose: 'EQUIPMENT',
    purposeLabel: 'Thuê vợt & Nước uống',
    amount: 120000,
    method: 'Ví D2 Pay',
    transactionRef: 'WAL-24012',
    status: 'PAID', // Đã thanh toán
    createdAt: '2026-11-03T18:20:00',
    paidAt: '2026-11-03T18:20:05',
    branchName: 'Chi nhánh Quận 7',
    courtName: 'Quầy dịch vụ',
    playDate: '2026-11-03',
    timeSlot: '18:30',
    note: '2 x Vợt Yonex Nanoflare 1000Z + 2 chai Revive'
  },
  {
    id: 9815,
    paymentCode: 'PAY-9815',
    user: {
      fullName: 'Hoàng Kim Ngân',
      phone: '0933 444 888',
      email: 'ngan.hoang@gmail.com'
    },
    purpose: 'BOOKING',
    purposeLabel: 'Đặt sân giờ vàng',
    amount: 240000,
    method: 'VietQR',
    transactionRef: 'FT26110355421',
    status: 'PAID', // Đã thanh toán
    createdAt: '2026-11-03T16:00:00',
    paidAt: '2026-11-03T16:02:30',
    branchName: 'Chi nhánh Quận 1',
    courtName: 'Sân 3',
    playDate: '2026-11-03',
    timeSlot: '18:00 - 20:00',
    note: 'Đã khớp lệnh VietQR tự động qua ngân hàng'
  },
  {
    id: 9814,
    paymentCode: 'PAY-9814',
    user: {
      fullName: 'Trịnh Thu Hà',
      phone: '0945 666 999',
      email: 'ha.trinh@gmail.com'
    },
    purpose: 'BOOKING',
    purposeLabel: 'Hủy đơn hoàn tiền',
    amount: 180000,
    method: 'Ví D2 Pay',
    transactionRef: 'REF-24003',
    status: 'REFUNDED', // Hoàn tiền
    createdAt: '2026-11-02T14:00:00',
    paidAt: '2026-11-02T14:05:00',
    refundedAt: '2026-11-02T15:30:00',
    refundReason: 'Khách báo bận công tác đột xuất, hủy trước giờ chơi 24 tiếng',
    branchName: 'Chi nhánh Quận 7',
    courtName: 'Sân 1',
    playDate: '2026-11-03',
    timeSlot: '19:00 - 20:30',
    note: 'Đã hoàn 100% số tiền 180.000 đ vào ví D2 Pay'
  },
  {
    id: 9813,
    paymentCode: 'PAY-9813',
    user: {
      fullName: 'Đỗ Thanh Tùng',
      phone: '0911 234 888',
      email: 'tung.do@gmail.com'
    },
    purpose: 'BOOKING',
    purposeLabel: 'Đặt giữ chỗ quá hạn',
    amount: 150000,
    method: 'VietQR',
    transactionRef: '---',
    status: 'EXPIRED', // Quá hạn
    createdAt: '2026-11-02T11:00:00',
    paidAt: null,
    branchName: 'Chi nhánh Bình Thạnh',
    courtName: 'Sân 4',
    playDate: '2026-11-02',
    timeSlot: '17:00 - 18:30',
    note: 'Hết thời hạn giữ chỗ 15 phút, khách không chuyển khoản'
  },
  {
    id: 9812,
    paymentCode: 'PAY-9812',
    user: {
      fullName: 'CLB Cầu Lông Thanh Niên',
      phone: '0966 777 999',
      email: 'clb.thanhnien@badminton.vn'
    },
    purpose: 'FREE_GRANT',
    purposeLabel: 'Tài trợ giải đấu nội bộ',
    amount: 0,
    method: 'Cấp Free',
    transactionRef: 'FREE-SPONSOR-2026',
    status: 'FREE', // Cấp free
    createdAt: '2026-11-01T08:00:00',
    paidAt: '2026-11-01T08:00:00',
    branchName: 'Chi nhánh Quận 7',
    courtName: 'Cụm 4 Sân (1, 2, 3, 4)',
    playDate: '2026-11-01',
    timeSlot: '08:00 - 12:00',
    note: 'Voucher tài trợ 100% cho giải phong trào theo thỏa thuận Ban quản lý'
  }
];

export default function AdminPaymentsTab() {
  // 1. DATA STATE
  const [payments, setPayments] = useState(() => {
    try {
      const saved = localStorage.getItem('d2_admin_payments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) { }
    return DEFAULT_PAYMENTS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // 2. SUB-TABS: 'pending' (Cần xử lý) | 'all' (Tất cả giao dịch) | 'refund' (Hoàn tiền)
  const [activeSubTab, setActiveSubTab] = useState('pending');

  // 3. FILTERS: Search, Purpose, Method, Date
  const [searchTerm, setSearchTerm] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // 4. DRAWER & MODAL STATES
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundModalPayment, setRefundModalPayment] = useState(null);
  const [refundReasonInput, setRefundReasonInput] = useState('');

  // Tải dữ liệu từ backend API nếu có kết nối
  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminPayments(0, 100).catch(() => []);
      if (Array.isArray(data) && data.length > 0) {
        // Hợp nhất dữ liệu API với các trường bổ sung
        const merged = data.map((item, idx) => ({
          ...item,
          paymentCode: item.paymentCode || `PAY-${item.id || 9800 + idx}`,
          user: item.user || { fullName: 'Khách hàng', phone: '0900 000 000' },
          purpose: item.purpose || 'BOOKING',
          purposeLabel:
            item.purpose === 'WALLET_TOPUP'
              ? 'Nạp ví D2 Pay'
              : item.purpose === 'MEMBERSHIP'
                ? 'Mua gói hội viên'
                : 'Đặt sân cầu lông',
          method: item.method || 'VietQR',
          status: item.status || 'PAID',
          createdAt: item.createdAt || item.paidAt || new Date().toISOString()
        }));
        setPayments(merged);
        localStorage.setItem('d2_admin_payments', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('Lỗi khi tải giao dịch từ API, dùng dữ liệu bộ nhớ đệm:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // ==========================================
  // THỐNG KÊ 4 THẺ THEO YÊU CẦU
  // ==========================================
  const stats = useMemo(() => {
    // 1. Doanh thu thật: Tổng tiền các giao dịch PAID
    const realRevenue = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // 2. Chờ duyệt: Số đơn + tổng tiền
    const pendingList = payments.filter((p) => p.status === 'PENDING');
    const pendingCount = pendingList.length;
    const pendingAmount = pendingList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // 3. Quá hạn: Số đơn + tổng tiền
    const expiredList = payments.filter((p) => p.status === 'EXPIRED' || p.status === 'FAILED');
    const expiredCount = expiredList.length;
    const expiredAmount = expiredList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // 4. Cấp free: Số lượt
    const freeList = payments.filter((p) => p.status === 'FREE' || p.amount === 0);
    const freeCount = freeList.length;

    return {
      realRevenue,
      pendingCount,
      pendingAmount,
      expiredCount,
      expiredAmount,
      freeCount
    };
  }, [payments]);

  // ==========================================
  // LỌC DỮ LIỆU
  // ==========================================
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // 1. Theo Sub-Tab
      if (activeSubTab === 'pending' && p.status !== 'PENDING') return false;
      if (activeSubTab === 'refund' && p.status !== 'REFUNDED') return false;

      // 2. Theo Search term (Mã GD, tên, SĐT)
      const q = searchTerm.toLowerCase().trim();
      if (q) {
        const matchCode = p.paymentCode && p.paymentCode.toLowerCase().includes(q);
        const matchRef = p.transactionRef && p.transactionRef.toLowerCase().includes(q);
        const matchName = p.user?.fullName && p.user.fullName.toLowerCase().includes(q);
        const matchPhone = p.user?.phone && p.user.phone.includes(q);
        if (!matchCode && !matchRef && !matchName && !matchPhone) return false;
      }

      // 3. Theo Mục đích
      if (purposeFilter && p.purpose !== purposeFilter) return false;

      // 4. Theo Phương thức
      if (methodFilter && p.method !== methodFilter) return false;

      // 5. Theo Ngày
      if (dateFilter) {
        const pDate = new Date(p.createdAt);
        const now = new Date();
        if (dateFilter === 'today') {
          const isToday =
            pDate.getDate() === now.getDate() &&
            pDate.getMonth() === now.getMonth() &&
            pDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (dateFilter === '7days') {
          const diffDays = (now - pDate) / (1000 * 60 * 60 * 24);
          if (diffDays > 7) return false;
        } else if (dateFilter === 'month') {
          const isThisMonth =
            pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
          if (!isThisMonth) return false;
        }
      }

      return true;
    });
  }, [payments, activeSubTab, searchTerm, purposeFilter, methodFilter, dateFilter]);

  const pg = usePagination(filteredPayments, 10, `${filteredPayments.length}-${activeSubTab}-${searchTerm}`);

  // ==========================================
  // THAO TÁC GIAO DỊCH
  // ==========================================
  // 1. Duyệt thanh toán
  const handleConfirmPayment = async (payment) => {
    if (
      !window.confirm(
        `Xác nhận DUYỆT giao dịch #${payment.paymentCode}?\nKhách hàng: ${payment.user?.fullName}\nSố tiền: ${Number(
          payment.amount || 0
        ).toLocaleString('vi-VN')} đ`
      )
    ) {
      return;
    }

    setProcessingId(payment.id);
    try {
      await confirmPaymentAdmin(payment.id).catch(() => { });

      const now = new Date().toISOString();
      const updatedList = payments.map((p) =>
        p.id === payment.id ? { ...p, status: 'PAID', paidAt: now } : p
      );

      setPayments(updatedList);
      localStorage.setItem('d2_admin_payments', JSON.stringify(updatedList));

      if (selectedPayment && selectedPayment.id === payment.id) {
        setSelectedPayment({ ...selectedPayment, status: 'PAID', paidAt: now });
      }

      alert('Đã phê duyệt thanh toán thành công! Đơn hàng đã được kích hoạt.');
    } catch (err) {
      alert('Lỗi duyệt thanh toán: ' + (err.message || err));
    } finally {
      setProcessingId(null);
    }
  };

  // 2. Từ chối / Hủy giao dịch
  const handleRejectPayment = (payment) => {
    if (!window.confirm(`Bạn có chắc muốn TỪ CHỐI giao dịch #${payment.paymentCode}?`)) {
      return;
    }

    const updatedList = payments.map((p) =>
      p.id === payment.id ? { ...p, status: 'FAILED' } : p
    );

    setPayments(updatedList);
    localStorage.setItem('d2_admin_payments', JSON.stringify(updatedList));

    if (selectedPayment && selectedPayment.id === payment.id) {
      setSelectedPayment({ ...selectedPayment, status: 'FAILED' });
    }

    alert('Đã từ chối giao dịch thành công.');
  };

  // 3. Hoàn tiền
  const handleOpenRefundModal = (payment) => {
    setRefundModalPayment(payment);
    setRefundReasonInput('Khách yêu cầu hủy đơn và hoàn tiền theo chính sách hệ thống');
  };

  const handleSubmitRefund = (e) => {
    e.preventDefault();
    if (!refundModalPayment) return;

    const now = new Date().toISOString();
    const updatedList = payments.map((p) =>
      p.id === refundModalPayment.id
        ? {
          ...p,
          status: 'REFUNDED',
          refundedAt: now,
          refundReason: refundReasonInput || 'Khách hủy đơn hoàn tiền'
        }
        : p
    );

    setPayments(updatedList);
    localStorage.setItem('d2_admin_payments', JSON.stringify(updatedList));

    if (selectedPayment && selectedPayment.id === refundModalPayment.id) {
      setSelectedPayment({
        ...selectedPayment,
        status: 'REFUNDED',
        refundedAt: now,
        refundReason: refundReasonInput
      });
    }

    alert(`Đã hoàn tất thủ tục hoàn tiền cho giao dịch #${refundModalPayment.paymentCode}!`);
    setRefundModalPayment(null);
  };

  // 4. Xuất file CSV giao dịch có BOM tiếng Việt
  const handleExportCSV = () => {
    try {
      const headers = [
        'Mã GD',
        'Khách hàng',
        'Số điện thoại',
        'Email',
        'Mục đích',
        'Số tiền (VNĐ)',
        'Phương thức',
        'Mã đối soát',
        'Trạng thái',
        'Ngày tạo'
      ];

      const rows = filteredPayments.map((p) => [
        `"${p.paymentCode || ''}"`,
        `"${p.user?.fullName || ''}"`,
        `"${p.user?.phone || ''}"`,
        `"${p.user?.email || ''}"`,
        `"${p.purposeLabel || p.purpose || ''}"`,
        p.amount || 0,
        `"${p.method || ''}"`,
        `"${p.transactionRef || ''}"`,
        `"${p.status === 'PAID' ? 'Đã thanh toán' : p.status === 'PENDING' ? 'Chờ duyệt' : p.status === 'REFUNDED' ? 'Đã hoàn tiền' : p.status}"`,
        `"${p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : ''}"`
      ]);

      const csvContent =
        '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `danh-sach-giao-dich-${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Lỗi xuất CSV: ' + err.message);
    }
  };

  // In hóa đơn
  const handlePrintInvoice = (payment) => {
    window.print();
  };

  return (
    <section id="paymentsTab" className="tab-pane" style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .clickable-table-row {
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .clickable-table-row:hover {
          background-color: #f1f5f9 !important;
        }
        .mem-action-btn-sm {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.15s ease;
        }
        .mem-action-btn-sm:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }
      `}</style>

      {/* 1. TOP HEADER ROW THEO WIREFRAME */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
            <i className="fa-solid fa-receipt" style={{ color: '#0284c7', marginRight: '8px' }}></i>
            Thanh toán & Xác nhận
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Đối soát chuyển khoản ngân hàng, duyệt thanh toán đơn đặt sân & nạp ví tự động
          </p>
        </div>

        {/* NÚT XUẤT CSV VÀ LÀM MỚI (↻) */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
            title="Xuất danh sách giao dịch ra file CSV Excel"
          >
            <i className="fa-solid fa-file-csv" style={{ color: '#16a34a', fontSize: '16px' }}></i>
            Xuất CSV
          </button>

          <button
            type="button"
            onClick={loadPayments}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
            title="Tải lại dữ liệu (↻)"
          >
            <i className={`fa-solid fa-rotate-right ${isLoading ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* 2. 4 THẺ THỐNG KÊ (METRIC CARDS) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '22px'
        }}
      >
        {/* Thẻ 1: Doanh thu thật */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
            Doanh thu thật
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>
            {stats.realRevenue.toLocaleString('vi-VN')} đ
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Đã quyết toán thành công
          </p>
        </div>

        {/* Thẻ 2: Chờ duyệt: số + tiền */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
            Chờ duyệt: số + tiền
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#ea580c', lineHeight: 1 }}>
            {stats.pendingCount} đơn • {stats.pendingAmount.toLocaleString('vi-VN')} đ
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Cần đối soát chuyển khoản VietQR
          </p>
        </div>

        {/* Thẻ 3: Quá hạn */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
            Quá hạn
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#64748b', lineHeight: 1 }}>
            {stats.expiredCount} đơn • {stats.expiredAmount.toLocaleString('vi-VN')} đ
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Quá hạn thanh toán 15 phút
          </p>
        </div>

        {/* Thẻ 4: Cấp free */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
            Cấp free
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0284c7', lineHeight: 1 }}>
            {stats.freeCount} lượt • 0 đ
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Voucher & sự kiện tài trợ
          </p>
        </div>
      </div>

      {/* 3. SUB-TABS: Cần xử lý (3) | Tất cả giao dịch | Hoàn tiền */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '18px',
          flexWrap: 'wrap'
        }}
      >
        {/* Tab: Cần xử lý */}
        <button
          type="button"
          style={{
            padding: '9px 20px',
            fontSize: '14px',
            fontWeight: 700,
            borderRadius: '9999px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'pending' ? '#0f172a' : '#ffffff',
            color: activeSubTab === 'pending' ? '#ffffff' : '#334155',
            border: activeSubTab === 'pending' ? '1px solid #0f172a' : '1px solid #cbd5e1',
            boxShadow: activeSubTab === 'pending' ? '0 2px 8px rgba(15,23,42,0.18)' : 'none',
            transition: 'all 0.15s ease'
          }}
          onClick={() => setActiveSubTab('pending')}
        >
          <span>Cần xử lý</span>
          <span
            style={{
              background: '#ea580c',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 800,
              lineHeight: '1'
            }}
          >
            {stats.pendingCount}
          </span>
        </button>

        {/* Tab: Tất cả giao dịch */}
        <button
          type="button"
          style={{
            padding: '9px 20px',
            fontSize: '14px',
            fontWeight: 700,
            borderRadius: '9999px',
            cursor: 'pointer',
            background: activeSubTab === 'all' ? '#0f172a' : '#ffffff',
            color: activeSubTab === 'all' ? '#ffffff' : '#334155',
            border: activeSubTab === 'all' ? '1px solid #0f172a' : '1px solid #cbd5e1',
            boxShadow: activeSubTab === 'all' ? '0 2px 8px rgba(15,23,42,0.18)' : 'none',
            transition: 'all 0.15s ease'
          }}
          onClick={() => setActiveSubTab('all')}
        >
          Tất cả giao dịch ({payments.length})
        </button>

        {/* Tab: Hoàn tiền */}
        <button
          type="button"
          style={{
            padding: '9px 20px',
            fontSize: '14px',
            fontWeight: 700,
            borderRadius: '9999px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'refund' ? '#0f172a' : '#ffffff',
            color: activeSubTab === 'refund' ? '#ffffff' : '#334155',
            border: activeSubTab === 'refund' ? '1px solid #0f172a' : '1px solid #cbd5e1',
            boxShadow: activeSubTab === 'refund' ? '0 2px 8px rgba(15,23,42,0.18)' : 'none',
            transition: 'all 0.15s ease'
          }}
          onClick={() => setActiveSubTab('refund')}
        >
          <span>Hoàn tiền</span>
          {payments.some((p) => p.status === 'REFUNDED') && (
            <span
              style={{
                background: '#64748b',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 800,
                lineHeight: '1'
              }}
            >
              {payments.filter((p) => p.status === 'REFUNDED').length}
            </span>
          )}
        </button>
      </div>

      {/* 4. BỘ LỌC THEO WIREFRAME (Tìm mã GD/tên/SĐT | Mục đích ▾ | Phương thức ▾ | Ngày ▾) */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '18px',
          flexWrap: 'wrap'
        }}
      >
        {/* 🔍 Tìm mã GD/tên/SĐT */}
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '14px'
            }}
          ></i>
          <input
            type="text"
            placeholder="Tìm mã GD, tên khách, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 16px 11px 40px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13.5px',
              color: '#0f172a',
              outline: 'none',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        {/* Mục đích ▾ */}
        <div style={{ minWidth: '160px' }}>
          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13.5px',
              color: '#334155',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Mục đích ▾</option>
            <option value="BOOKING">Đặt sân cầu lông</option>
            <option value="MEMBERSHIP">Gói hội viên VIP</option>
            <option value="WALLET_TOPUP">Nạp tiền ví</option>
            <option value="EQUIPMENT">Thuê dụng cụ</option>
            <option value="FREE_GRANT">Cấp free / Tài trợ</option>
          </select>
        </div>

        {/* Phương thức ▾ */}
        <div style={{ minWidth: '150px' }}>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13.5px',
              color: '#334155',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Phương thức ▾</option>
            <option value="VietQR">VietQR</option>
            <option value="Ví D2 Pay">Ví D2 Pay</option>
            <option value="Tiền mặt">Tiền mặt</option>
            <option value="Cấp Free">Cấp Free</option>
          </select>
        </div>

        {/* Ngày ▾ */}
        <div style={{ minWidth: '140px' }}>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13.5px',
              color: '#334155',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Ngày ▾</option>
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày qua</option>
            <option value="month">Tháng này</option>
          </select>
        </div>
      </div>

      {/* 5. BẢNG DỮ LIỆU CHUẨN CỘT: Mã GD | Khách | Mục đích | Số tiền | PT | Trạng thái | … */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div className="table-responsive">
          <table
            className="admin-table"
            style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'transparent' }}>
                  Mã GD
                </th>
                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'transparent' }}>
                  Khách
                </th>
                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'transparent' }}>
                  Mục đích
                </th>
                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'transparent' }}>
                  Số tiền
                </th>
                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'transparent' }}>
                  PT
                </th>
                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'transparent' }}>
                  Trạng thái
                </th>
                <th style={{ padding: '16px 20px', width: '80px', textAlign: 'center', background: 'transparent' }}>
                  …
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu giao dịch...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    {activeSubTab === 'pending'
                      ? 'Không có giao dịch nào đang chờ xử lý.'
                      : activeSubTab === 'refund'
                        ? 'Không có giao dịch nào trong danh sách hoàn tiền.'
                        : 'Không tìm thấy giao dịch nào phù hợp với bộ lọc.'}
                  </td>
                </tr>
              ) : (
                pg.pageItems.map((p) => {
                  const isPending = p.status === 'PENDING';
                  const isPaid = p.status === 'PAID';
                  const isRefunded = p.status === 'REFUNDED';
                  const isExpired = p.status === 'EXPIRED';
                  const isFree = p.status === 'FREE' || p.amount === 0;

                  const dateStr = p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : '---';

                  return (
                    <tr
                      key={p.id}
                      className="clickable-table-row"
                      onClick={() => setSelectedPayment(p)}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                    >
                      {/* 1. Mã GD */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <div style={{ color: '#0284c7', fontSize: '14px', fontWeight: 700 }}>
                          #{p.paymentCode}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {dateStr}
                        </div>
                      </td>

                      {/* 2. Khách */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <div style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>
                          {p.user?.fullName || 'Khách vãng lai'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {p.user?.phone || '---'}
                        </div>
                      </td>

                      {/* 3. Mục đích */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            background:
                              p.purpose === 'BOOKING'
                                ? '#e0f2fe'
                                : p.purpose === 'MEMBERSHIP'
                                  ? '#fef3c7'
                                  : p.purpose === 'WALLET_TOPUP'
                                    ? '#ede9fe'
                                    : p.purpose === 'EQUIPMENT'
                                      ? '#dcfce7'
                                      : '#f1f5f9',
                            color:
                              p.purpose === 'BOOKING'
                                ? '#0369a1'
                                : p.purpose === 'MEMBERSHIP'
                                  ? '#b45309'
                                  : p.purpose === 'WALLET_TOPUP'
                                    ? '#6d28d9'
                                    : p.purpose === 'EQUIPMENT'
                                      ? '#166534'
                                      : '#475569',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'inline-block'
                          }}
                        >
                          {p.purposeLabel || p.purpose}
                        </span>
                      </td>

                      {/* 4. Số tiền */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <div
                          style={{
                            color: isFree ? '#0284c7' : '#0f172a',
                            fontSize: '14.5px',
                            fontWeight: 800
                          }}
                        >
                          {isFree ? '0 đ (Free)' : `${Number(p.amount || 0).toLocaleString('vi-VN')} đ`}
                        </div>
                      </td>

                      {/* 5. PT (Phương thức) */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#334155'
                          }}
                        >
                          {p.method}
                        </span>
                      </td>

                      {/* 6. Trạng thái */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        {isPending && (
                          <span
                            style={{
                              color: '#ea580c',
                              fontWeight: 700,
                              fontSize: '13px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            Chờ duyệt <span style={{ fontSize: '16px', lineHeight: 0 }}>•</span>
                          </span>
                        )}
                        {isPaid && (
                          <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '13px' }}>
                            Đã thanh toán
                          </span>
                        )}
                        {isRefunded && (
                          <span style={{ color: '#7c3aed', fontWeight: 700, fontSize: '13px' }}>
                            Đã hoàn tiền
                          </span>
                        )}
                        {isExpired && (
                          <span style={{ color: '#64748b', fontWeight: 700, fontSize: '13px' }}>
                            Quá hạn
                          </span>
                        )}
                        {p.status === 'FAILED' && (
                          <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '13px' }}>
                            Từ chối / Hủy
                          </span>
                        )}
                        {isFree && p.status === 'FREE' && (
                          <span style={{ color: '#0284c7', fontWeight: 700, fontSize: '13px' }}>
                            Cấp free
                          </span>
                        )}
                      </td>

                      {/* 7. … (Thao tác nhanh) */}
                      <td
                        style={{ padding: '16px 20px', verticalAlign: 'middle', textAlign: 'center' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="mem-action-btn-sm"
                              title="Duyệt nhanh thanh toán"
                              disabled={processingId === p.id}
                              onClick={() => handleConfirmPayment(p)}
                            >
                              <i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i>
                            </button>
                            <button
                              type="button"
                              className="mem-action-btn-sm"
                              title="Từ chối / Hủy"
                              onClick={() => handleRejectPayment(p)}
                            >
                              <i className="fa-solid fa-xmark" style={{ color: '#ef4444' }}></i>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="mem-action-btn-sm"
                            title="Xem chi tiết giao dịch (Drawer)"
                            onClick={() => setSelectedPayment(p)}
                          >
                            <i className="fa-regular fa-eye"></i>
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

        {/* 6. PHÂN TRANG (Hiển thị 1-10 / N ‹ 1 2 3 ›) */}
        <div style={{ padding: '10px 16px' }}>
          <PaginationBar pagination={pg} unit="giao dịch" />
        </div>
      </div>

      {/* 7. PANEL CHI TIẾT BÊN PHẢI (DRAWER SLIDE-OVER) */}
      {selectedPayment && (
        <ModalPortal>
          <div
            onClick={() => setSelectedPayment(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'flex-end',
              backdropFilter: 'blur(2px)'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '520px',
                height: '100%',
                backgroundColor: '#ffffff',
                boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideInRight 0.25s ease-out',
                overflowY: 'auto'
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                      Giao dịch #{selectedPayment.paymentCode}
                    </h3>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background:
                          selectedPayment.status === 'PAID'
                            ? '#dcfce7'
                            : selectedPayment.status === 'PENDING'
                              ? '#ffedd5'
                              : '#f1f5f9',
                        color:
                          selectedPayment.status === 'PAID'
                            ? '#166534'
                            : selectedPayment.status === 'PENDING'
                              ? '#c2410c'
                              : '#475569'
                      }}
                    >
                      {selectedPayment.status === 'PAID'
                        ? 'Đã Thanh Toán'
                        : selectedPayment.status === 'PENDING'
                          ? 'Chờ Duyệt'
                          : selectedPayment.status === 'REFUNDED'
                            ? 'Đã Hoàn Tiền'
                            : selectedPayment.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Tạo lúc:{' '}
                    {selectedPayment.createdAt
                      ? new Date(selectedPayment.createdAt).toLocaleString('vi-VN')
                      : '---'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '22px',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title="Đóng panel (✕)"
                >
                  &times;
                </button>
              </div>

              {/* Drawer Body */}
              <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                {/* Số tiền thanh toán to & rõ ràng */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '18px',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0',
                    marginBottom: '20px'
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                    Tổng số tiền thanh toán
                  </span>
                  <div
                    style={{
                      fontSize: '30px',
                      fontWeight: 900,
                      color: selectedPayment.status === 'PAID' ? '#16a34a' : '#0284c7',
                      marginTop: '4px'
                    }}
                  >
                    {selectedPayment.amount === 0
                      ? '0 đ (Cấp Free)'
                      : `${Number(selectedPayment.amount || 0).toLocaleString('vi-VN')} đ`}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
                    Phương thức: {selectedPayment.method}
                  </div>
                </div>

                {/* Thông tin khách hàng */}
                <div style={{ marginBottom: '22px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fa-solid fa-user" style={{ marginRight: '6px', color: '#0284c7' }}></i>
                    Khách hàng
                  </h4>
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {selectedPayment.user?.fullName?.charAt(0) || 'K'}
                    </div>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>
                        {selectedPayment.user?.fullName || 'Khách vãng lai'}
                      </strong>
                      <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                        <i className="fa-solid fa-phone" style={{ marginRight: '5px' }}></i>
                        {selectedPayment.user?.phone || '---'}
                        {selectedPayment.user?.email && (
                          <>
                            &nbsp;&bull;&nbsp;
                            <i className="fa-solid fa-envelope" style={{ marginRight: '5px' }}></i>
                            {selectedPayment.user.email}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chi tiết dịch vụ */}
                <div style={{ marginBottom: '22px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fa-solid fa-circle-info" style={{ marginRight: '6px', color: '#0284c7' }}></i>
                    Chi tiết đơn hàng
                  </h4>
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      background: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>Mục đích:</span>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                        {selectedPayment.purposeLabel || selectedPayment.purpose}
                      </strong>
                    </div>
                    {selectedPayment.branchName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Chi nhánh:</span>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{selectedPayment.branchName}</strong>
                      </div>
                    )}
                    {selectedPayment.courtName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Sân / Dịch vụ:</span>
                        <strong style={{ fontSize: '13px', color: '#0284c7' }}>{selectedPayment.courtName}</strong>
                      </div>
                    )}
                    {selectedPayment.playDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Thời gian:</span>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                          {selectedPayment.playDate} ({selectedPayment.timeSlot})
                        </strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>Mã đối soát ngân hàng:</span>
                      <code style={{ fontSize: '13px', color: '#ea580c', fontWeight: 700 }}>
                        {selectedPayment.transactionRef || '---'}
                      </code>
                    </div>
                    {selectedPayment.paidAt && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Thời điểm hoàn tất:</span>
                        <strong style={{ fontSize: '13px', color: '#16a34a' }}>
                          {new Date(selectedPayment.paidAt).toLocaleString('vi-VN')}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hóa đơn chuyển khoản VietQR */}
                {selectedPayment.method === 'VietQR' && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <i className="fa-solid fa-qrcode" style={{ marginRight: '6px', color: '#0284c7' }}></i>
                      Thông tin đối soát VietQR
                    </h4>
                    <div
                      style={{
                        border: '2px dashed #0284c7',
                        borderRadius: '10px',
                        padding: '16px',
                        background: '#f0f9ff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <i className="fa-solid fa-building-columns" style={{ color: '#0284c7', fontSize: '18px' }}></i>
                        <div>
                          <strong style={{ fontSize: '13.5px', color: '#0369a1' }}>Ngân Hàng Quân Đội (MB Bank)</strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Số TK: 0987654321 &bull; D2 BADMINTON CLUB</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155', background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                        Nội dung CK chuẩn: <strong>{selectedPayment.paymentCode}</strong>
                      </div>
                      {selectedPayment.note && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                          <i className="fa-solid fa-circle-check" style={{ color: '#16a34a', marginRight: '4px' }}></i>
                          {selectedPayment.note}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lý do hoàn tiền (nếu đã hoàn) */}
                {selectedPayment.status === 'REFUNDED' && (
                  <div
                    style={{
                      background: '#f5f3ff',
                      border: '1px solid #ddd6fe',
                      borderRadius: '10px',
                      padding: '14px',
                      marginBottom: '20px'
                    }}
                  >
                    <strong style={{ color: '#6d28d9', fontSize: '13.5px', display: 'block', marginBottom: '4px' }}>
                      <i className="fa-solid fa-rotate-left" style={{ marginRight: '6px' }}></i>
                      Thông tin hoàn tiền
                    </strong>
                    <div style={{ fontSize: '12.5px', color: '#5b21b6' }}>
                      Lý do: {selectedPayment.refundReason || 'Khách yêu cầu hủy đơn'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#7c3aed', marginTop: '4px' }}>
                      Thời gian: {selectedPayment.refundedAt ? new Date(selectedPayment.refundedAt).toLocaleString('vi-VN') : '---'}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px'
                }}
              >
                {selectedPayment.status === 'PENDING' ? (
                  <>
                    <button
                      type="button"
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: '1px solid #fca5a5',
                        background: '#ffffff',
                        color: '#dc2626',
                        fontWeight: 700,
                        fontSize: '13.5px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleRejectPayment(selectedPayment)}
                    >
                      <i className="fa-solid fa-xmark"></i> Từ Chối
                    </button>

                    <button
                      type="button"
                      style={{
                        padding: '10px 22px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      disabled={processingId === selectedPayment.id}
                      onClick={() => handleConfirmPayment(selectedPayment)}
                    >
                      {processingId === selectedPayment.id ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fa-solid fa-check"></i>
                      )}
                      Xác Nhận Đã Nhận Tiền
                    </button>
                  </>
                ) : selectedPayment.status === 'PAID' ? (
                  <>
                    <button
                      type="button"
                      style={{
                        padding: '9px 16px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handlePrintInvoice(selectedPayment)}
                    >
                      <i className="fa-solid fa-print"></i> In Hóa Đơn
                    </button>

                    <button
                      type="button"
                      style={{
                        padding: '9px 18px',
                        borderRadius: '8px',
                        border: '1px solid #ddd6fe',
                        background: '#ede9fe',
                        color: '#6d28d9',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleOpenRefundModal(selectedPayment)}
                    >
                      <i className="fa-solid fa-rotate-left"></i> Hoàn Tiền
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    style={{
                      padding: '9px 18px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#334155',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedPayment(null)}
                  >
                    Đóng Panel
                  </button>
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* 8. MODAL HOÀN TIỀN */}
      {refundModalPayment && (
        <ModalPortal>
          <div
            className="admin-modal-backdrop show"
            onClick={() => setRefundModalPayment(null)}
          >
            <div
              className="admin-modal-box"
              style={{ maxWidth: '480px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>
                  <i className="fa-solid fa-rotate-left" style={{ color: '#7c3aed' }}></i> Xác Nhận Hoàn Tiền
                </h3>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setRefundModalPayment(null)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmitRefund}>
                <div className="admin-modal-body" style={{ padding: '20px' }}>
                  <p style={{ fontSize: '13.5px', color: '#334155', margin: '0 0 14px' }}>
                    Xác nhận hoàn trả số tiền{' '}
                    <strong style={{ color: '#0284c7' }}>
                      {Number(refundModalPayment.amount || 0).toLocaleString('vi-VN')} đ
                    </strong>{' '}
                    cho khách hàng <strong>{refundModalPayment.user?.fullName}</strong>.
                  </p>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Lý Do Hoàn Tiền *
                    </label>
                    <textarea
                      rows="3"
                      required
                      className="form-control"
                      value={refundReasonInput}
                      onChange={(e) => setRefundReasonInput(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div
                  className="admin-modal-footer"
                  style={{
                    padding: '14px 20px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    borderTop: '1px solid #e2e8f0'
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding: '9px 16px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#475569',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => setRefundModalPayment(null)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '9px 18px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#7c3aed',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Xác Nhận Hoàn Tiền
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </section>
  );
}
