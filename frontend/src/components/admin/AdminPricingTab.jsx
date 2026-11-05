import React, { useState, useEffect } from 'react';
import ModalPortal from './ModalPortal';
import { PaginationBar } from './Pagination';
import { usePagination } from './usePagination';
import AdminTrashModal from './AdminTrashModal';
import { TIME_SLOTS as DEFAULT_TIME_SLOTS } from '../../data/courtData';
import {
  fetchAdminPriceRules,
  createAdminPriceRule,
  deleteAdminPriceRule,
  fetchAdminTimeSlots,
  fetchBranches
} from '../../services/api';

/**
 * 38 Khung giờ chuẩn 30 phút từ 05:00 sáng đến 24:00 đêm
 */
export const STANDARD_30MIN_SLOTS = DEFAULT_TIME_SLOTS.map((s) => {
  const sTime = s.startTime.includes(':') && s.startTime.split(':').length === 2 ? s.startTime + ':00' : s.startTime;
  const eTime = s.endTime.includes(':') && s.endTime.split(':').length === 2 ? s.endTime + ':00' : s.endTime;
  return {
    id: s.id,
    startTime: sTime,
    endTime: eTime,
    durationMinutes: 30,
    isPeak: Boolean(s.isPeakHour),
    price: s.isPeakHour ? 60000 : 35000,
    sortOrder: s.sortOrder
  };
});

