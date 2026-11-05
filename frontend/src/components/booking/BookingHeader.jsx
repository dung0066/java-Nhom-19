import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function BookingHeader({
  date,
  onDateChange,
  branch,
  onBranchChange,
  onOpenGuide,
  onNavigate
}) {
  const { t, isVietnamese } = useLanguage();
  const branches = [
    { code: 'NVL', label: '70 Nguyễn Văn Lượng, P. 10, Gò Vấp', short: 'NVL' },
    { code: 'DQII', label: '262 Dương Quảng Hàm, Gò Vấp', short: 'DQH' },
    { code: 'NQA', label: '86 Nguyễn Quý Anh, Tân Phú', short: 'NQA' },
    { code: 'HB', label: '135 Hiệp Bình, Thủ Đức', short: 'HB' }
  ];

  return (
    <>
      {/* 1. TOP BLUE STRIPE */}
      <div className="top-blue-stripe">
        <span>
          <a
            href="javascript:void(0)"
            onClick={() => onNavigate('home')}
            style={{ color: '#ffffff', textDecoration: 'none', marginRight: '12px' }}
          >
            <i className="fa-solid fa-house"></i> {t.navHome}
          </a>{' '}
          | &nbsp; {isVietnamese ? 'Để xem giờ tối: Nhấn giữ Shift và Scroll để cuộn ngang' : 'Scroll right or hold Shift to view evening / night slots'}
        </span>
      </div>

      {/* 2. MARQUEE RUNNING YELLOW BAR */}
      <div className="top-yellow-marquee-bar">
        <div className="marquee-track">
          <span className="marquee-item">
            <i className="fa-solid fa-circle-exclamation marquee-icon"></i>
            {isVietnamese
              ? '(Sơ đồ sân HB: Sân 1+2) - (Sơ đồ sân NQA: Sân 1; Sân 2+3; Sân 4+5+6) - (Sơ đồ sân NVL: Sân 1+2; Sân 3+4; Sân 5+6+7) - (Sơ đồ sân DQII: Sân 1; Sân 2+3; Sân 4) | Hotline CSKH: 0889 555 559'
              : '(Branch HB: Courts 1+2) - (Branch NQA: Courts 1-6) - (Branch NVL: Courts 1-7) - (Branch DQH: Courts 1-4) | Hotline: 0889 555 559'}
          </span>
          <span className="marquee-item">
            <i className="fa-solid fa-circle-exclamation marquee-icon"></i>
            {isVietnamese
              ? '(Sơ đồ sân HB: Sân 1+2) - (Sơ đồ sân NQA: Sân 1; Sân 2+3; Sân 4+5+6) - (Sơ đồ sân NVL: Sân 1+2; Sân 3+4; Sân 5+6+7) - (Sơ đồ sân DQII: Sân 1; Sân 2+3; Sân 4) | Hotline CSKH: 0889 555 559'
              : '(Branch HB: Courts 1+2) - (Branch NQA: Courts 1-6) - (Branch NVL: Courts 1-7) - (Branch DQH: Courts 1-4) | Hotline: 0889 555 559'}
          </span>
        </div>
      </div>

      {/* 3. MAIN HEADER */}
      <header className="ways-header">
        <div className="header-inner">
          {/* Left Brand & Date */}
          <div className="header-col-left">
            <h1 className="header-title">{t.navBooking}</h1>
            <h2 className="header-subtitle">{t.brandName} {t.brandSub}</h2>

            <div className="header-action-row">
              <a
                href="javascript:void(0)"
                className="link-view-price"
                onClick={onOpenGuide}
              >
                {isVietnamese ? 'Xem giá, hướng dẫn' : 'View rates & guide'}
              </a>
              <div className="date-input-container">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="custom-date-picker"
                />
                <i className="fa-solid fa-calendar-days custom-cal-icon"></i>
              </div>
            </div>
          </div>

          {/* Middle Branch Selector */}
          <div className="header-col-mid">
            <div className="branches-list">
              {branches.map((b) => (
                <label
                  key={b.code}
                  className={`branch-item ${branch === b.code ? 'active' : ''}`}
                  onClick={() => onBranchChange(b.code)}
                >
                  <input
                    type="radio"
                    name="branchRadio"
                    value={b.code}
                    checked={branch === b.code}
                    readOnly
                  />
                  <span className="dot-radio"></span>
                  <span className="branch-label">
                    <strong>{b.short}</strong> = {b.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Right Contact & Legend */}
          <div className="header-col-right">
            <div className="hotline-btn">
              <span className="hotline-txt-top">{t.navHotlineLabel}</span>
              <span className="hotline-txt-bottom">0889 555 559</span>
            </div>

            <div className="legend-row">
              <div className="legend-cell">
                <span className="legend-color-box box-white"></span>
                <span>{t.booking.available}</span>
              </div>
              <div className="legend-cell">
                <span className="legend-color-box box-red"></span>
                <span>{t.booking.booked}</span>
              </div>
              <div className="legend-cell">
                <span className="legend-color-box box-yellow"></span>
                <span>{t.booking.selected}</span>
              </div>
              <div className="legend-cell">
                <span className="legend-color-box box-purple"></span>
                <span>{isVietnamese ? 'Cần Pass' : 'Transfer'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
