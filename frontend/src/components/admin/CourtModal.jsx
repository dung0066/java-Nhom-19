import React, { useState, useEffect } from 'react';

/**
 * Modal Thêm / Sửa Sân Đấu Cầu Lông
 * Code ngắn gọn, dễ hiểu, trực quan để báo cáo đồ án
 */
export default function CourtModal({ isOpen, onClose, initialData, branches = [], onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    courtNumber: 1,
    branchCode: 'NVL',
    courtGroup: 'Thảm Taraflex BWF 7.5mm',
    active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || `Sân ${initialData.courtNumber || 1}`,
        courtNumber: initialData.courtNumber || initialData.courtOrder || 1,
        branchCode: initialData.branch?.code || initialData.branchCode || 'NVL',
        courtGroup: initialData.courtGroup || 'Thảm Taraflex BWF 7.5mm',
        active: initialData.active !== undefined ? initialData.active : true
      });
    } else {
      setFormData({
        name: '',
        courtNumber: 1,
        branchCode: branches[0]?.code || 'NVL',
        courtGroup: 'Thảm Taraflex BWF 7.5mm',
        active: true
      });
    }
  }, [initialData, isOpen, branches]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên sân đấu!');
      return;
    }
    // Tìm branchId tương ứng
    const branchObj = branches.find(b => b.code === formData.branchCode);
    const payload = {
      ...formData,
      branchId: branchObj?.id || 1,
      courtNumber: Number(formData.courtNumber) || 1
    };
    onSave(payload);
  };

  return (
    <div className="modal-backdrop-custom" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', maxWidth: '520px', width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
        border: '1px solid #e2e8f0', animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header Modal */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className={initialData ? "fa-solid fa-pen-to-square" : "fa-solid fa-square-plus"}></i>
            {initialData ? 'Chỉnh Sửa Thông Tin Sân Đấu' : 'Thêm Sân Cầu Lông Mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', opacity: 0.8 }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Tên Sân Đấu <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Sân 1, Sân 8 (VIP), Sân Thi Đấu..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Số Thứ Tự Sân
              </label>
              <input
                type="number"
                min="1"
                value={formData.courtNumber}
                onChange={(e) => setFormData({ ...formData, courtNumber: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Chi Nhánh Cơ Sở
              </label>
              <select
                value={formData.branchCode}
                onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
              >
                {branches.length > 0 ? (
                  branches.map(b => (
                    <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                  ))
                ) : (
                  <>
                    <option value="NVL">D2 Shop NVL - Gò Vấp</option>
                    <option value="DQII">D2 Shop DQII - Gò Vấp</option>
                    <option value="NQA">D2 Shop NQA - Tân Phú</option>
                    <option value="HB">D2 Shop HB - TP. Thủ Đức</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Loại Thảm & Quy Cách
            </label>
            <select
              value={formData.courtGroup}
              onChange={(e) => setFormData({ ...formData, courtGroup: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
            >
              <option value="Thảm Taraflex BWF 7.5mm">Thảm Taraflex BWF 7.5mm (Chuẩn Thi Đấu Quốc Tế)</option>
              <option value="Thảm PVC Tiêu Chuẩn 5 Lớp">Thảm PVC Tiêu Chuẩn 5 Lớp Chống Trơn Trượt</option>
              <option value="Sân Phòng Lạnh VIP Khép Kín">Sân Phòng Lạnh VIP Khép Kín Độc Lập</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Trạng Thái Hoạt Động
            </label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>
                <input
                  type="radio"
                  name="activeStatus"
                  checked={formData.active === true}
                  onChange={() => setFormData({ ...formData, active: true })}
                />
                <i className="fa-solid fa-circle-check"></i> Đang hoạt động tốt
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#ea580c' }}>
                <input
                  type="radio"
                  name="activeStatus"
                  checked={formData.active === false}
                  onChange={() => setFormData({ ...formData, active: false })}
                />
                <i className="fa-solid fa-wrench"></i> Tạm ngưng (Bảo trì / Sửa chữa)
              </label>
            </div>
          </div>

          {/* Buttons Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-check"></i>
              {initialData ? 'Lưu Thay Đổi' : 'Tạo Sân Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

