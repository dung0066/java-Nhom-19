import React, { useRef } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../../context/LanguageContext';

export default function OffPeakComboBar({ onSelectCombo, timeSlots = [], courts = [] }) {
  const { t } = useLanguage();
  const containerRef = useRef(null);

  const handleComboClick = (comboType) => {
    onSelectCombo(comboType);
  };

  const handleHoverEnter = (e) => {
    gsap.to(e.currentTarget, { scale: 1.025, y: -3, duration: 0.22, ease: 'power2.out' });
  };

  const handleHoverLeave = (e) => {
    gsap.to(e.currentTarget, { scale: 1, y: 0, duration: 0.22, ease: 'power2.out' });
  };

  return (
    <div className="offpeak-combo-section" ref={containerRef}>
      <div className="offpeak-combo-header">
        <div className="offpeak-title-wrap">
          <span className="offpeak-badge">
            <i className="fa-solid fa-tags"></i> {t.combo.badge}
          </span>
          <h3 className="offpeak-heading">
            {t.combo.title}
          </h3>
          <p className="offpeak-subtext">
            {t.combo.subtitle}
          </p>
        </div>

        <div className="hours-guide-pills">
          <span className="guide-pill offpeak">
            <i className="fa-solid fa-circle-check"></i> {t.combo.offPeakTag}
          </span>
          <span className="guide-pill peak">
            <i className="fa-solid fa-fire"></i> {t.combo.peakTag}
          </span>
        </div>
      </div>

      <div className="combo-cards-grid">
        {/* COMBO 1: SÂN ĐƠN TIẾT KIỆM */}
        <div
          className="combo-card combo-single"
          onMouseEnter={handleHoverEnter}
          onMouseLeave={handleHoverLeave}
          onClick={() => handleComboClick('SINGLE_OFFPEAK')}
        >
          <div className="combo-card-badge">{t.combo.singleBadge}</div>
          <div className="combo-card-top">
            <div className="combo-icon-circle blue">
              <i className="fa-solid fa-user"></i>
            </div>
            <div>
              <h4 className="combo-card-title">{t.combo.singleTitle}</h4>
              <span className="combo-card-target">1 Court • Off-peak slot</span>
            </div>
          </div>

          <div className="combo-perks-list">
            <div className="combo-perk-item">
              <i className="fa-solid fa-check-circle"></i>
              <span>{t.combo.singleDesc}</span>
            </div>
            <div className="combo-perk-item">
              <i className="fa-solid fa-bottle-water"></i>
              <span>2 Bottled Drinks (LaVie / Revive)</span>
            </div>
            <div className="combo-perk-item">
              <i className="fa-solid fa-rug"></i>
              <span>2 Antibacterial Cold Towels</span>
            </div>
          </div>

          <div className="combo-pricing-footer">
            <div className="price-tag-wrap">
              <span className="old-price">{t.combo.singleOriginal}</span>
              <span className="deal-price">{t.combo.singlePrice}</span>
            </div>
            <button
              type="button"
              className="btn-select-combo btn-combo-blue"
              onClick={(e) => {
                e.stopPropagation();
                handleComboClick('SINGLE_OFFPEAK');
              }}
            >
              <span>{t.combo.singleBtn}</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* COMBO 2: SÂN ĐÔI / NHÓM BẠN */}
        <div
          className="combo-card combo-double"
          onMouseEnter={handleHoverEnter}
          onMouseLeave={handleHoverLeave}
          onClick={() => handleComboClick('DOUBLE_OFFPEAK')}
        >
          <div className="combo-card-badge orange">{t.combo.duoBadge}</div>
          <div className="combo-card-top">
            <div className="combo-icon-circle orange">
              <i className="fa-solid fa-user-group"></i>
            </div>
            <div>
              <h4 className="combo-card-title">{t.combo.duoTitle}</h4>
              <span className="combo-card-target">2 Consecutive hours or 2 adjacent courts</span>
            </div>
          </div>

          <div className="combo-perks-list">
            <div className="combo-perk-item">
              <i className="fa-solid fa-check-circle"></i>
              <span>{t.combo.duoDesc}</span>
            </div>
            <div className="combo-perk-item">
              <i className="fa-solid fa-bottle-water"></i>
              <span>4 Refreshing Drinks (Pocari / Revive)</span>
            </div>
            <div className="combo-perk-item">
              <i className="fa-solid fa-rug"></i>
              <span>4 Chilled Antibacterial Towels</span>
            </div>
          </div>

          <div className="combo-pricing-footer">
            <div className="price-tag-wrap">
              <span className="old-price">{t.combo.duoOriginal}</span>
              <span className="deal-price orange">{t.combo.duoPrice}</span>
            </div>
            <button
              type="button"
              className="btn-select-combo btn-combo-orange"
              onClick={(e) => {
                e.stopPropagation();
                handleComboClick('DOUBLE_OFFPEAK');
              }}
            >
              <span>{t.combo.duoBtn}</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