export default function AdminPricingTab() {
  const [priceRules, setPriceRules] = useState([]);
  const [timeSlots, setTimeSlots] = useState(() => {
    try {
      const saved = localStorage.getItem('d2_admin_timeslots');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Nếu dữ liệu cũ là 60 phút hoặc bắt đầu từ 00:15 thì bỏ qua, dùng chuẩn 38 ca 30 phút
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed[0]?.startTime !== '00:15:00' &&
          parsed[0]?.startTime !== '00:15' &&
          parsed[0]?.durationMinutes !== 60
        ) {
          return parsed;
        }
      }
    } catch (_) {}
    return STANDARD_30MIN_SLOTS;
  });

  const [trashedSlots, setTrashedSlots] = useState(() => {
    try {
      const saved = localStorage.getItem('d2_admin_timeslots_trash');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });

  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Form States for Price Rules
  const [branchFilter, setBranchFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    branchId: '',
    timeSlotId: '',
    dayType: 'ALL',
    price: 35000,
    priority: 10,
    active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time Slot Modal & Trash States
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotFormData, setSlotFormData] = useState({
    startTime: '05:00:00',
    endTime: '05:30:00',
    durationMinutes: 30,
    isPeak: false,
    price: 35000,
    sortOrder: 1
  });
  const [isSlotTrashOpen, setIsSlotTrashOpen] = useState(false);

  const loadPricingData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, slotsRes, branchRes] = await Promise.all([
        fetchAdminPriceRules().catch(() => []),
        fetchAdminTimeSlots().catch(() => []),
        fetchBranches().catch(() => [])
      ]);

      setPriceRules(Array.isArray(rulesRes) ? rulesRes : []);
      setBranches(Array.isArray(branchRes) ? branchRes : []);

      const trashedIds = new Set(
        (() => {
          try {
            const saved = localStorage.getItem('d2_admin_timeslots_trash');
            return saved ? JSON.parse(saved).map((s) => s.id) : [];
          } catch (_) {
            return [];
          }
        })()
      );

      const localSaved = (() => {
        try {
          const s = localStorage.getItem('d2_admin_timeslots');
          return s ? JSON.parse(s) : null;
        } catch (_) {
          return null;
        }
      })();

      // Nếu dữ liệu local đã là chuẩn 30 phút
      if (
        localSaved &&
        Array.isArray(localSaved) &&
        localSaved.length > 0 &&
        localSaved[0]?.startTime !== '00:15:00' &&
        localSaved[0]?.startTime !== '00:15' &&
        localSaved[0]?.durationMinutes !== 60
      ) {
        setTimeSlots(localSaved.filter((s) => !trashedIds.has(s.id)));
      } else {
        // Tự động khởi tạo 38 ca chuẩn 30 phút từ 05:00 đến 24:00
        const active = STANDARD_30MIN_SLOTS.filter((s) => !trashedIds.has(s.id));
        setTimeSlots(active);
        localStorage.setItem('d2_admin_timeslots', JSON.stringify(active));
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu bảng giá:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPricingData();
  }, []);

  // ==========================================
  // PRICE RULE HANDLERS
  // ==========================================
  const handleOpenAddModal = () => {
    setFormData({
      branchId: branches[0]?.id || '',
      timeSlotId: timeSlots[0]?.id || '',
      dayType: 'ALL',
      price: 50000,
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

  // ==========================================
  // TIME SLOT (KHUNG GIỜ) HANDLERS
  // ==========================================
  const handleOpenAddSlot = () => {
    setEditingSlot(null);
    const nextOrder =
      timeSlots.length > 0
        ? Math.max(...timeSlots.map((s) => s.sortOrder || s.id || 0)) + 1
        : 1;
    setSlotFormData({
      startTime: '05:00:00',
      endTime: '05:30:00',
      durationMinutes: 30,
      isPeak: false,
      price: 35000,
      sortOrder: nextOrder
    });
    setIsSlotModalOpen(true);
  };

  const handleOpenEditSlot = (slot) => {
    setEditingSlot(slot);
    const isPeakHour =
      slot.isPeak ?? (slot.startTime >= '17:00' && slot.startTime < '22:00');
    setSlotFormData({
      startTime: slot.startTime || '05:00:00',
      endTime: slot.endTime || '05:30:00',
      durationMinutes: slot.durationMinutes || 30,
      isPeak: isPeakHour,
      price: slot.price || (isPeakHour ? 60000 : 35000),
      sortOrder: slot.sortOrder || slot.id || 1
    });
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = (e) => {
    e.preventDefault();
    if (!slotFormData.startTime || !slotFormData.endTime) {
      alert('Vui lòng nhập giờ bắt đầu và kết thúc!');
      return;
    }
    if (editingSlot) {
      const updated = {
        ...editingSlot,
        startTime: slotFormData.startTime,
        endTime: slotFormData.endTime,
        durationMinutes: Number(slotFormData.durationMinutes || 30),
        isPeak: Boolean(slotFormData.isPeak),
        price: Number(slotFormData.price || 35000),
        sortOrder: Number(slotFormData.sortOrder || editingSlot.id)
      };
      setTimeSlots((prev) => {
        const next = prev.map((s) => (s.id === editingSlot.id ? updated : s));
        localStorage.setItem('d2_admin_timeslots', JSON.stringify(next));
        return next;
      });
      alert('Cập nhật khung giờ thành công!');
    } else {
      const newId = Date.now();
      const newSlot = {
        id: newId,
        startTime: slotFormData.startTime,
        endTime: slotFormData.endTime,
        durationMinutes: Number(slotFormData.durationMinutes || 30),
        isPeak: Boolean(slotFormData.isPeak),
        price: Number(slotFormData.price || 35000),
        sortOrder: Number(slotFormData.sortOrder || timeSlots.length + 1)
      };
      setTimeSlots((prev) => {
        const next = [...prev, newSlot].sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );
        localStorage.setItem('d2_admin_timeslots', JSON.stringify(next));
        return next;
      });
      alert('Thêm khung giờ mới thành công!');
    }
    setIsSlotModalOpen(false);
  };

  const handleDeleteSlot = (id) => {
    const slot = timeSlots.find((s) => s.id === id);
    if (!slot) return;
    if (
      !window.confirm(
        `Bạn có chắc muốn chuyển khung giờ Slot #${slot.id} (${slot.startTime} - ${slot.endTime}) vào thùng rác?`
      )
    )
      return;

    const isPeakHour =
      slot.isPeak ?? (slot.startTime >= '17:00' && slot.startTime < '22:00');
    const trashedItem = {
      ...slot,
      name: `Slot #${slot.id} (${slot.startTime} - ${slot.endTime})`,
      categoryLabel: isPeakHour ? 'Giờ Vàng (Peak)' : 'Giờ Thường',
      price: slot.price || (isPeakHour ? 60000 : 35000),
      deletedAt: new Date().toISOString()
    };

    setTrashedSlots((prev) => {
      const next = [trashedItem, ...prev.filter((t) => t.id !== id)];
      localStorage.setItem('d2_admin_timeslots_trash', JSON.stringify(next));
      return next;
    });

    setTimeSlots((prev) => {
      const next = prev.filter((s) => s.id !== id);
      localStorage.setItem('d2_admin_timeslots', JSON.stringify(next));
      return next;
    });
  };

  const handleRestoreSlot = (id) => {
    const item = trashedSlots.find((s) => s.id === id);
    if (!item) return;

    setTrashedSlots((prev) => {
      const next = prev.filter((s) => s.id !== id);
      localStorage.setItem('d2_admin_timeslots_trash', JSON.stringify(next));
      return next;
    });

    setTimeSlots((prev) => {
      const { deletedAt, name, categoryLabel, ...rest } = item;
      const next = [...prev, rest].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );
      localStorage.setItem('d2_admin_timeslots', JSON.stringify(next));
      return next;
    });
  };

  const handlePermanentDeleteSlot = (id) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa vĩnh viễn Slot #${id}? Thao tác này không thể hoàn tác.`
      )
    )
      return;
    setTrashedSlots((prev) => {
      const next = prev.filter((s) => s.id !== id);
      localStorage.setItem('d2_admin_timeslots_trash', JSON.stringify(next));
      return next;
    });
  };

  const handleClearSlotTrash = () => {
    if (!window.confirm('Bạn có chắc muốn làm trống toàn bộ thùng rác khung giờ?'))
      return;
    setTrashedSlots([]);
    localStorage.removeItem('d2_admin_timeslots_trash');
  };

  const handleResetStandardSlots = () => {
    if (
      !window.confirm(
        'Đặt lại toàn bộ danh sách 38 khung giờ chuẩn từ 05:00 sáng đến 24:00 đêm (mỗi ca cách nhau 30 phút)?'
      )
    )
      return;
    setTimeSlots(STANDARD_30MIN_SLOTS);
    localStorage.setItem('d2_admin_timeslots', JSON.stringify(STANDARD_30MIN_SLOTS));
    setTrashedSlots([]);
    localStorage.removeItem('d2_admin_timeslots_trash');
    alert('Đã đồng bộ lại 38 khung giờ 30 phút (05:00 - 24:00) thành công!');
  };

  const filteredRules = priceRules.filter((r) => {
    if (!branchFilter) return true;
    return (
      r.branch?.id === Number(branchFilter) ||
      r.branchId === Number(branchFilter)
    );
  });

  const pg = usePagination(filteredRules, 10, filteredRules.length);

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
              35.000 đ / ca
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              05:00 - 17:00 & 22:00 - 24:00 (30 phút/ca)
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
              60.000 đ / ca
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              17:00 - 22:00 (Nhu cầu cao nhất • 30 phút/ca)
            </p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <i className="fa-solid fa-calendar-day" style={{ color: '#16a34a' }}></i>
          </div>
          <div className="stat-meta">
            <h4>Cuối Tuần (T7 - CN)</h4>
            <div className="stat-val" style={{ color: '#16a34a' }}>
              +10.000 đ
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Phụ thu cố định tất cả các khung giờ
            </p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <i className="fa-solid fa-sliders" style={{ color: '#9333ea' }}></i>
          </div>
          <div className="stat-meta">
            <h4>Tổng Số Khung Giờ</h4>
            <div className="stat-val" style={{ color: '#9333ea' }}>
              {timeSlots.length} Ca / Ngày
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Chuẩn 30 phút từ 05:00 sáng đến 24:00 đêm
            </p>
          </div>
        </div>
      </div>

      {/* 2. BẢNG QUẢN LÝ QUY TẮC GIÁ RIÊNG */}
      <div className="admin-content-card" style={{ marginBottom: '24px' }}>
        <div className="card-header-flex">
          <div>
            <h3 style={{ margin: 0 }}>
              <i className="fa-solid fa-tags"></i> Quy Tắc Giá Theo Khung Giờ & Chi Nhánh
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Cấu hình giá đặc biệt ghi đè giá mặc định (ví dụ: giờ vàng sân Gò Vấp, ưu đãi sân VIP)
            </p>
          </div>
          <div className="filter-tools-row">
            <select
              className="select-filter"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">Tất cả cơ sở ({branches.length})</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-action-add btn-action-orange"
              onClick={handleOpenAddModal}
            >
              <i className="fa-solid fa-plus"></i> Thêm Quy Tắc Mới
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã ID</th>
                <th>Áp Dụng Cơ Sở</th>
                <th>Khung Giờ</th>
                <th>Loại Ngày</th>
                <th>Mức Giá Áp Dụng</th>
                <th>Độ Ưu Tiên</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách bảng giá...
                  </td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Chưa có quy tắc giá riêng nào. Hệ thống đang áp dụng <strong>Giá Mặc Định 30 Phút</strong> phía dưới.
                  </td>
                </tr>
              ) : (
                pg.pageItems.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>#{r.id}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0369a1' }}>
                        {r.branch?.name || r.branchName || 'Tất cả cơ sở'}
                      </span>
                    </td>
                    <td>
                      {r.timeSlot ? (
                        <span className="badge-status badge-active">
                          {r.timeSlot.startTime} - {r.timeSlot.endTime}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>Toàn bộ 05:00 - 24:00</span>
                      )}
                    </td>
                    <td>
                      {r.dayType === 'WEEKEND' ? (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>Thứ 7 & Chủ Nhật</span>
                      ) : r.dayType === 'WEEKDAY' ? (
                        <span>Thứ 2 - Thứ 6</span>
                      ) : (
                        <span style={{ color: '#64748b' }}>Tất cả các ngày</span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#ea580c', fontSize: '14px' }}>
                        {Number(r.price).toLocaleString('vi-VN')} đ
                      </strong>
                    </td>
                    <td>
                      <span className="badge-status" style={{ background: '#f1f5f9', color: '#334155' }}>
                        Ưu tiên {r.priority || 0}
                      </span>
                    </td>
                    <td>
                      {r.active !== false ? (
                        <span className="badge-status badge-paid">
                          <i className="fa-solid fa-check"></i> Đang Bật
                        </span>
                      ) : (
                        <span className="badge-status badge-cancelled">Tắt</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-tbl btn-tbl-delete"
                        title="Xóa quy tắc giá"
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
          <PaginationBar pagination={pg} unit="quy tắc giá" />
        </div>
      </div>

      {/* 3. DANH SÁCH KHUNG GIỜ HỆ THỐNG */}
      <div className="admin-content-card">
        <div className="card-header-flex">
          <div>
            <h3 style={{ margin: 0 }}>
              <i className="fa-solid fa-clock"></i> Danh Sách Khung Giờ Thi Đấu Hệ Thống (05:00 - 24:00 • 30 phút/ca)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: '4px 0 0 0' }}>
              Danh sách {timeSlots.length} ca thi đấu từ 05:00 sáng đến 24:00 đêm, mỗi ca cách nhau 30 phút
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-action-add btn-action-orange"
              onClick={handleOpenAddSlot}
            >
              <i className="fa-solid fa-plus"></i> Thêm Khung Giờ Mới
            </button>
            <button
              type="button"
              className="btn-action-add"
              onClick={handleResetStandardSlots}
              title="Khôi phục lại 38 ca chuẩn từ 05:00 đến 24:00 (mỗi ca 30 phút)"
            >
              <i className="fa-solid fa-rotate"></i> Đặt lại 38 ca chuẩn
            </button>
            <button
              type="button"
              className="btn-tbl btn-tbl-delete"
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Thùng rác: Xem, khôi phục hoặc xóa vĩnh viễn khung giờ đã xóa tạm"
              onClick={() => setIsSlotTrashOpen(true)}
            >
              <i className="fa-solid fa-trash-can"></i> Thùng rác ({trashedSlots.length})
            </button>
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
                <th>Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Chưa có khung giờ nào trong danh sách. Bấm <strong>"Đặt lại 38 ca chuẩn"</strong> hoặc <strong>"+ Thêm Khung Giờ Mới"</strong>!
                  </td>
                </tr>
              ) : (
                timeSlots.map((slot, idx) => {
                  const sTime = slot.startTime.length > 5 ? slot.startTime.substring(0, 5) : slot.startTime;
                  const eTime = slot.endTime.length > 5 ? slot.endTime.substring(0, 5) : slot.endTime;
                  const isPeak =
                    slot.isPeak ?? (sTime >= '17:00' && sTime < '22:00');
                  const slotPrice = slot.price || (isPeak ? 60000 : 35000);
                  const duration = slot.durationMinutes || 30;

                  return (
                    <tr key={slot.id || idx} style={isPeak ? { background: '#fff7ed' } : {}}>
                      <td>{slot.sortOrder || idx + 1}</td>
                      <td>
                        <strong>Slot #{slot.id}</strong>
                      </td>
                      <td>
                        <strong style={{ color: isPeak ? '#ea580c' : '#0369a1', fontSize: '14px' }}>
                          {sTime} - {eTime}
                        </strong>
                      </td>
                      <td>{duration} phút</td>
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
                          {Number(slotPrice).toLocaleString('vi-VN')} đ
                        </strong>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-edit"
                            title="Chỉnh sửa khung giờ"
                            onClick={() => handleOpenEditSlot(slot)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Sửa
                          </button>
                          <button
                            type="button"
                            className="btn-tbl btn-tbl-delete"
                            title="Chuyển vào thùng rác"
                            onClick={() => handleDeleteSlot(slot.id)}
                          >
                            <i className="fa-solid fa-trash"></i> Xóa tạm
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM QUY TẮC GIÁ MỚI */}
      {isModalOpen && (
        <ModalPortal>
          <div className="admin-modal-backdrop show" onClick={() => setIsModalOpen(false)}>
            <div
              className="admin-modal-box"
              style={{ maxWidth: '520px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
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
                <div className="admin-modal-body" style={{ padding: '20px' }}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Áp Dụng Cơ Sở
                    </label>
                    <select
                      className="form-control"
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    >
                      <option value="">Tất cả cơ sở (Global)</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
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
                      <option value="">Cả ngày (05:00 - 24:00)</option>
                      {timeSlots.map((s) => {
                        const sTime = s.startTime.length > 5 ? s.startTime.substring(0, 5) : s.startTime;
                        const eTime = s.endTime.length > 5 ? s.endTime.substring(0, 5) : s.endTime;
                        return (
                          <option key={s.id} value={s.id}>
                            Slot #{s.id} ({sTime} - {eTime})
                          </option>
                        );
                      })}
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
                      <option value="ALL">Tất cả các ngày trong tuần</option>
                      <option value="WEEKDAY">Ngày thường (Thứ 2 - Thứ 6)</option>
                      <option value="WEEKEND">Cuối tuần (Thứ 7 & Chủ Nhật)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Mức Giá Tùy Chỉnh (VNĐ / Ca 30 Phút)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      className="form-control"
                      placeholder="Ví dụ: 45000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Độ Ưu Tiên Áp Dụng (Priority)
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

                <div className="admin-modal-footer" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
        </ModalPortal>
      )}

      {/* MODAL THÊM / SỬA KHUNG GIỜ THI ĐẤU */}
      {isSlotModalOpen && (
        <ModalPortal>
          <div className="admin-modal-backdrop show" onClick={() => setIsSlotModalOpen(false)}>
            <div
              className="admin-modal-box"
              style={{ maxWidth: '480px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>
                  <i className={editingSlot ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus-circle'}></i>{' '}
                  {editingSlot ? `Sửa Khung Giờ Slot #${editingSlot.id}` : 'Thêm Khung Giờ Mới'}
                </h3>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setIsSlotModalOpen(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveSlot}>
                <div className="admin-modal-body" style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Giờ Bắt Đầu
                      </label>
                      <input
                        type="time"
                        step="1"
                        className="form-control"
                        required
                        value={slotFormData.startTime}
                        onChange={(e) =>
                          setSlotFormData((prev) => ({ ...prev, startTime: e.target.value }))
                        }
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Giờ Kết Thúc
                      </label>
                      <input
                        type="time"
                        step="1"
                        className="form-control"
                        required
                        value={slotFormData.endTime}
                        onChange={(e) =>
                          setSlotFormData((prev) => ({ ...prev, endTime: e.target.value }))
                        }
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Thời Lượng (Phút)
                      </label>
                      <input
                        type="number"
                        min="15"
                        step="5"
                        className="form-control"
                        required
                        value={slotFormData.durationMinutes}
                        onChange={(e) =>
                          setSlotFormData((prev) => ({ ...prev, durationMinutes: e.target.value }))
                        }
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Thứ Tự Sắp Xếp
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={slotFormData.sortOrder}
                        onChange={(e) =>
                          setSlotFormData((prev) => ({ ...prev, sortOrder: e.target.value }))
                        }
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Phân Loại Khung Giờ
                    </label>
                    <select
                      className="form-control"
                      value={slotFormData.isPeak ? 'PEAK' : 'NORMAL'}
                      onChange={(e) => {
                        const isP = e.target.value === 'PEAK';
                        setSlotFormData((prev) => ({
                          ...prev,
                          isPeak: isP,
                          price: isP ? 60000 : 35000
                        }));
                      }}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      <option value="NORMAL">Giờ Thường (Off-Peak)</option>
                      <option value="PEAK">Giờ Vàng (Peak Hour)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Giá Mặc Định (VNĐ)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      className="form-control"
                      required
                      value={slotFormData.price}
                      onChange={(e) =>
                        setSlotFormData((prev) => ({ ...prev, price: e.target.value }))
                      }
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
                    className="mem-btn secondary"
                    onClick={() => setIsSlotModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-action-add">
                    <i className="fa-solid fa-save"></i>{' '}
                    {editingSlot ? 'Lưu Thay Đổi' : 'Thêm Khung Giờ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* MODAL THÙNG RÁC KHUNG GIỜ THI ĐẤU */}
      {isSlotTrashOpen && (
        <AdminTrashModal
          title="Thùng rác Khung Giờ Thi Đấu"
          hint="Các ca thi đấu đã xóa tạm được lưu trữ tại đây. Bạn có thể khôi phục lại bảng giờ hoặc xóa vĩnh viễn."
          items={trashedSlots}
          onRestore={(slot) => handleRestoreSlot(slot.id)}
          onDestroy={(slot) => handlePermanentDeleteSlot(slot.id)}
          onClearAll={trashedSlots.length > 0 ? handleClearSlotTrash : null}
          onClose={() => setIsSlotTrashOpen(false)}
        />
      )}
    </section>
  );
}
