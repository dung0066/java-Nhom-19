import React, { useState, useEffect } from 'react';
import {
  fetchAdminMembershipPackages,
  createAdminMembershipPackage,
  updateAdminMembershipPackage,
  deleteAdminMembershipPackage,
  fetchAdminMembershipHistory
} from '../../services/api';

export default function AdminMembershipsTab() {
  const [packages, setPackages] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('packages'); // 'packages' | 'history'
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    price: 499000,
    durationDays: 30,
    discountPercent: 10,
    badgeColor: '#0284c7',
    icon: 'fa-solid fa-crown',
    description: '',
    studentOnly: false,
    active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pkgs, hist] = await Promise.all([
        fetchAdminMembershipPackages().catch(() => []),
        fetchAdminMembershipHistory().catch(() => [])
      ]);
      setPackages(Array.isArray(pkgs) ? pkgs : []);
      setHistory(Array.isArray(hist) ? hist : []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu gói hội viên:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setFormData({
      code: '',
      name: '',
      price: 499000,
      durationDays: 30,
      discountPercent: 10,
      badgeColor: '#0284c7',
      icon: 'fa-solid fa-crown',
      description: '',
      studentOnly: false,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      code: pkg.code || '',
      name: pkg.name || '',
      price: pkg.price || 0,
      durationDays: pkg.durationDays || 30,
      discountPercent: pkg.discountPercent || 0,
      badgeColor: pkg.badgeColor || '#0284c7',
      icon: pkg.icon || 'fa-solid fa-crown',
      description: pkg.description || '',
      studentOnly: Boolean(pkg.studentOnly),
      active: pkg.active !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Vui lòng điền đầy đủ Mã gói và Tên gói!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        discountPercent: Number(formData.discountPercent)
      };

      if (editingPackage) {
        await updateAdminMembershipPackage(editingPackage.id, payload);
        alert('Đã cập nhật gói hội viên thành công!');
      } else {
        await createAdminMembershipPackage(payload);
        alert('Đã thêm gói hội viên mới thành công!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Lỗi lưu gói hội viên: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (pkgId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa / ẩn gói hội viên #${pkgId}?`)) return;
    try {
      await deleteAdminMembershipPackage(pkgId);
      alert('Đã xóa / ẩn gói hội viên thành công!');
      loadData();
    } catch (err) {
      alert('Lỗi xóa gói: ' + (err.message || err));
    }
  };

  return (
    <section id="membershipsTab" className="tab-pane">
      {/* 1. TOP SUB-NAV BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn-tbl ${activeSubTab === 'packages' ? 'btn-tbl-edit' : ''}`}
            style={activeSubTab === 'packages' ? { background: '#0284c7', color: '#fff' } : {}}
            onClick={() => setActiveSubTab('packages')}
          >
            <i className="fa-solid fa-crown"></i> Danh Sách Gói VIP ({packages.length})
          </button>
          <button
            type="button"
            className={`btn-tbl ${activeSubTab === 'history' ? 'btn-tbl-edit' : ''}`}
            style={activeSubTab === 'history' ? { background: '#0284c7', color: '#fff' } : {}}
            onClick={() => setActiveSubTab('history')}
          >
            <i className="fa-solid fa-clock-rotate-left"></i> Lịch Sử Khách Đăng Ký ({history.length})
          </button>
        </div>

        {activeSubTab === 'packages' && (
          <button
            type="button"
            className="btn-action-add"
            onClick={handleOpenAdd}
          >
            <i className="fa-solid fa-plus"></i> Thêm Gói Hội Viên Mới
          </button>
        )}
      </div>

      {/* 2. SUB-TAB 1: PACKAGES LIST */}
      {activeSubTab === 'packages' && (
        <div className="admin-content-card">
          <div className="card-header-flex">
            <div>
              <h3 style={{ margin: 0 }}>
                <i className="fa-solid fa-crown"></i> Cấu Hình Gói Hội Viên VIP Hệ Thống
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Quản lý các gói thành viên Gold, Platinum, Diamond, Student với các mức ưu đãi chiết khấu đặt sân
              </p>
            </div>
            <button
              type="button"
              className="btn-tbl btn-tbl-edit"
              onClick={loadData}
            >
              <i className="fa-solid fa-rotate"></i> Làm mới
            </button>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Gói</th>
                  <th>Tên Gói</th>
                  <th>Giá Niêm Yết</th>
                  <th>Thời Hạn</th>
                  <th>Ưu Đãi Chiết Khấu</th>
                  <th>Đối Tượng</th>
                  <th>Trạng Thái</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      <i className="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách gói...
                    </td>
                  </tr>
                ) : packages.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      Chưa có gói hội viên nào.
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '6px',
                            background: pkg.badgeColor || '#0284c7',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}
                        >
                          <i className={pkg.icon || 'fa-solid fa-gem'}></i> {pkg.code}
                        </span>
                      </td>
                      <td>
                        <strong>{pkg.name}</strong>
                        {pkg.description && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {pkg.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: '#0284c7', fontSize: '15px' }}>
                          {Number(pkg.price || 0).toLocaleString('vi-VN')} đ
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{pkg.durationDays} ngày</span>
                      </td>
                      <td>
                        <strong style={{ color: '#10b981' }}>Giảm {pkg.discountPercent}%</strong>
                      </td>
                      <td>
                        {pkg.studentOnly ? (
                          <span style={{ color: '#8b5cf6', fontWeight: 600 }}>
                            <i className="fa-solid fa-graduation-cap"></i> Chỉ Sinh Viên
                          </span>
                        ) : (
                          <span style={{ color: '#64748b' }}>Tất cả hội viên</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill ${pkg.active !== false ? 'status-pill-paid' : 'status-pill-cancelled'}`}>
                          {pkg.active !== false ? 'Kinh Doanh' : 'Tạm Ẩn'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-edit"
                            onClick={() => handleOpenEdit(pkg)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Sửa
                          </button>
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-delete"
                            onClick={() => handleDelete(pkg.id)}
                          >
                            <i className="fa-solid fa-trash"></i> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB 2: MEMBERSHIP HISTORY */}
      {activeSubTab === 'history' && (
        <div className="admin-content-card">
          <div className="card-header-flex">
            <div>
              <h3 style={{ margin: 0 }}>
                <i className="fa-solid fa-clock-rotate-left"></i> Lịch Sử Khách Hàng Đăng Ký Gói VIP
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Theo dõi ngày kích hoạt, thời hạn sử dụng và trạng thái hội viên của từng khách hàng
              </p>
            </div>
            <button
              type="button"
              className="btn-tbl btn-tbl-edit"
              onClick={loadData}
            >
              <i className="fa-solid fa-rotate"></i> Làm mới
            </button>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Khách Hàng</th>
                  <th>Số Điện Thoại</th>
                  <th>Gói Hội Viên</th>
                  <th>Ngày Bắt Đầu</th>
                  <th>Ngày Hết Hạn</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu lịch sử...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      Chưa có hội viên nào đăng ký gói.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id}>
                      <td>#{h.id}</td>
                      <td>
                        <strong>{h.user?.fullName || h.user?.username || 'Hội viên'}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>@{h.user?.username}</div>
                      </td>
                      <td>{h.user?.phone || '---'}</td>
                      <td>
                        <strong style={{ color: '#0284c7' }}>{h.package?.name || h.packageName || 'Gói VIP'}</strong>
                      </td>
                      <td>{h.startDate ? new Date(h.startDate).toLocaleDateString('vi-VN') : '---'}</td>
                      <td>{h.endDate ? new Date(h.endDate).toLocaleDateString('vi-VN') : '---'}</td>
                      <td>
                        <span className={`status-pill ${h.status === 'ACTIVE' ? 'status-pill-paid' : 'status-pill-cancelled'}`}>
                          {h.status === 'ACTIVE' ? 'Đang Hiệu Lực' : h.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA GÓI HỘI VIÊN */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '540px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-crown"></i> {editingPackage ? 'Chỉnh Sửa Gói VIP' : 'Thêm Gói Hội Viên Mới'}
              </h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Mã Gói (Code) *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: GOLD, VIP30..."
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Tên Gói Hiển Thị *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Hội Viên Gold VIP"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Giá Bán (VNĐ) *
                    </label>
                    <input
                      type="number"
                      step="10000"
                      min="0"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Thời Hạn (Ngày) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Chiết Khấu Đặt Sân (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Màu Huy Hiệu (Hex Color)
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={formData.badgeColor}
                        onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                        style={{ width: '40px', height: '38px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={formData.badgeColor}
                        onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Mô Tả Quyền Lợi
                  </label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Mô tả các đặc quyền dành riêng cho khách hàng mua gói này..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={formData.studentOnly}
                      onChange={(e) => setFormData({ ...formData, studentOnly: e.target.checked })}
                    />
                    Chỉ dành riêng cho Sinh Viên
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    Đang mở bán (Active)
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-tbl btn-tbl-edit"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-action-add"
                >
                  {isSubmitting ? 'Đang lưu...' : (editingPackage ? 'Cập Nhật Gói' : 'Thêm Mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

