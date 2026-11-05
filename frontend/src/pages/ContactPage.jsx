import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BRANCHES } from '../data/courtData';
import '../styles/subpages.css';

export default function ContactPage({ onNavigate }) {
  const { isVietnamese } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    branch: 'NVL',
    subject: 'general',
    message: ''
  });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert(isVietnamese ? 'Vui lòng điền họ tên và số điện thoại!' : 'Please enter your name and phone number!');
      return;
    }
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        branch: 'NVL',
        subject: 'general',
        message: ''
      });
    }, 4500);
  };

  return (
    <div className="subpage-container">
      
      {/* 1. HERO BANNER */}
      <section className="subpage-hero" style={{ backgroundImage: "url('/banners/banner3.jpg')" }}>
        <div className="subpage-hero-overlay"></div>
        <div className="subpage-hero-content">
          <span className="subpage-hero-badge">
            <i className="fa-solid fa-headset"></i> {isVietnamese ? 'HỖ TRỢ KHÁCH HÀNG 24/7' : '24/7 CUSTOMER SERVICE'}
          </span>
          <h1 className="subpage-hero-title">
            {isVietnamese ? 'Liên Hệ Với Đội Ngũ D2 BadmintonShop' : 'Get in Touch with D2 BadmintonShop'}
          </h1>
          <p className="subpage-hero-desc">
            {isVietnamese
              ? 'Chúng tôi luôn lắng nghe và sẵn sàng giải đáp mọi thắc mắc về lịch đặt sân, gói hội viên VIP, tổ chức giải đấu hoặc hợp tác đào tạo.'
              : 'We are always here to help with court bookings, VIP memberships, amateur tournaments, and partnership inquiries.'}
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTACT SECTION */}
      <section className="subpage-section">
        <div className="contact-main-grid">
          
          {/* Cột 1: Contact Form */}
          <div className="contact-form-box">
            <h3 className="contact-form-title">
              {isVietnamese ? 'Gửi Lời Nhắn Trực Tuyến' : 'Send Us an Online Message'}
            </h3>
            <p className="contact-form-sub">
              {isVietnamese
                ? 'Điền thông tin bên dưới, nhân viên CSKH D2 BadmintonShop sẽ liên hệ phản hồi bạn trong vòng 15 phút.'
                : 'Fill out the form below and our customer support team will get back to you within 15 minutes.'}
            </p>

            {isSent ? (
              <div style={{
                background: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                borderRadius: '16px',
                padding: '30px 24px',
                textAlign: 'center',
                color: '#065f46'
              }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: '40px', color: '#10b981', marginBottom: '12px', display: 'block' }}></i>
                <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>
                  {isVietnamese ? 'Gửi Tin Nhắn Thành Công!' : 'Message Sent Successfully!'}
                </h4>
                <p style={{ fontSize: '14px', margin: 0, color: '#047857' }}>
                  {isVietnamese
                    ? 'Cảm ơn bạn đã liên hệ. Đội ngũ D2 BadmintonShop sẽ gọi điện hoặc gửi email phản hồi sớm nhất.'
                    : 'Thank you for reaching out. The D2 BadmintonShop team will contact you shortly.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="contact-form-group">
                  <label className="contact-form-label">
                    {isVietnamese ? 'Họ và tên *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    className="contact-form-input"
                    placeholder={isVietnamese ? 'Nguyễn Văn A' : 'John Doe'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="contact-form-group">
                    <label className="contact-form-label">
                      {isVietnamese ? 'Số điện thoại *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      className="contact-form-input"
                      placeholder="0914977030"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="contact-form-group">
                    <label className="contact-form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="contact-form-input"
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="contact-form-group">
                    <label className="contact-form-label">
                      {isVietnamese ? 'Chi nhánh quan tâm' : 'Branch of Interest'}
                    </label>
                    <select
                      className="contact-form-select"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    >
                      <option value="NVL">D2 BadmintonShop NVL - Gò Vấp</option>
                      <option value="DQII">D2 BadmintonShop DQII - Gò Vấp</option>
                      <option value="NQA">D2 BadmintonShop NQA - Tân Phú</option>
                      <option value="HB">D2 BadmintonShop HB - Thủ Đức</option>
                    </select>
                  </div>

                  <div className="contact-form-group">
                    <label className="contact-form-label">
                      {isVietnamese ? 'Nội dung liên hệ' : 'Topic'}
                    </label>
                    <select
                      className="contact-form-select"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="general">{isVietnamese ? 'Tư vấn đặt lịch sân' : 'Court Booking Inquiry'}</option>
                      <option value="vip">{isVietnamese ? 'Gói Hội viên VIP' : 'VIP Membership'}</option>
                      <option value="tournament">{isVietnamese ? 'Tổ chức giải đấu' : 'Tournament Hosting'}</option>
                      <option value="coaching">{isVietnamese ? 'Khóa học & Huấn luyện' : 'Coaching Courses'}</option>
                    </select>
                  </div>
                </div>

                <div className="contact-form-group">
                  <label className="contact-form-label">
                    {isVietnamese ? 'Lời nhắn chi tiết' : 'Your Message'}
                  </label>
                  <textarea
                    rows="4"
                    className="contact-form-textarea"
                    placeholder={isVietnamese ? 'Nhập nội dung cần tư vấn hoặc giải đáp...' : 'Type your message or questions here...'}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="contact-form-submit-btn">
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>{isVietnamese ? 'Gửi Lời Nhắn Ngay' : 'Send Message Now'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Cột 2: Danh sách 4 cơ sở & Hotline */}
          <div className="contact-branches-box">
            <div style={{
              background: 'linear-gradient(135deg, #002d62 0%, #003876 100%)',
              color: '#ffffff',
              padding: '24px',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(0, 45, 98, 0.2)'
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 10px 0' }}>
                <i className="fa-solid fa-phone-volume" style={{ color: '#38bdf8', marginRight: '8px' }}></i>
                {isVietnamese ? 'Hotline Tư Vấn 24/7' : '24/7 Direct Hotline'}
              </h4>
              <p style={{ fontSize: '13.5px', color: '#cbd5e1', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                {isVietnamese ? 'Hỗ trợ đặt sân tức thì, đổi ca chơi và tư vấn gói hội viên:' : 'Instant booking assistance, slot reschedules and memberships:'}
              </p>
              <a
                href="tel:0914977030"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ff0055',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: '900',
                  fontSize: '16px',
                  letterSpacing: '0.5px'
                }}
              >
                <i className="fa-solid fa-phone"></i>
                <span>0914977030</span>
              </a>
            </div>

            <div style={{ marginTop: '6px' }}>
              <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#002d62', marginBottom: '14px' }}>
                {isVietnamese ? '4 Cụm Sân Tại TP. Hồ Chí Minh' : '4 Branches in Ho Chi Minh City'}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {BRANCHES.map((b) => (
                  <div key={b.id} className="contact-branch-card">
                    <div className="contact-branch-icon">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div className="contact-branch-info">
                      <h4>{b.name}</h4>
                      <p>{b.address}</p>
                      <div className="contact-branch-meta">
                        <span><i className="fa-solid fa-table-cells"></i> {b.totalCourts} {isVietnamese ? 'Sân thi đấu' : 'Courts'}</span>
                        <span><i className="fa-solid fa-clock"></i> {b.openHours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* 3. INTERACTIVE GOOGLE MAPS EMBED */}
        <div className="contact-map-wrapper">
          <iframe
            title="D2 BadmintonShop Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1245785054173!2d106.70921097480525!3d10.801773089348633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528a49c9eb1a9%3A0x6b4efd8c1be1a141!2zODE4LzM0IFjDtCBWaeG6v3QgTmdo4buHIFTEqW5oLCBQaMaw4budbmcgMjUsIELDrG5oIFRo4bqhbmgsIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

    </div>
  );
}
