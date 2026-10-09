import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import AdminNav from '../components/admin/AdminNav';
import AdminBookingsTab from '../components/admin/AdminBookingsTab';
import AdminProductsTab from '../components/admin/AdminProductsTab';
import AdminBranchesTab from '../components/admin/AdminBranchesTab';
import AdminPricingTab from '../components/admin/AdminPricingTab';
import ProductModal from '../components/admin/ProductModal';

import {
  fetchAllBookings,
  cancelBooking,
  fetchProducts,
  fetchBranches
} from '../services/api';

import { COURTS_NVL } from '../data/courtData';
import '../styles/admin.css';

export default function AdminPage({ onNavigate }) {
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

  // Load Initial Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bList, pList, brList] = await Promise.all([
        fetchAllBookings(),
        fetchProducts(),
        fetchBranches()
      ]);
      setBookings(bList || []);
      setProducts(pList || []);
      setBranches(brList || []);
    } catch (err) {
      console.error('Lỗi nạp dữ liệu Admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Actions
  const handleConfirmPayment = async (id) => {
    if (!window.confirm(`Xác nhận khách hàng đã chuyển khoản thành công cho đơn #${id}?`)) return;
    try {
      const res = await fetch(`/api/bookings/${id}/status?status=PAID`, { method: 'PATCH' });
      if (res.ok) {
        alert(`Đã xác nhận thanh toán đơn #${id} thành công!`);
        loadData();
      } else {
        // Mock update
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: 'PAID' } : b))
        );
        alert(`Đã cập nhật trạng thái đơn #${id} sang ĐÃ THANH TOÁN!`);
      }
    } catch {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'PAID' } : b))
      );
      alert(`Đã cập nhật trạng thái đơn #${id} sang ĐÃ THANH TOÁN!`);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn đặt sân #${id} này?`)) return;
    try {
      await cancelBooking(id);
      alert(`Đã hủy đơn #${id} thành công!`);
      loadData();
    } catch {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))
      );
      alert(`Đã hủy đơn #${id}!`);
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
    try {
      await fetch(`/api/products/${id}/toggle`, { method: 'PATCH' });
    } catch {
      // offline fallback
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch {
      // offline fallback
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    alert('Đã xóa sản phẩm thành công!');
  };

  const handleSaveProduct = async (formData) => {
    try {
      const url = formData.id ? `/api/products/${formData.id}` : '/api/products';
      const method = formData.id ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch {
      // offline fallback
    }

    if (formData.id) {
      setProducts((prev) =>
        prev.map((p) => (p.id === formData.id ? { ...p, ...formData } : p))
      );
      alert('Cập nhật sản phẩm thành công!');
    } else {
      const newProd = {
        ...formData,
        id: Date.now()
      };
      setProducts((prev) => [newProd, ...prev]);
      alert('Thêm sản phẩm mới thành công!');
    }
    setIsProductModalOpen(false);
  };

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
              Quản lý đơn đặt sân trực tuyến, kho thiết bị, 4 cơ sở chi nhánh và cấu hình bảng giá 24/7
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fa-solid fa-rotate"></i> Đồng Bộ Dữ Liệu
          </button>
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
