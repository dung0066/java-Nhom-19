import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Shield,
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Package,
  ArrowLeft,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Clock,
  Eye,
  Filter
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function AdminPortal({ onBackToUserSite }) {
  const adminContainerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('bookings'); // 'dashboard', 'bookings', 'courts', 'products'
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [bookings, setBookings] = useState([]);
  const [branches, setBranches] = useState([]);
  const [courts, setCourts] = useState([]);
  const [products, setProducts] = useState([]);

  // Filter states
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(1);

  // Modal states for creating/editing
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [courtForm, setCourtForm] = useState({ id: null, branchId: 1, name: '', courtNumber: 1, courtGroup: 'Cụm 1 (Sân 1+2)', active: true });

  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ id: null, name: '', category: 'RACQUET', brand: '', price: 25000, priceUnit: '/ buổi chơi', badge: '', description: '', active: true });

  // GSAP animation on tab change
  useGSAP(() => {
    gsap.from('.admin-content-card', {
      opacity: 0,
      y: 12,
      duration: 0.35,
      ease: 'power2.out'
    });
  }, { scope: adminContainerRef, dependencies: [activeTab] });

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Bookings
      const bRes = await fetch('/api/booking/all').catch(() => null);
      if (bRes && bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData || []);
      } else {
        // Fallback demo bookings
        setBookings([
          { id: 5001, bookingCode: 'WAY-20261009-5001', customerName: 'Nguyễn Văn Tuấn', customerPhone: '0909 123 456', bookingDate: '2026-10-09', branch: { name: 'Ways Station NVL', code: 'NVL' }, totalPrice: 840000, totalHours: 7, status: 'CONFIRMED', paymentMethod: 'VIETQR' },
          { id: 5002, bookingCode: 'WAY-20261009-5002', customerName: 'Trần Minh Đức', customerPhone: '0912 345 678', bookingDate: '2026-10-09', branch: { name: 'Ways Station NVL', code: 'NVL' }, totalPrice: 240000, totalHours: 2, status: 'CONFIRMED', paymentMethod: 'VIETQR' },
          { id: 5003, bookingCode: 'WAY-20261009-5003', customerName: 'Lê Hoàng Nam', customerPhone: '0988 777 666', bookingDate: '2026-10-10', branch: { name: 'Ways Station DQII', code: 'DQII' }, totalPrice: 120000, totalHours: 1, status: 'CANCELLED', paymentMethod: 'CASH' }
        ]);
      }

      // 2. Branches
      const brRes = await fetch('/api/branches').catch(() => null);
      if (brRes && brRes.ok) {
        const brData = await brRes.json();
        setBranches(brData || []);
      } else {
        setBranches([
          { id: 1, code: 'NVL', name: 'Ways Station NVL', address: '70 Nguyễn Văn Lượng, Gò Vấp', totalCourts: 7 },
          { id: 2, code: 'DQII', name: 'Ways Station DQII', address: '262 Dương Quảng Hàm, Gò Vấp', totalCourts: 4 },
          { id: 3, code: 'NQA', name: 'Ways Station NQA', address: '86 Nguyễn Quý Anh, Tân Phú', totalCourts: 6 },
          { id: 4, code: 'HB', name: 'Ways Station HB', address: '135 Hiệp Bình, Thủ Đức', totalCourts: 2 }
        ]);
      }

      // 3. Courts
      const cRes = await fetch('/api/courts').catch(() => null);
      if (cRes && cRes.ok) {
        const cData = await cRes.json();
        setCourts(cData || []);
      } else {
        setCourts([
          { id: 1, name: 'Sân 1', courtNumber: 1, courtGroup: 'Cụm 1 (Sân 1+2)', branch: { id: 1, code: 'NVL' }, active: true },
          { id: 2, name: 'Sân 2', courtNumber: 2, courtGroup: 'Cụm 1 (Sân 1+2)', branch: { id: 1, code: 'NVL' }, active: true },
          { id: 3, name: 'Sân 3', courtNumber: 3, courtGroup: 'Cụm 2 (Sân 3+4)', branch: { id: 1, code: 'NVL' }, active: true },
          { id: 4, name: 'Sân 4', courtNumber: 4, courtGroup: 'Cụm 2 (Sân 3+4)', branch: { id: 1, code: 'NVL' }, active: true },
          { id: 5, name: 'Sân 5', courtNumber: 5, courtGroup: 'Cụm 3 (Sân 5+6)', branch: { id: 1, code: 'NVL' }, active: true },
          { id: 6, name: 'Sân 6', courtNumber: 6, courtGroup: 'Cụm 3 (Sân 5+6)', branch: { id: 1, code: 'NVL' }, active: true },
          { id: 7, name: 'Sân 7', courtNumber: 7, courtGroup: 'Cụm 4 (Sân 7 VIP)', branch: { id: 1, code: 'NVL' }, active: true }
        ]);
      }

      // 4. Products
      const pRes = await fetch('/api/products?all=true').catch(() => null);
      if (pRes && pRes.ok) {
        const pData = await pRes.json();
        setProducts(pData || []);
      } else {
        setProducts([
          { id: 1, name: 'Yonex Astrox 88D Pro / 100ZZ', category: 'RACQUET', brand: 'YONEX JAPAN', price: 30000, priceUnit: '/ buổi chơi', badge: 'HOT NHẤT', active: true },
          { id: 2, name: 'Victor Thruster Ryuga / Falcon', category: 'RACQUET', brand: 'VICTOR TAIWAN', price: 25000, priceUnit: '/ buổi chơi', badge: 'VIP ATTACK', active: true },
          { id: 3, name: 'Giày Yonex 65Z3 Khử Khuẩn UV', category: 'SHOES', brand: 'YONEX CUSHION', price: 25000, priceUnit: '/ buổi chơi', badge: 'KHỬ KHUẨN UV', active: true },
          { id: 4, name: 'Ống Cầu Victor Gold (12 Quả)', category: 'ACCESSORY', brand: 'VICTOR', price: 230000, priceUnit: '/ ống 12 quả', badge: 'THI ĐẤU', active: true }
        ]);
      }
    } catch (err) {
      console.warn('Backend load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Actions
  const handleCancelBooking = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn đặt sân này?')) return;
    try {
      await fetch(`/api/booking/cancel/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b)));
  };

  const handleToggleCourt = async (courtId) => {
    try {
      await fetch(`/api/courts/${courtId}/toggle`, { method: 'PATCH' });
    } catch (e) {}
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, active: !c.active } : c)));
  };

  const handleDeleteCourt = async (courtId) => {
    if (!confirm('Xóa sân này khỏi hệ thống?')) return;
    try {
      await fetch(`/api/courts/${courtId}`, { method: 'DELETE' });
    } catch (e) {}
    setCourts((prev) => prev.filter((c) => c.id !== courtId));
  };

  const handleSaveCourt = async (e) => {
    e.preventDefault();
    try {
      const url = courtForm.id ? `/api/courts/${courtForm.id}` : '/api/courts';
      const method = courtForm.id ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courtForm)
      });
    } catch (e) {}
    setShowCourtModal(false);
    loadAllData();
  };

  const handleToggleProduct = async (prodId) => {
    try {
      await fetch(`/api/products/${prodId}/toggle`, { method: 'PATCH' });
    } catch (e) {}
    setProducts((prev) => prev.map((p) => (p.id === prodId ? { ...p, active: !p.active } : p)));
  };

  const handleDeleteProduct = async (prodId) => {
    if (!confirm('Xóa sản phẩm này khỏi kho cho thuê?')) return;
    try {
      await fetch(`/api/products/${prodId}`, { method: 'DELETE' });
    } catch (e) {}
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = productForm.id ? `/api/products/${productForm.id}` : '/api/products';
      const method = productForm.id ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });
    } catch (e) {}
    setShowProductModal(false);
    loadAllData();
  };

  // Calculations for dashboard
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalHours = confirmedBookings.reduce((sum, b) => sum + (b.totalHours || 1), 0);

  const filteredBookings = bookings.filter((b) => {
    const branchMatch = filterBranch === 'ALL' || (b.branch && b.branch.code === filterBranch);
    const query = searchQuery.toLowerCase().trim();
    const searchMatch = !query ||
      (b.bookingCode && b.bookingCode.toLowerCase().includes(query)) ||
      (b.customerName && b.customerName.toLowerCase().includes(query)) ||
      (b.customerPhone && b.customerPhone.includes(query));
    return branchMatch && searchMatch;
  });

  const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <div className="admin-portal-wrapper" ref={adminContainerRef}>
      {/* 1. TOP ADMIN NAV */}
      <header className="admin-top-nav">
        <div className="admin-nav-left">
          <button type="button" onClick={onBackToUserSite} className="btn-back-to-site">
            <ArrowLeft size={16} />
            <span>Về Trang Đặt Sân Khách</span>
          </button>
          <div className="admin-brand-title">
            <Shield size={20} className="text-cyan" />
            <span>HỆ THỐNG QUẢN TRỊ TOÀN DIỆN WAYS STATION</span>
          </div>
        </div>

        <div className="admin-nav-right">
          <button type="button" onClick={loadAllData} className="btn-admin-refresh">
            <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
            <span>Đồng Bộ Dữ Liệu</span>
          </button>
          <span className="admin-badge-live">Spring Boot API</span>
        </div>
      </header>

      {/* 2. ADMIN BODY: SIDEBAR + CONTENT */}
      <div className="admin-body-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`admin-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Tổng Quan Doanh Thu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`admin-menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
          >
            <CalendarCheck size={18} />
            <span>Quản Lý Đơn Đặt Sân ({bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('courts')}
            className={`admin-menu-item ${activeTab === 'courts' ? 'active' : ''}`}
          >
            <Building2 size={18} />
            <span>Quản Lý Sân & Chi Nhánh ({courts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`admin-menu-item ${activeTab === 'products' ? 'active' : ''}`}
          >
            <Package size={18} />
            <span>Kho Vợt & Dụng Cụ ({products.length})</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="admin-main-viewport">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="admin-content-card">
              <h2 className="admin-section-heading">Bảng Thống Kê Hoạt Động & Doanh Thu</h2>
              <div className="admin-metrics-grid">
                <div className="metric-box bg-emerald">
                  <span className="metric-title">Tổng Doanh Thu Đã Xác Nhận</span>
                  <span className="metric-num">{formatVND(totalRevenue)}</span>
                  <span className="metric-sub">Từ {confirmedBookings.length} lượt đặt sân</span>
                </div>

                <div className="metric-box bg-cyan">
                  <span className="metric-title">Tổng Giờ Sân Đã Phục Vụ</span>
                  <span className="metric-num">{totalHours} Giờ</span>
                  <span className="metric-sub">Trung bình {(totalHours / (confirmedBookings.length || 1)).toFixed(1)}h/đơn</span>
                </div>

                <div className="metric-box bg-amber">
                  <span className="metric-title">Số Lượng Chi Nhánh</span>
                  <span className="metric-num">{branches.length} Cơ Sở</span>
                  <span className="metric-sub">NVL, DQII, NQA, HB</span>
                </div>

                <div className="metric-box bg-purple">
                  <span className="metric-title">Tổng Số Sân Thi Đấu</span>
                  <span className="metric-num">{courts.length} Sân BWF</span>
                  <span className="metric-sub">Thảm Taraflex 7.5mm</span>
                </div>
              </div>

              {/* Quick Chart or Summary */}
              <div className="dashboard-summary-panel mt-4">
                <h3>Tình Trạng Đơn Hàng Hôm Nay</h3>
                <div className="order-status-bars">
                  <div className="status-bar-row">
                    <span>Đã Xác Nhận ({confirmedBookings.length})</span>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-emerald"
                        style={{ width: `${(confirmedBookings.length / (bookings.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="status-bar-row">
                    <span>Đã Hủy ({bookings.filter((b) => b.status === 'CANCELLED').length})</span>
                    <div className="progress-track">
                      <div
                        className="progress-fill fill-red"
                        style={{ width: `${(bookings.filter((b) => b.status === 'CANCELLED').length / (bookings.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUẢN LÝ ĐƠN ĐẶT SÂN */}
          {activeTab === 'bookings' && (
            <div className="admin-content-card">
              <div className="table-header-tools">
                <div>
                  <h2 className="admin-section-heading">Danh Sách Đơn Đặt Sân</h2>
                  <p className="admin-section-sub">Đồng bộ trực tiếp từ Database qua API: /api/booking/all</p>
                </div>

                <div className="tools-right">
                  <div className="search-bar-input">
                    <Search size={15} />
                    <input
                      type="text"
                      placeholder="Tìm mã đơn, tên, SĐT..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="branch-filter-select"
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                  >
                    <option value="ALL">Tất cả chi nhánh</option>
                    <option value="NVL">Ways Station NVL</option>
                    <option value="DQII">Ways Station DQII</option>
                    <option value="NQA">Ways Station NQA</option>
                    <option value="HB">Ways Station HB</option>
                  </select>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="admin-table-container">
                <table className="admin-styled-table">
                  <thead>
                    <tr>
                      <th>Mã Đơn</th>
                      <th>Khách Hàng</th>
                      <th>SĐT</th>
                      <th>Chi Nhánh</th>
                      <th>Ngày Chơi</th>
                      <th>Tổng Giờ</th>
                      <th>Tổng Tiền</th>
                      <th>Thanh Toán</th>
                      <th>Trạng Thái</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="empty-table-cell">Không có đơn đặt sân nào phù hợp.</td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id || b.bookingCode}>
                          <td><strong>{b.bookingCode}</strong></td>
                          <td>{b.customerName}</td>
                          <td>{b.customerPhone}</td>
                          <td><span className="branch-tag-mini">{b.branch?.code || 'NVL'}</span></td>
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
                                onClick={() => handleCancelBooking(b.id)}
                                className="btn-action-delete"
                                title="Hủy đơn đặt sân"
                              >
                                <Trash2 size={13} />
                                <span>Hủy</span>
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
          )}

          {/* TAB 3: QUẢN LÝ SÂN & CHI NHÁNH */}
          {activeTab === 'courts' && (
            <div className="admin-content-card">
              <div className="table-header-tools">
                <div>
                  <h2 className="admin-section-heading">Quản Lý Sân Thi Đấu & Cụm Sân</h2>
                  <p className="admin-section-sub">Thêm, sửa cấu hình cụm sân, kích hoạt hoặc tạm dừng sân bảo trì</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCourtForm({ id: null, branchId: 1, name: `Sân ${courts.length + 1}`, courtNumber: courts.length + 1, courtGroup: 'Cụm sân mới', active: true });
                    setShowCourtModal(true);
                  }}
                  className="btn-admin-primary"
                >
                  <Plus size={15} />
                  <span>Thêm Sân Mới</span>
                </button>
              </div>

              {/* Courts Grid */}
              <div className="admin-cards-grid">
                {courts.map((c) => (
                  <div key={c.id} className={`court-admin-card ${c.active ? 'active' : 'inactive'}`}>
                    <div className="court-card-top">
                      <span className="court-number-badge">Số {c.courtNumber || c.id}</span>
                      <span className={`active-pill ${c.active ? 'active' : 'inactive'}`}>
                        {c.active ? 'Đang hoạt động' : 'Tạm dừng / Bảo trì'}
                      </span>
                    </div>

                    <h4 className="court-card-title">{c.name}</h4>
                    <p className="court-group-tag">{c.courtGroup || 'Cụm sân tiêu chuẩn'}</p>

                    <div className="court-actions-row">
                      <button
                        type="button"
                        onClick={() => handleToggleCourt(c.id)}
                        className={`btn-toggle-active ${c.active ? 'deactivate' : 'activate'}`}
                      >
                        {c.active ? 'Tạm Dừng' : 'Kích Hoạt'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCourtForm({
                            id: c.id,
                            branchId: c.branch?.id || 1,
                            name: c.name,
                            courtNumber: c.courtNumber,
                            courtGroup: c.courtGroup,
                            active: c.active
                          });
                          setShowCourtModal(true);
                        }}
                        className="btn-edit-court"
                      >
                        <Edit3 size={13} />
                        <span>Sửa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCourt(c.id)}
                        className="btn-delete-court"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: KHO VỢT & SẢN PHẨM */}
          {activeTab === 'products' && (
            <div className="admin-content-card">
              <div className="table-header-tools">
                <div>
                  <h2 className="admin-section-heading">Kho Vợt, Giày & Dịch Vụ Cho Thuê</h2>
                  <p className="admin-section-sub">Đồng bộ trực tiếp với Controller /api/products</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProductForm({ id: null, name: '', category: 'RACQUET', brand: '', price: 25000, priceUnit: '/ buổi chơi', badge: '', description: '', active: true });
                    setShowProductModal(true);
                  }}
                  className="btn-admin-primary"
                >
                  <Plus size={15} />
                  <span>Thêm Sản Phẩm Mới</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="admin-table-container">
                <table className="admin-styled-table">
                  <thead>
                    <tr>
                      <th>Tên Dụng Cụ</th>
                      <th>Danh Mục</th>
                      <th>Thương Hiệu</th>
                      <th>Giá Thuê / Bán</th>
                      <th>Huy Hiệu</th>
                      <th>Trạng Thái</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td><span className="cat-badge-mini">{p.category}</span></td>
                        <td>{p.brand}</td>
                        <td><strong className="text-emerald">{formatVND(p.price)}</strong> <small>{p.priceUnit}</small></td>
                        <td><span className="badge-chip">{p.badge || '-'}</span></td>
                        <td>
                          <span className={`status-pill ${p.active ? 'confirmed' : 'cancelled'}`}>
                            {p.active ? 'Đang kinh doanh' : 'Tạm hết'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions-cell">
                            <button
                              type="button"
                              onClick={() => handleToggleProduct(p.id)}
                              className="btn-toggle-mini"
                            >
                              {p.active ? 'Ẩn' : 'Hiện'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setProductForm(p);
                                setShowProductModal(true);
                              }}
                              className="btn-edit-mini"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id)}
                              className="btn-delete-mini"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Thêm/Sửa Sân */}
      {showCourtModal && (
        <div className="modal-backdrop" onClick={() => setShowCourtModal(false)}>
          <div className="modal-panel small-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-section">
              <h3 className="modal-heading">{courtForm.id ? 'Sửa Thông Tin Sân' : 'Thêm Sân Mới'}</h3>
            </div>
            <form onSubmit={handleSaveCourt} className="modal-form-content">
              <div className="field-group">
                <label>Tên Sân</label>
                <input
                  type="text"
                  required
                  value={courtForm.name}
                  onChange={(e) => setCourtForm({ ...courtForm, name: e.target.value })}
                />
              </div>
              <div className="field-group mt-2">
                <label>Số thứ tự sân</label>
                <input
                  type="number"
                  required
                  value={courtForm.courtNumber}
                  onChange={(e) => setCourtForm({ ...courtForm, courtNumber: parseInt(e.target.value) })}
                />
              </div>
              <div className="field-group mt-2">
                <label>Cụm sân (Court Group)</label>
                <input
                  type="text"
                  value={courtForm.courtGroup}
                  onChange={(e) => setCourtForm({ ...courtForm, courtGroup: e.target.value })}
                />
              </div>
              <div className="modal-footer-action mt-3">
                <button type="button" onClick={() => setShowCourtModal(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-confirm-final">Lưu Sân</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Thêm/Sửa Sản Phẩm */}
      {showProductModal && (
        <div className="modal-backdrop" onClick={() => setShowProductModal(false)}>
          <div className="modal-panel small-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-section">
              <h3 className="modal-heading">{productForm.id ? 'Sửa Dụng Cụ' : 'Thêm Dụng Cụ Mới'}</h3>
            </div>
            <form onSubmit={handleSaveProduct} className="modal-form-content">
              <div className="field-group">
                <label>Tên Sản Phẩm / Dụng Cụ</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>
              <div className="field-group mt-2">
                <label>Danh Mục</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <option value="RACQUET">Vợt Cầu Lông (RACQUET)</option>
                  <option value="SHOES">Giày Cầu Lông (SHOES)</option>
                  <option value="ACCESSORY">Dụng Cụ & Nước (ACCESSORY)</option>
                </select>
              </div>
              <div className="field-group mt-2">
                <label>Thương Hiệu</label>
                <input
                  type="text"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                />
              </div>
              <div className="field-group mt-2">
                <label>Giá (VNĐ)</label>
                <input
                  type="number"
                  required
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="modal-footer-action mt-3">
                <button type="button" onClick={() => setShowProductModal(false)} className="btn-cancel">Hủy</button>
                <button type="submit" className="btn-confirm-final">Lưu Sản Phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
