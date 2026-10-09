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
    category: 'RACQUET',
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        category: initialData.category || 'RACQUET',
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
        category: 'RACQUET',
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
                  <option value="RACQUET">Vợt Cầu Lông</option>
                  <option value="SHOES">Giày Thi Đấu</option>
                  <option value="ACCESSORY">Phụ Kiện & Căn Tin</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Hãng / Thương Hiệu:</label>
                <input
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
              <label>Đường Dẫn Ảnh (Image URL):</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
              <div className="image-preview-box">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                ) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    <i className="fa-solid fa-image"></i> Xem trước hình ảnh sản phẩm
                  </span>
                )}
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
