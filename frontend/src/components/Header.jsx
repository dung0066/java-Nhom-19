import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  MapPin,
  Phone,
  Calendar,
  Sparkles,
  Flame,
  Search,
  Shield,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function Header({
  selectedBranch,
  setSelectedBranch,
  branches,
  currentTab,
  setCurrentTab,
  selectedDate,
  setSelectedDate,
  passCount = 0,
  isBackendLive = false,
  onCheckBackend,
  onOpenLookup,
  onOpenGuide
}) {
  const headerRef = useRef(null);

  return (
    <header className="app-header" ref={headerRef}>
      {/* 1. TOP STRIPE: INSTRUCTION & HOTLINE */}
      <div className="top-blue-stripe">
        <div className="stripe-inner">
          <div className="stripe-left">
            <span>💡 Mẹo xem lịch: Nhấn giữ <strong>Shift</strong> và lăn chuột để cuộn ngang danh sách ca</span>
          </div>
          <div className="stripe-right">
            <span>CSKH 24/7: <strong>0889 555 559</strong></span>
            <button
              type="button"
              onClick={onOpenGuide}
              className="btn-stripe-link"
            >
              <HelpCircle size={12} />
              <span>Xem bảng giá & quy định</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MARQUEE YELLOW BAR (MATCHING THE ORIGINAL WAYS STATION TEMPLATE) */}
      <div className="top-yellow-marquee-bar">
        <div className="marquee-track">
          <span className="marquee-item">
            <Flame size={12} className="text-amber" />
            (Sơ đồ sân HB: Sân 1+2) - (Sơ đồ sân NQA: Sân 1; Sân 2+3; Sân 4+5+6) - (Sơ đồ sân NVL: Sân 1+2; Sân 3+4; Sân 5+6+7) - (Sơ đồ sân DQII: Sân 1; Sân 2+3; Sân 4) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Quý KH thuê sân tổ chức giải hoặc ghi hình cần liên hệ 0889 555 559 trước
          </span>
          <span className="marquee-item">
            <Flame size={12} className="text-amber" />
            (Sơ đồ sân HB: Sân 1+2) - (Sơ đồ sân NQA: Sân 1; Sân 2+3; Sân 4+5+6) - (Sơ đồ sân NVL: Sân 1+2; Sân 3+4; Sân 5+6+7) - (Sơ đồ sân DQII: Sân 1; Sân 2+3; Sân 4) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Quý KH thuê sân tổ chức giải hoặc ghi hình cần liên hệ 0889 555 559 trước
          </span>
        </div>
      </div>

      {/* 3. MAIN NAVBAR & BRANCH PICKER */}
      <div className="header-inner">
        {/* Left Brand */}
        <div className="brand-group" onClick={() => setCurrentTab('home')}>
          <div className="brand-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="18" r="3.2" fill="#10B981" />
              <path d="M12 15L6.5 5C5.8 3.8 7 2.8 8.2 3.3L12 5L15.8 3.3C17 2.8 18.2 3.8 17.5 5L12 15Z" fill="#34D399" />
              <line x1="8" y1="7" x2="16" y2="7" stroke="#0B0F19" strokeWidth="1.2" />
              <line x1="9.5" y1="10" x2="14.5" y2="10" stroke="#0B0F19" strokeWidth="1.2" />
            </svg>
          </div>
          <div className="brand-text">
            <div className="brand-name">
              WAYS STATION <span className="brand-tag">BADMINTON</span>
            </div>
            <div className="brand-sub">Đặt Sân Tiêu Chuẩn Quốc Tế BWF</div>
          </div>
        </div>

        {/* 4 Radios for Branches (Matching the original booking.html) */}
        <div className="header-branches-radios">
          {branches.map((b) => {
            const isChecked = selectedBranch?.code === b.code;
            return (
              <label
                key={b.code}
                className={`branch-radio-pill ${isChecked ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="headerBranchRadio"
                  value={b.code}
                  checked={isChecked}
                  onChange={() => setSelectedBranch(b)}
                />
                <span className="dot-radio"></span>
                <span className="radio-label-txt">
                  <strong>{b.code}</strong> = {b.name.replace('Ways Station ', '')}
                </span>
              </label>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav-links">
          <button
            type="button"
            onClick={() => setCurrentTab('booking')}
            className={`nav-link-btn ${currentTab === 'booking' ? 'active' : ''}`}
          >
            Đặt Sân Ma Trận
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('home')}
            className={`nav-link-btn ${currentTab === 'home' ? 'active' : ''}`}
          >
            Trang Chủ
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('market')}
            className={`nav-link-btn pass-nav-link ${currentTab === 'market' ? 'active' : ''}`}
          >
            <span>Chợ Pass Sân</span>
            {passCount > 0 && <span className="nav-pass-pill">{passCount}</span>}
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('services')}
            className={`nav-link-btn ${currentTab === 'services' ? 'active' : ''}`}
          >
            Thuê Vợt & Giày
          </button>
        </nav>

        {/* Action Tools: Tra cứu & Chuyển sang Admin */}
        <div className="header-meta">
          <button
            type="button"
            onClick={onCheckBackend}
            className={`backend-status-pill ${isBackendLive ? 'live' : 'mock'}`}
            title={isBackendLive ? 'Đã kết nối Spring Boot Backend cổng 8080' : 'Đang chạy chế độ Demo (Bấm để thử kết nối lại)'}
          >
            <span className="dot-pulse"></span>
            <span>{isBackendLive ? 'Backend 8080' : 'Demo Mode'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenLookup}
            className="btn-header-tool"
            title="Tra cứu lịch đặt sân theo SĐT hoặc mã đơn"
          >
            <Search size={14} />
            <span>Tra Cứu</span>
          </button>

          {/* Phân rõ ràng Quản Trị Admin */}
          <button
            type="button"
            onClick={() => setCurrentTab('admin')}
            className={`btn-header-tool admin-tool ${currentTab === 'admin' ? 'active-admin' : ''}`}
            title="Mở Bảng Điều Khiển Quản Trị Hệ Thống (Admin Portal)"
          >
            <Shield size={14} className="text-cyan" />
            <span>Quản Trị Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
