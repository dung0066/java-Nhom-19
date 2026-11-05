import React from 'react';

export default function AdminNav({ onNavigate }) {
  return (
    <header className="admin-nav">
      <div className="nav-brand">
        <div className="nav-logo-icon">
          <i className="fa-solid fa-feather"></i>
        </div>
        <div className="nav-title-group">
          <h1>WAYS STATION BADMINTON - ADMIN PANEL</h1>
          <span>
            HỆ THỐNG QUẢN TRỊ TOÀN DIỆN: SÂN ĐẤU, ĐƠN HÀNG, GIÁ VÀ DỤNG CỤ CHO THUÊ
          </span>
        </div>
      </div>
      <div className="nav-links">
        <button
          type="button"
          className="btn-nav"
          onClick={() => onNavigate('home')}
          style={{ cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <i className="fa-solid fa-globe"></i> Xem Trang Chủ
        </button>
        <button
          type="button"
          className="btn-nav btn-nav-primary"
          onClick={() => onNavigate('booking')}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          <i className="fa-solid fa-calendar-check"></i> Xem Sơ Đồ Đặt Sân
        </button>
      </div>
    </header>
  );
}
