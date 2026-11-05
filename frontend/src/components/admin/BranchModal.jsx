import React, { useState, useEffect } from 'react';

/**
 * Modal Thêm / Chỉnh Sửa Chi Nhánh Cơ Sở D2 SHOP
 * Code ngắn gọn, trực quan, kết nối SQL Database
 */
export default function BranchModal({ isOpen, onClose, initialData, onSave }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    phone: '0914977030',
    totalCourts: 7
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        code: initialData.code || '',
        name: initialData.name || '',
        address: initialData.address || '',
        phone: initialData.phone || '0914977030',
        totalCourts: initialData.totalCourts || (initialData.courts ? initialData.courts.length : 7)
      });
    } else {
      setFormData({
        code: '',
        name: '',
        address: '',
        phone: '0914977030',
        totalCourts: 7
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Vui lòng nhập đầy đủ Mã chi nhánh và Tên chi nhánh!');
      return;
    }
    onSave({
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      totalCourts: Number(formData.totalCourts) || 1
    });
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
            <i className={initialData ? "fa-solid fa-pen-to-square" : "fa-solid fa-building-circle-check"}></i>
            {initialData ? 'Chỉnh Sửa Chi Nhánh Cơ Sở' : 'Thêm Chi Nhánh Cơ Sở Mới'}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Mã Chi Nhánh <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                maxLength={20}
                pattern="[A-Za-z0-9_]{2,20}"
                title="Chỉ gồm chữ, số, gạch dưới (2-20 ký tự)"
                type="text"
                required
                placeholder="VD: NVL, Q1..."
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', textTransform: 'uppercase' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Tên Chi Nhánh <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                maxLength={100}
                type="text"
                required
                placeholder="VD: D2 Shop NVL - Gò Vấp..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Địa Chỉ Cơ Sở <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              maxLength={255}
              type="text"
              required
              placeholder="VD: 70 Nguyễn Văn Lượng, P. 10, Q. Gò Vấp, TP.HCM"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Hotline Chi Nhánh
              </label>
              <input
                maxLength={12}
                pattern="(0|\+84)[0-9]{9,10}"
                title="Số điện thoại Việt Nam, VD: 0914977030"
                type="tel"
                placeholder="VD: 0914977030"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Quy Mô (Số Lượng Sân)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.totalCourts}
                onChange={(e) => setFormData({ ...formData, totalCourts: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
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
              {initialData ? 'Lưu Thay Đổi' : 'Tạo Chi Nhánh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

