import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ProductModal({
  isOpen,
  onClose,
  initialData,
  onSave
}) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'RACKET',
    brand: '',
    badge: '',
    price: '',
    priceUnit: '/ buổi chơi',
    imageUrl: '',
    spec1: '',
    spec2: '',
    description: '',
    active: true
  });

  const modalBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  // Xử lý nén và tải ảnh từ máy tính thành Data URL
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP)!');
      return;
    }

    setIsProcessingImg(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 800;
        const maxH = 600;
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

        setFormData((prev) => ({ ...prev, imageUrl: compressedBase64 }));
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

  useEffect(() => {
    if (initialData) {
      const rawCat = typeof initialData.category === 'object' ? initialData.category?.code : initialData.category;
      const normalizedCat = rawCat === 'RACQUET' ? 'RACKET' : (rawCat || 'RACKET');
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        category: normalizedCat,
        brand: initialData.brand || '',
        badge: initialData.badge || '',
        price: initialData.price || '',
        priceUnit: initialData.priceUnit || '/ buổi chơi',
        imageUrl: initialData.imageUrl || '',
        spec1: initialData.spec1 || '',
        spec2: initialData.spec2 || '',
        description: initialData.description || '',
        active: initialData.active !== false
      });
    } else {
      setFormData({
        id: '',
        name: '',
        category: 'RACKET',
        brand: '',
        badge: '',
        price: '',
        priceUnit: '/ buổi chơi',
        imageUrl: '',
        spec1: '',
        spec2: '',
        description: '',
        active: true
      });
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.85, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="admin-modal-backdrop show">
      <div className="admin-modal-box" ref={modalBoxRef}>
        <div className="admin-modal-header">
          <h3>
            <i className="fa-solid fa-plus-circle"></i>{' '}
            {formData.id ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
          </h3>
          <button className="btn-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="form-row-2">
              <div className="form-group">
                <label>Tên Sản Phẩm (*):</label>
                <input
                  required
                  maxLength={150}
                  type="text"
                  className="form-control"
                  placeholder="VD: Yonex Astrox 100ZZ"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Danh Mục (*):</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="RACKET">Vợt Cầu Lông (RACKET)</option>
                  <option value="SHOES">Giày Thi Đấu (SHOES)</option>
                  <option value="REFRESHMENTS">Nước Giải Khát & Khăn Lạnh (REFRESHMENTS)</option>
                  <option value="SERVICES">Dịch Vụ Căng Cước & Tiện Ích (SERVICES)</option>
                  <option value="ACCESSORY">Phụ Kiện Thể Thao (ACCESSORY)</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Hãng / Thương Hiệu:</label>
                <input
                  maxLength={100}
                  type="text"
                  className="form-control"
                  placeholder="VD: YONEX JAPAN"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Huy Hiệu (Badge):</label>
                <input
                  maxLength={50}
                  type="text"
                  className="form-control"
                  placeholder="VD: HOT NHẤT, VIP, BÁN CHẠY"
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData({ ...formData, badge: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Giá Thuê / Bán (VNĐ) (*):</label>
                <input
                  required
                  max="100000000"
                  step="1000"
                  type="number"
                  className="form-control"
                  placeholder="VD: 30000"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Đơn Vị Tính:</label>
                <input
                  maxLength={50}
                  type="text"
                  className="form-control"
                  placeholder="VD: / buổi chơi, / ống, / cái"
                  value={formData.priceUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, priceUnit: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Hình Ảnh Sản Phẩm (Tải từ máy tính hoặc dán URL):</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImg}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    backgroundColor: '#0284c7', color: '#fff', border: 'none',
                    padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
                  }}
                >
                  <i className={isProcessingImg ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-cloud-arrow-up"}></i>
                  {isProcessingImg ? 'Đang nén ảnh...' : '📁 Chọn ảnh từ máy tính'}
                </button>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Hỗ trợ JPG, PNG, WEBP từ thiết bị của bạn
                </span>
              </div>

              <div className="image-preview-box" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <div style={{ width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Xem trước sản phẩm"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  ) : (
                    <i className="fa-solid fa-image" style={{ color: '#94a3b8', fontSize: '20px' }}></i>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    {formData.imageUrl?.startsWith('data:') ? (
                      <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="fa-solid fa-circle-check"></i> Đã chọn ảnh từ máy tính!
                      </span>
                    ) : (
                      'Đường dẫn ảnh sản phẩm:'
                    )}
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Hoặc dán URL ảnh nếu có..."
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Thông Số 1:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: Trọng lượng: 4U/G5 hoặc Size: 38-44"
                  value={formData.spec1}
                  onChange={(e) =>
                    setFormData({ ...formData, spec1: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Thông Số 2:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: Lực căng: 11kg hoặc Khử khuẩn UV"
                  value={formData.spec2}
                  onChange={(e) =>
                    setFormData({ ...formData, spec2: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mô Tả Sản Phẩm:</label>
              <textarea
                className="form-control"
                placeholder="Mô tả công nghệ, đặc tính..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div
              className="form-group"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <input
                type="checkbox"
                id="pActive"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="pActive" style={{ marginBottom: 0, cursor: 'pointer' }}>
                Hiển thị sản phẩm lên Trang Chủ
              </label>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="btn-modal-submit">
              <i className="fa-solid fa-floppy-disk"></i> Lưu Sản Phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
