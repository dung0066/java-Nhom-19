import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MembershipModal({ isOpen, onClose }) {
  const modalBoxRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.82, autoAlpha: 0, y: -25 },
        { scale: 1, autoAlpha: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegister = (e) => {
    e.preventDefault();
    alert('Cảm ơn bạn! Đội ngũ Ways Station sẽ liên hệ xác nhận tư vấn gói Hội Viên VIP trong ít phút.');
    onClose();
  };

  return (
    <div className="modal-overlay show" style={{ zIndex: 1200 }}>
      <div
        className="modal-box"
        ref={modalBoxRef}
        style={{ maxWidth: '680px', borderRadius: '16px', overflow: 'hidden' }}
      >
        <div
          className="modal-head"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff' }}
        >
          <h3>
            <i className="fa-solid fa-crown" style={{ marginRight: '8px' }}></i>
            Đặc Quyền Hội Viên Ways Station Badminton
          </h3>
          <button className="close-x" onClick={onClose} style={{ color: '#fff' }}>
            &times;
          </button>
        </div>

        <div className="modal-content-area" style={{ padding: '24px' }}>
          <p style={{ color: '#475569', fontSize: '14px', marginBottom: '20px' }}>
            Tham gia câu lạc bộ thành viên Ways Station Badminton để tận hưởng các quyền lợi ưu đãi độc quyền trên toàn hệ thống 4 chi nhánh:
          </p>

          {/* 3 VIP Tiers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '24px' }}>🥈</span>
              <h4 style={{ color: '#0f172a', margin: '8px 0 4px', fontSize: '15px' }}>Hội Viên Bạc</h4>
              <p style={{ color: '#0284c7', fontWeight: 800, fontSize: '14px' }}>Giảm 5% giờ chơi</p>
              <small style={{ color: '#64748b', fontSize: '11.5px', display: 'block', marginTop: '6px' }}>Tặng 1 quấn cán vợt cao cấp/tháng</small>
            </div>

            <div style={{ background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '24px' }}>🥇</span>
              <h4 style={{ color: '#b45309', margin: '8px 0 4px', fontSize: '15px' }}>Hội Viên Vàng</h4>
              <p style={{ color: '#d97706', fontWeight: 800, fontSize: '14px' }}>Giảm 12% giờ chơi</p>
              <small style={{ color: '#64748b', fontSize: '11.5px', display: 'block', marginTop: '6px' }}>Ưu tiên giữ ca giờ vàng cố định</small>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '24px' }}>💎</span>
              <h4 style={{ color: '#15803d', margin: '8px 0 4px', fontSize: '15px' }}>Kim Cương VIP</h4>
              <p style={{ color: '#16a34a', fontWeight: 800, fontSize: '14px' }}>Giảm 20% trọn đời</p>
              <small style={{ color: '#64748b', fontSize: '11.5px', display: 'block', marginTop: '6px' }}>Miễn phí căng cước & Tủ đồ riêng</small>
            </div>
          </div>

          {/* Quick Register Form */}
          <form onSubmit={handleRegister}>
            <div className="form-row-2">
              <div className="form-field">
                <label>Họ và tên quý khách (*)</label>
                <input type="text" className="form-input" placeholder="Nguyễn Văn A" required />
              </div>
              <div className="form-field">
                <label>Số điện thoại Zalo (*)</label>
                <input type="tel" className="form-input" placeholder="0909123456" required />
              </div>
            </div>

            <div className="form-field">
              <label>Chi nhánh quan tâm tập luyện</label>
              <select className="form-input">
                <option value="NVL">Ways Station NVL - Gò Vấp</option>
                <option value="DQH">Ways Station DQH - Gò Vấp</option>
                <option value="NQA">Ways Station NQA - Tân Phú</option>
                <option value="HB">Ways Station HB - Thủ Đức</option>
              </select>
            </div>

            <div className="form-btn-group" style={{ marginTop: '16px' }}>
              <button type="button" className="btn-back" onClick={onClose}>
                Đóng
              </button>
              <button
                type="submit"
                className="btn-confirm-submit"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none' }}
              >
                <i className="fa-solid fa-crown"></i> Đăng Ký Hội Viên Ngay
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
