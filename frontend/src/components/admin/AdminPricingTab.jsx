import React, { useState, useEffect } from 'react';
import {
  fetchAdminPriceRules,
  createAdminPriceRule,
  deleteAdminPriceRule,
  fetchAdminTimeSlots,
  fetchBranches
} from '../../services/api';

export default function AdminPricingTab() {
  const [priceRules, setPriceRules] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Form States
  const [branchFilter, setBranchFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    branchId: '',
    timeSlotId: '',
    dayType: 'ALL',
    price: 70000,
    priority: 10,
    active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPricingData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, slotsRes, branchRes] = await Promise.all([
        fetchAdminPriceRules().catch(() => []),
        fetchAdminTimeSlots().catch(() => []),
        fetchBranches().catch(() => [])
      ]);

      setPriceRules(Array.isArray(rulesRes) ? rulesRes : []);
      setTimeSlots(Array.isArray(slotsRes) ? slotsRes : []);
      setBranches(Array.isArray(branchRes) ? branchRes : []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu bảng giá:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPricingData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      branchId: branches[0]?.id || '',
      timeSlotId: timeSlots[0]?.id || '',
      dayType: 'ALL',
      price: 90000,
      priority: 10,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleSubmitRule = async (e) => {
    e.preventDefault();
    if (!formData.price || formData.price <= 0) {
      alert('Vui lòng nhập giá hợp lệ lớn hơn 0!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        branchId: formData.branchId ? Number(formData.branchId) : null,
        timeSlotId: formData.timeSlotId ? Number(formData.timeSlotId) : null,
        dayType: formData.dayType || 'ALL',
        price: Number(formData.price),
        priority: Number(formData.priority || 0),
        active: formData.active !== false
      };

      await createAdminPriceRule(payload);
      alert('Đã thêm quy tắc giá mới thành công vào SQL Database!');
      setIsModalOpen(false);
      loadPricingData();
    } catch (err) {
      alert('Lỗi khi lưu quy tắc giá: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa quy tắc giá #' + ruleId + ' không?')) return;
    try {
      await deleteAdminPriceRule(ruleId);
      alert('Đã xóa quy tắc giá thành công!');
      setPriceRules((prev) => prev.filter((r) => r.id !== ruleId));
    } catch (err) {
      alert('Lỗi xóa quy tắc giá: ' + (err.message || err));
    }
  };

  const filteredRules = priceRules.filter((r) => {
    if (!branchFilter) return true;
    return r.branch?.id === Number(branchFilter) || r.branchId === Number(branchFilter);
  });

  return (
    <section id="pricingTab" className="tab-pane">
      {/* 1. HEADER STATS */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fa-solid fa-sun" style={{ color: '#0284c7' }}></i>
          </div>
          <div className="stat-meta">
            <h4>Khung Giờ Thường (Off-Peak)</h4>
            <div className="stat-val" style={{ color: '#0284c7' }}>
              70.000 đ / ca
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              00:00 - 17:45 các ngày trong tuần
            </p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <i className="fa-solid fa-fire" style={{ color: '#ea580c' }}></i>
          </div>
          <div className="stat-meta">
            <h4>Khung Giờ Vàng (Peak Hours)</h4>
            <div className="stat-val" style={{ color: '#ea580c' }}>
              120.000 đ / ca
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              17:45 - 22:00 (giờ cao điểm sôi động)
            </p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <i className="fa-solid fa-sliders" style={{ color: '#10b981' }}></i>
          </div>
          <div className="stat-meta">
            <h4>Quy Tắc Giá Tùy Biến</h4>
            <div className="stat-val" style={{ color: '#10b981' }}>
              {priceRules.length} Quy Tắc
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Ưu tiên theo chi nhánh & ngày đặc biệt
            </p>
          </div>
        </div>
      </div>

      {/* 2. QUẢN LÝ QUY TẮC GIÁ TÙY BIẾN (SQL Price Rules) */}
      <div className="admin-content-card" style={{ marginBottom: '24px' }}>
        <div className="card-header-flex">
          <div>
            <h3 style={{ margin: 0 }}>
              <i className="fa-solid fa-coins"></i> Quy Tắc Giá Động Theo Chi Nhánh & Ngày (SQL Rules)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Thiết lập giá đặc biệt cho từng cơ sở, cuối tuần, ngày lễ hoặc khung giờ cao điểm
            </p>
          </div>

          <div className="filter-tools-row">
            <select
              className="select-filter"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">Tất cả cơ sở</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn-action-add"
              onClick={handleOpenAddModal}
            >
              <i className="fa-solid fa-plus"></i> Thêm Quy Tắc Giá Mới
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cơ Sở Áp Dụng</th>
                <th>Khung Giờ</th>
                <th>Áp Dụng Cho</th>
                <th>Mức Giá Áp Dụng</th>
                <th>Ưu Tiên</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu quy tắc giá...
                  </td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Chưa có quy tắc giá tùy biến nào. Hệ thống đang áp dụng Bảng giá tiêu chuẩn 24/7.
                  </td>
                </tr>
              ) : (
                filteredRules.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>
                      <strong>{r.branch?.name || (r.branchId ? `Chi nhánh #${r.branchId}` : '★ Tất Cả Cơ Sở')}</strong>
                    </td>
                    <td>
                      <span className="badge-cat" style={{ background: '#f1f5f9', color: '#0369a1' }}>
                        {r.timeSlot ? `${r.timeSlot.startTime} - ${r.timeSlot.endTime}` : 'Tất cả ca giờ'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {r.dayType === 'WEEKEND' ? 'Cuối tuần (T7, CN)' : r.dayType === 'WEEKDAY' ? 'Ngày thường (T2-T6)' : 'Tất cả các ngày'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#0284c7', fontSize: '15px' }}>
                        {(r.price || 0).toLocaleString('vi-VN')} đ
                      </strong>
                    </td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                        {r.priority ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${r.active !== false ? 'status-pill-paid' : 'status-pill-cancelled'}`}>
                        {r.active !== false ? 'Đang Áp Dụng' : 'Tạm Khóa'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-tbl btn-tbl-delete"
                        title="Xóa quy tắc này"
                        onClick={() => handleDeleteRule(r.id)}
                      >
                        <i className="fa-solid fa-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. DANH SÁCH KHUNG GIỜ HỆ THỐNG */}
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3 style={{ margin: 0 }}>
              <i className="fa-solid fa-clock"></i> Danh Sách Khung Giờ Thi Đấu Hệ Thống (Chuẩn 24/7)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Danh sách các ca thi đấu đã đồng bộ từ cơ sở dữ liệu MySQL
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã Slot</th>
                <th>Thời Gian</th>
                <th>Thời Lượng</th>
                <th>Phân Loại</th>
                <th>Giá Mặc Định</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, idx) => {
                const isPeak = slot.startTime >= '17:45' && slot.startTime <= '22:00';
                return (
                  <tr key={slot.id || idx} style={isPeak ? { background: '#fff7ed' } : {}}>
                    <td>{slot.sortOrder || idx + 1}</td>
                    <td>
                      <strong>Slot #{slot.id}</strong>
                    </td>
                    <td>
                      <strong style={{ color: isPeak ? '#ea580c' : '#0369a1' }}>
                        {slot.startTime} - {slot.endTime}
                      </strong>
                    </td>
                    <td>60 phút</td>
                    <td>
                      {isPeak ? (
                        <span style={{ color: '#ea580c', fontWeight: 700 }}>
                          <i className="fa-solid fa-fire"></i> Giờ Vàng (Peak)
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>
                          <i className="fa-solid fa-sun"></i> Giờ Thường
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: isPeak ? '#ea580c' : '#0284c7' }}>
                        {isPeak ? '120.000 đ' : '70.000 đ'}
                      </strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM QUY TẮC GIÁ MỚI */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-plus-circle"></i> Thêm Quy Tắc Giá Mới
              </h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitRule}>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Áp Dụng Cơ Sở
                  </label>
                  <select
                    className="form-control"
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  >
                    <option value="">★ Tất cả chi nhánh</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Khung Giờ Thi Đấu
                  </label>
                  <select
                    className="form-control"
                    value={formData.timeSlotId}
                    onChange={(e) => setFormData({ ...formData, timeSlotId: e.target.value })}
                  >
                    <option value="">★ Tất cả khung giờ</option>
                    {timeSlots.map((ts) => (
                      <option key={ts.id} value={ts.id}>
                        Slot #{ts.id}: {ts.startTime} - {ts.endTime}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Loại Ngày Áp Dụng
                  </label>
                  <select
                    className="form-control"
                    value={formData.dayType}
                    onChange={(e) => setFormData({ ...formData, dayType: e.target.value })}
                  >
                    <option value="ALL">Tất cả các ngày (Toàn tuần)</option>
                    <option value="WEEKDAY">Ngày thường (Thứ 2 đến Thứ 6)</option>
                    <option value="WEEKEND">Cuối tuần (Thứ 7 & Chủ Nhật)</option>
                    <option value="HOLIDAY">Ngày Lễ / Tết</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Mức Giá Mới (VNĐ / Ca) *
                  </label>
                  <input
                    type="number"
                    step="5000"
                    min="10000"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Độ Ưu Tiên Quy Tắc (Priority)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  />
                  <small style={{ color: '#64748b', fontSize: '12px' }}>
                    Quy tắc có điểm ưu tiên cao hơn sẽ ghi đè giá mặc định.
                  </small>
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
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Quy Tắc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
