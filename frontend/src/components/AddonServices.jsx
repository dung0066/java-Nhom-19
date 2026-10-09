import React from 'react';
import { ShoppingBag, Plus, Minus } from 'lucide-react';

export default function AddonServices({ addons, addonQuantities, onUpdateQuantity }) {
  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="addons-panel">
      <div className="addons-header">
        <div className="panel-title-group">
          <ShoppingBag size={16} className="text-emerald" />
          <h3 className="panel-title">Dịch Vụ & Thiết Bị Đi Kèm (Tùy chọn)</h3>
        </div>
        <span className="panel-subtitle">Thuê vợt, mua ống cầu thi đấu & đồ uống</span>
      </div>

      <div className="addons-compact-grid">
        {addons.map((item) => {
          const qty = addonQuantities[item.id] || 0;
          return (
            <div key={item.id} className={`addon-item-box ${qty > 0 ? 'selected' : ''}`}>
              <div className="addon-info-left">
                <div className="addon-name">{item.name}</div>
                <div className="addon-desc">{item.category}</div>
                <div className="addon-cost">
                  {formatVND(item.price)} <span className="addon-unit">/ {item.unit}</span>
                </div>
              </div>

              <div className="addon-counter">
                <button
                  type="button"
                  disabled={qty === 0}
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="counter-btn"
                  title="Giảm"
                >
                  <Minus size={13} />
                </button>
                <span className="counter-val">{qty}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="counter-btn add"
                  title="Thêm"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
