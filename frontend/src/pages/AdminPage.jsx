import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import AdminNav from '../components/admin/AdminNav';
import AdminBookingsTab from '../components/admin/AdminBookingsTab';
import AdminProductsTab from '../components/admin/AdminProductsTab';
import AdminBranchesTab from '../components/admin/AdminBranchesTab';
import AdminPricingTab from '../components/admin/AdminPricingTab';
import ProductModal from '../components/admin/ProductModal';

import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  fetchAdminBookings,
  fetchAllBookings,
  confirmBookingAdmin,
  cancelBookingAdmin,
  fetchProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchBranches
} from '../services/api';

import { COURTS_NVL } from '../data/courtData';
import '../styles/admin.css';

export default function AdminPage({ onNavigate }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [courts, setCourts] = useState(COURTS_NVL);
  const [isLoading, setIsLoading] = useState(false);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const tabContainerRef = useRef(null);

  // Check auth on mount
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const user = await fetchCurrentUser();
        if (user && (user.role === 'ADMIN' || user.role === 'STAFF' || user.role === 'ROLE_ADMIN' || user.role === 'ROLE_STAFF')) {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    verifyAuth();
  }, []);

  // Load Initial Data when authenticated
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bRes, pList, brList] = await Promise.all([
        fetchAdminBookings(0, 50).catch(() => fetchAllBookings()),
        fetchProducts(),
        fetchBranches()
      ]);
      const bList = bRes && bRes.content ? bRes.content : (Array.isArray(bRes) ? bRes : []);
      setBookings(bList);
      setProducts(pList || []);
      setBranches(brList || []);
    } catch (err) {
      console.error('Lỗi nạp dữ liệu Admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Handle Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const data = await loginUser(loginForm.username, loginForm.password);
      const user = data.user;
      if (user && (user.role === 'ADMIN' || user.role === 'STAFF' || user.role === 'ROLE_ADMIN' || user.role === 'ROLE_STAFF')) {
        setCurrentUser(user);
      } else {
        logoutUser();
        setLoginError('Tài khoản của bạn không có quyền truy cập trang quản trị (yêu cầu ROLE_ADMIN hoặc ROLE_STAFF)!');
      }
    } catch (err) {
      setLoginError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // GSAP Tab Switch Animation
  const handleSwitchTab = (tabKey) => {
    setActiveTab(tabKey);
    if (tabContainerRef.current) {
      gsap.fromTo(
        tabContainerRef.current,
        { opacity: 0.6, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
  };

  // Real Admin Actions (ZERO MOCK FALLBACK)
  const handleConfirmPayment = async (id) => {
    if (!window.confirm(`Xác nhận duyệt và xác nhận đơn đặt sân #${id}?`)) return;
    try {
      await confirmBookingAdmin(id);
      alert(`Đã xác nhận đơn #${id} thành công!`);
      loadData();
    } catch (err) {
      alert(`Không thể xác nhận đơn #${id}: ${err.message}`);
    }
  };

  const handleCancelBooking = async (id) => {
    const reason = window.prompt(`Nhập lý do hủy đơn #${id}:`, 'Khách yêu cầu hủy qua điện thoại');
    if (reason === null) return;
    try {
      await cancelBookingAdmin(id, reason);
      alert(`Đã hủy đơn #${id} thành công!`);
      loadData();
    } catch (err) {
      alert(`Không thể hủy đơn #${id}: ${err.message}`);
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleToggleProductActive = async (id) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    try {
      await updateAdminProduct(id, { ...prod, active: !prod.active });
      loadData();
    } catch (err) {
      alert(`Không thể đổi trạng thái sản phẩm: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?')) return;
    try {
      await deleteAdminProduct(id);
      alert('Đã xóa sản phẩm thành công!');
      loadData();
    } catch (err) {
      alert(`Không thể xóa sản phẩm: ${err.message}`);
    }
  };

  const handleSaveProduct = async (formData) => {
    try {
      if (formData.id) {
        await updateAdminProduct(formData.id, formData);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await createAdminProduct(formData);
        alert('Thêm sản phẩm mới thành công!');
      }
      setIsProductModalOpen(false);
      loadData();
    } catch (err) {
      alert(`Không thể lưu sản phẩm: ${err.message}`);
    }
  };

  // 1. Loading screen while checking auth
  if (isCheckingAuth) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#0284c7' }}></i>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Đang xác thực quyền truy cập Quản Trị Viên...</p>
      </div>
    );
  }

  // 2. Unauthenticated / Forbidden view (Admin Guard)
  if (!currentUser) {
    return (
      <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#fff', borderRadius: '16px', padding: '36px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)' }}>
              <i className="fa-solid fa-lock"></i>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              CỔNG QUẢN TRỊ VIÊN
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Vui lòng đăng nhập bằng tài khoản Quản Trị hoặc Nhân Viên để tiếp tục
            </p>
          </div>

          {loginError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', color: '#b91c1c', fontSize: '13px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Tài khoản đăng nhập:
              </label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="VD: admin"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Mật khẩu:
              </label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Nhập mật khẩu (mặc định: 123456)"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isLoggingIn ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Đang xác thực...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i> Đăng Nhập Quản Trị
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('booking')}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              <i className="fa-solid fa-arrow-left"></i> Quay Về Trang Đặt Sân
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin Portal view
  return (
    <div className="ways-admin-page-root" style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <main className="admin-main-container">
        {/* ADMIN TITLE BANNER */}
        <div className="admin-top-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(2, 132, 199, 0.2)' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-shield-halved"></i> BẢNG ĐIỀU KHIỂN QUẢN TRỊ HỆ THỐNG
            </h2>
            <p style={{ fontSize: '12px', opacity: 0.9, margin: '4px 0 0 0' }}>
              Xin chào, <strong>{currentUser.fullName || currentUser.username}</strong> ({currentUser.role})
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={loadData}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-rotate"></i> Đồng Bộ
            </button>
            <button
              type="button"
              onClick={handleAdminLogout}
              style={{ background: 'rgba(239, 68, 68, 0.85)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-right-from-bracket"></i> Đăng Xuất
            </button>
          </div>
        </div>

        {/* TAB MENU */}
        <nav className="tab-menu-bar">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('bookings')}
          >
            <i className="fa-solid fa-calendar-days"></i> Quản Lý Đơn Đặt Sân
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('products')}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i> Quản Lý Dụng Cụ, Vợt & Giày
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('branches')}
          >
            <i className="fa-solid fa-building"></i> Quản Lý 4 Chi Nhánh & Sân Đấu
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('pricing')}
          >
            <i className="fa-solid fa-tags"></i> Cấu Hình Bảng Giá & Giờ Chơi
          </button>
        </nav>

        {/* TAB CONTENT PANES */}
        <div ref={tabContainerRef}>
          {activeTab === 'bookings' && (
            <AdminBookingsTab
              bookings={bookings}
              onRefresh={loadData}
              onConfirmPayment={handleConfirmPayment}
              onCancelBooking={handleCancelBooking}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsTab
              products={products}
              onOpenAddModal={handleOpenAddProduct}
              onEditProduct={handleEditProduct}
              onToggleActive={handleToggleProductActive}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'branches' && (
            <AdminBranchesTab
              branches={branches}
              courts={courts}
              onOpenAddBranch={() => alert('Thêm chi nhánh mới')}
              onOpenAddCourt={() => alert('Thêm sân mới')}
              onDeleteBranch={(id) => alert(`Xóa chi nhánh ${id}`)}
              onDeleteCourt={(id) => alert(`Xóa sân ${id}`)}
            />
          )}

          {activeTab === 'pricing' && <AdminPricingTab />}
        </div>
      </main>

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        initialData={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
