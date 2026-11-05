import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function ComboModal({ isOpen, onClose, onSelectCombo }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="combo-popup-backdrop" onClick={onClose}>
      <div className="combo-popup-box" onClick={(e) => e.stopPropagation()}>
        <div className="combo-popup-header">
          <div>
            <span className="offpeak-badge" style={{ display: 'inline-block', marginBottom: '6px' }}>
              <i className="fa-solid fa-tags"></i> CHƯƠNG TRÌNH KHUYẾN MÃI ĐẶC BIỆT
            </span>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
              Combo Giờ Vắng Ưu Đãi (Kèm Khăn & Nước)
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
              Tiết kiệm tới 40% chi phí khi đặt sân trong các khung giờ vắng khách (05:00 - 16:30 & 22:00 - 24:00)
            </p>
          </div>
          <button
            type="button"
            className="combo-popup-close-btn"
            onClick={onClose}
            title="Đóng cửa sổ"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#059669', background: '#ecfdf5', padding: '5px 12px', borderRadius: '20px' }}>
            <i className="fa-solid fa-circle-check"></i> Giờ vắng: 05:00 - 16:30 & 22:00 - 24:00
          </span>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#ea580c', background: '#fff7ed', padding: '5px 12px', borderRadius: '20px' }}>
            <i className="fa-solid fa-fire"></i> Giờ cao điểm: 17:00 - 21:30
          </span>
        </div>

        <div className="combo-cards-grid">
          {/* COMBO 1: SÂN ĐƠN TIẾT KIỆM */}
          <div
            className="combo-card combo-single"
            onClick={() => {
              onSelectCombo('SINGLE_OFFPEAK');
              onClose();
            }}
          >
            <div className="combo-card-badge">Tiết kiệm 35%</div>
            <div className="combo-card-top">
              <div className="combo-icon-circle blue">
                <i className="fa-solid fa-user"></i>
              </div>
              <div>
                <h4 className="combo-card-title">Combo Sân Đơn Tiết Kiệm</h4>
                <span className="combo-card-target">1 Sân • Khung Giờ Vắng</span>
              </div>
            </div>

            <div className="combo-perks-list">
              <div className="combo-perk-item">
                <i className="fa-solid fa-check-circle" style={{ color: '#0284c7' }}></i>
                <span>1 Giờ Sân tiêu chuẩn BWF</span>
              </div>
              <div className="combo-perk-item">
                <i className="fa-solid fa-bottle-water" style={{ color: '#0284c7' }}></i>
                <span>2 Chai Nước Suối / Nước khoáng LaVie</span>
              </div>
              <div className="combo-perk-item">
                <i className="fa-solid fa-rug" style={{ color: '#0284c7' }}></i>
                <span>2 Khăn Lạnh Kháng Khuẩn Bạc Hà</span>
              </div>
            </div>

            <div className="combo-pricing-footer">
              <div className="price-tag-wrap">
                <span className="old-price">150.000đ</span>
                <span className="deal-price">99.000đ/giờ</span>
              </div>
              <button
                type="button"
                className="btn-select-combo btn-combo-blue"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCombo('SINGLE_OFFPEAK');
                  onClose();
                }}
              >
                <span>CHỌN COMBO SÂN ĐƠN</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>

          {/* COMBO 2: SÂN ĐÔI / NHÓM BẠN */}
          <div
            className="combo-card combo-double"
            onClick={() => {
              onSelectCombo('DOUBLE_OFFPEAK');
              onClose();
            }}
          >
            <div className="combo-card-badge orange">Tiết kiệm 40% • Phổ biến</div>
            <div className="combo-card-top">
              <div className="combo-icon-circle orange">
                <i className="fa-solid fa-user-group"></i>
              </div>
              <div>
                <h4 className="combo-card-title">Combo Sân Đôi / Nhóm Bạn</h4>
                <span className="combo-card-target">2 Giờ liên tiếp hoặc 2 Sân liền kề</span>
              </div>
            </div>

            <div className="combo-perks-list">
              <div className="combo-perk-item">
                <i className="fa-solid fa-check-circle" style={{ color: '#ea580c' }}></i>
                <span>2 Giờ Sân tiêu chuẩn BWF</span>
              </div>
              <div className="combo-perk-item">
                <i className="fa-solid fa-bottle-water" style={{ color: '#ea580c' }}></i>
                <span>4 Chai Nước Khoáng / Pocari / Revive</span>
              </div>
              <div className="combo-perk-item">
                <i className="fa-solid fa-rug" style={{ color: '#ea580c' }}></i>
                <span>4 Khăn Lạnh Tiệt Trùng Cao Cấp</span>
              </div>
            </div>

            <div className="combo-pricing-footer">
              <div className="price-tag-wrap">
                <span className="old-price">320.000đ</span>
                <span className="deal-price orange">189.000đ/gói</span>
              </div>
              <button
                type="button"
                className="btn-select-combo btn-combo-orange"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCombo('DOUBLE_OFFPEAK');
                  onClose();
                }}
              >
                <span>CHỌN COMBO SÂN ĐÔI</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
