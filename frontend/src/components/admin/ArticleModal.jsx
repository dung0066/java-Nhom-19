import React, { useState, useEffect, useRef } from 'react';

/**
 * Modal Thêm / Chỉnh Sửa Bài Viết & Tin Tức (Admin)
 * Hỗ trợ Upload ảnh trực tiếp từ máy tính (JPG, PNG, WEBP) hoặc dán link online
 */
export default function ArticleModal({ isOpen, onClose, initialData, onSave }) {
  const fileInputRef = useRef(null);
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    image: '/news/news1.png',
    category: 'KY_THUAT',
    categoryLabel: 'Kỹ Thuật & Sức Khỏe',
    author: 'D2 Media',
    readTime: '4 phút đọc',
    published: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || '',
        summary: initialData.summary || '',
        content: initialData.content || '',
        image: initialData.image || '/news/news1.png',
        category: initialData.category || 'KY_THUAT',
        categoryLabel: initialData.categoryLabel || 'Tin Tức',
        author: initialData.author || 'D2 Media',
        readTime: initialData.readTime || '4 phút đọc',
        published: initialData.published !== undefined ? initialData.published : true
      });
    } else {
      setFormData({
        title: '',
        summary: '',
        content: '',
        image: '/news/news1.png',
        category: 'KY_THUAT',
        categoryLabel: 'Kỹ Thuật & Sức Khỏe',
        author: 'D2 Media',
        readTime: '4 phút đọc',
        published: true
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Xử lý nén và tải ảnh từ máy tính thành Data URL tối ưu
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP, GIF)!');
      return;
    }

    setIsProcessingImg(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1000;
        const maxH = 650;
        let w = img.width;
        let h = img.height;

        if (w > maxW || h > maxH) {
          if (w / h > maxW / maxH) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          } else {
            w = Math.round((w * maxH) / h);
            h = maxH;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        setFormData((prev) => ({ ...prev, image: compressedBase64 }));
        setIsProcessingImg(false);
      };
      img.onerror = () => {
        setIsProcessingImg(false);
        alert('Không thể đọc file ảnh. Vui lòng thử lại!');
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-backdrop-custom" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', maxWidth: '640px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0'
      }}>
        {/* Header Modal */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 10
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className={initialData ? "fa-solid fa-newspaper" : "fa-solid fa-square-plus"}></i>
            {initialData ? 'Chỉnh Sửa Tin Tức & Bài Viết' : 'Thêm Bài Viết Mới'}
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
              Tiêu Đề Bài Viết <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Khởi Động Cầu Lông Chuẩn Cho Người Mới Tránh Chấn Thương..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Danh Mục Bài Viết
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  let label = 'Tin Tức';
                  if (cat === 'KY_THUAT') label = 'Kỹ Thuật & Sức Khỏe';
                  if (cat === 'TIEU_CHUAN') label = 'Tiêu Chuẩn Sân';
                  if (cat === 'GIAI_DAU') label = 'Giải Đấu Mở Rộng';
                  if (cat === 'SU_KIEN') label = 'Sự Kiện & CLB';
                  setFormData({ ...formData, category: cat, categoryLabel: label });
                }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
              >
                <option value="KY_THUAT">Kỹ Thuật & Sức Khỏe</option>
                <option value="TIEU_CHUAN">Tiêu Chuẩn Sân</option>
                <option value="GIAI_DAU">Giải Đấu Mở Rộng</option>
                <option value="SU_KIEN">Sự Kiện & CLB</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Tác Giả / Người Đăng
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="VD: D2 Media Team"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Hình Ảnh Banner Bài Viết (Tải trực tiếp từ máy tính)
            </label>

            {/* Input file ẩn từ máy tính */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImg}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  backgroundColor: '#0284c7', color: '#fff', border: 'none',
                  padding: '10px 18px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
                }}
              >
                <i className={isProcessingImg ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-cloud-arrow-up"}></i>
                {isProcessingImg ? 'Đang tải ảnh...' : '📁 Chọn ảnh từ máy tính (Upload ảnh)'}
              </button>

              {formData.image?.startsWith('data:') && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: '/news/news1.png' }))}
                  style={{
                    backgroundColor: '#fee2e2', color: '#dc2626', border: 'none',
                    padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-trash"></i> Xóa ảnh tải lên
                </button>
              )}
            </div>

            {/* Khung xem trước ảnh tải lên */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '12px', borderRadius: '10px', background: '#f8fafc',
              border: '1.5px dashed #cbd5e1'
            }}>
              <div style={{
                width: '130px', height: '80px', borderRadius: '8px', overflow: 'hidden',
                background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Xem trước ảnh banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = '/banners/banner1.jpg'; }}
                  />
                ) : (
                  <i className="fa-solid fa-image" style={{ fontSize: '26px', color: '#94a3b8' }}></i>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {formData.image?.startsWith('data:') ? (
                    <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fa-solid fa-circle-check"></i> Đã chọn ảnh từ máy tính thành công!
                    </span>
                  ) : (
                    <span>Đường dẫn ảnh hiện tại:</span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Hoặc dán URL ảnh nếu có..."
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#64748b', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Tóm Tắt Ngắn (Hiển thị ngoài trang chủ)
            </label>
            <textarea
              rows="2"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Nhập 1-2 câu tóm tắt nội dung chính của bài viết..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Nội Dung Chi Tiết Bài Viết
            </label>
            <textarea
              rows="5"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Nhập toàn bộ nội dung bài viết..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Trạng Thái Xuất Bản
            </label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>
                <input
                  type="radio"
                  name="publishRadio"
                  checked={formData.published === true}
                  onChange={() => setFormData({ ...formData, published: true })}
                />
                <i className="fa-solid fa-eye"></i> Xuất bản công khai (User thấy ngay)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                <input
                  type="radio"
                  name="publishRadio"
                  checked={formData.published === false}
                  onChange={() => setFormData({ ...formData, published: false })}
                />
                <i className="fa-solid fa-eye-slash"></i> Lưu nháp (Ẩn khỏi trang chủ)
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
              {initialData ? 'Lưu Thay Đổi' : 'Đăng Bài Viết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

