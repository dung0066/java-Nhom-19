import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/footer.css';

export default function AppFooter({ onNavigate }) {
  const { isVietnamese } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      alert(isVietnamese ? 'Vui lòng nhập địa chỉ email hợp lệ!' : 'Please enter a valid email address!');
      return;
    }
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setNewsletterEmail('');
    }, 4000);
  };

  const handleNavClick = (pageId, sectionId = null) => {
    if (sectionId) {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      onNavigate(pageId);
    }
  };

  const policyContents = {
    rules: {
      title: isVietnamese ? 'Quy chế Hoạt động ứng dụng' : 'Platform Operating Regulations',
      content: isVietnamese ? (
        <>
          <p>D2 BadmintonShop cung cấp nền tảng số hỗ trợ người chơi thể thao và các câu lạc bộ cầu lông:</p>
          <h4>1. Nguyên tắc hoạt động</h4>
          <p>Tất cả khách hàng tham gia đặt sân tại D2 BadmintonShop cần tuân thủ thời gian thi đấu đã đăng ký, sử dụng giày chuyên dụng thể thao đế không để lại vệt màu trên thảm thi đấu chuẩn BWF.</p>
          <h4>2. Quy tắc giữ sân</h4>
          <p>Lịch đặt được bảo lưu 100% khi thanh toán trực tuyến hoặc giữ chỗ thành công theo quy định hệ thống.</p>
        </>
      ) : (
        <>
          <p>D2 BadmintonShop provides a smart digital platform supporting badminton players and clubs:</p>
          <h4>1. Operating Principles</h4>
          <p>All players must adhere to their reserved time slots and wear non-marking indoor court shoes on BWF-certified tournament mats.</p>
          <h4>2. Reservation Guarantee</h4>
          <p>Bookings are 100% reserved upon successful online confirmation or payment as per system rules.</p>
        </>
      )
    },
    payment: {
      title: isVietnamese ? 'Thông tin về thanh toán' : 'Payment Information',
      content: isVietnamese ? (
        <>
          <p>Hệ thống hỗ trợ đa dạng phương thức thanh toán an toàn, bảo mật cao:</p>
          <h4>1. Chuyển khoản VietQR</h4>
          <p>Quét mã QR qua ứng dụng ngân hàng bất kỳ, tự động khớp lệnh giữ sân tức thì.</p>
          <h4>2. Ví điện tử & Thẻ ngân hàng</h4>
          <p>Hỗ trợ thanh toán nhanh qua MoMo, ZaloPay, Visa/Mastercard với công nghệ mã hóa SSL 256-bit.</p>
          <h4>3. Thanh toán tại quầy</h4>
          <p>Khách hàng có thể thanh toán trực tiếp tại quầy lễ tân chi nhánh khi nhận sân.</p>
        </>
      ) : (
        <>
          <p>Our portal supports diverse, highly secure payment solutions:</p>
          <h4>1. VietQR Bank Transfer</h4>
          <p>Scan instant QR code from any mobile banking app for real-time automated order matching.</p>
          <h4>2. E-Wallets & Bank Cards</h4>
          <p>Fast checkout via MoMo, ZaloPay, Visa/Mastercard protected by 256-bit SSL encryption.</p>
          <h4>3. Front-Desk Checkout</h4>
          <p>Cash and card payments accepted at the reception counter upon court check-in.</p>
        </>
      )
    },
    privacy: {
      title: isVietnamese ? 'Chính sách bảo mật thông tin cá nhân' : 'Privacy Policy',
      content: isVietnamese ? (
        <>
          <p>D2 BadmintonShop cam kết bảo vệ tuyệt đối thông tin riêng tư của khách hàng:</p>
          <h4>1. Thu thập dữ liệu</h4>
          <p>Hệ thống chỉ lưu trữ các thông tin cần thiết: Họ tên, số điện thoại, email phục vụ việc xác nhận mã đặt sân và gửi thông báo dịch vụ.</p>
          <h4>2. Bảo mật thông tin</h4>
          <p>Không chia sẻ thông tin người dùng cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý của khách hàng.</p>
        </>
      ) : (
        <>
          <p>D2 BadmintonShop is fully dedicated to safeguarding personal customer data:</p>
          <h4>1. Data Collection</h4>
          <p>We only collect essential details: Full Name, Phone Number, and Email for reservation verification and automated notifications.</p>
          <h4>2. Privacy Protection</h4>
          <p>Customer data is never shared with third parties without explicit authorization.</p>
        </>
      )
    },
    support: {
      title: isVietnamese ? 'Thông tin chăm sóc khách hàng' : 'Customer Support & Care',
      content: isVietnamese ? (
        <>
          <p>Đội ngũ CSKH D2 BadmintonShop sẵn sàng phục vụ và giải đáp mọi thắc mắc của bạn:</p>
          <h4>Hotline tư vấn & hỗ trợ đặt lịch 24/7</h4>
          <p><strong>Điện thoại:</strong> 0914977030</p>
          <p><strong>Email:</strong> d2shop.badminton@gmail.com</p>
          <p><strong>Thời gian hoạt động quầy:</strong> 05:00 - 24:00 (Hàng ngày, kể cả Lễ & Tết)</p>
        </>
      ) : (
        <>
          <p>The D2 BadmintonShop customer care team is dedicated to assisting you 24/7:</p>
          <h4>24/7 Booking & Support Hotline</h4>
          <p><strong>Phone:</strong> 0914977030</p>
          <p><strong>Email:</strong> d2shop.badminton@gmail.com</p>
          <p><strong>Operating Hours:</strong> 05:00 - 24:00 (Everyday, including Holidays)</p>
        </>
      )
    },
    terms: {
      title: isVietnamese ? 'Điều khoản dịch vụ' : 'Terms of Service',
      content: isVietnamese ? (
        <>
          <p>Điều khoản sử dụng dịch vụ tại toàn bộ cụm sân D2 BadmintonShop:</p>
          <h4>1. Hủy & Đổi giờ đặt sân</h4>
          <p>Khách hàng được quyền đổi giờ hoặc dời lịch trước ít nhất 4 tiếng so với giờ bắt đầu ca chơi mà không mất phí.</p>
          <h4>2. Trách nhiệm người chơi</h4>
          <p>Giữ gìn vệ sinh chung, bảo quản tư trang cá nhân tại tủ locker có khóa mã PIN của sân.</p>
        </>
      ) : (
        <>
          <p>Service conditions across all D2 BadmintonShop court complexes:</p>
          <h4>1. Rescheduling & Cancellations</h4>
          <p>Players can reschedule or postpone reservations at least 4 hours before slot start time free of charge.</p>
          <h4>2. Player Responsibilities</h4>
          <p>Maintain general cleanliness and store personal belongings in PIN-code locker units provided on site.</p>
        </>
      )
    },
    cookie: {
      title: isVietnamese ? 'Chính sách Cookie' : 'Cookie Policy',
      content: isVietnamese ? (
        <>
          <p>Website sử dụng cookie lưu trữ cục bộ để:</p>
          <ul>
            <li>Ghi nhớ phiên đăng nhập và ngôn ngữ ưu tiên của bạn (Tiếng Việt / English).</li>
            <li>Tối ưu tốc độ tải danh sách khung giờ trống tại các chi nhánh.</li>
          </ul>
        </>
      ) : (
        <>
          <p>Our website uses local cookies and storage to:</p>
          <ul>
            <li>Save your active session and language preference (Vietnamese / English).</li>
            <li>Accelerate loading speeds for real-time court availability matrix.</li>
          </ul>
        </>
      )
    },
    guide: {
      title: isVietnamese ? 'Hướng dẫn sử dụng & Đặt sân' : 'User Guide & Booking Steps',
      content: isVietnamese ? (
        <>
          <h4>Quy trình 3 bước đặt sân cực nhanh:</h4>
          <p><strong>Bước 1:</strong> Chọn chi nhánh sân gần bạn nhất và ngày bạn muốn thi đấu.</p>
          <p><strong>Bước 2:</strong> Nhấp chọn các ô khung giờ mong muốn trên ma trận sân trực quan.</p>
          <p><strong>Bước 3:</strong> Nhập thông tin người chơi, thanh toán hoặc xác nhận nhận mã đặt sân.</p>
        </>
      ) : (
        <>
          <h4>3 Fast & Easy Steps to Reserve:</h4>
          <p><strong>Step 1:</strong> Pick your preferred badminton branch and desired playing date.</p>
          <p><strong>Step 2:</strong> Click the available time slots on our interactive live court matrix.</p>
          <p><strong>Step 3:</strong> Fill in player info, checkout via VietQR or card to receive booking code.</p>
        </>
      )
    }
  };

  return (
    <footer className="d2-footer-wrapper">
      
      {/* 1. TOP NEWSLETTER SUBSCRIPTION BANNER */}
      <section className="d2-footer-newsletter">
        <div className="d2-newsletter-inner">
          <div className="d2-newsletter-text">
            <h3 className="d2-newsletter-title">
              {isVietnamese ? 'Đặt sân nhanh chóng, tiết kiệm' : 'Fast & Cost-Effective Booking'}
            </h3>
            <p className="d2-newsletter-sub">
              {isVietnamese
                ? 'Hãy đăng ký và chúng tôi sẽ gửi những ưu đãi tốt nhất cho bạn'
                : 'Subscribe now to receive our best exclusive badminton promotions'}
            </p>
          </div>

          <div>
            <form className="d2-newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="d2-newsletter-input"
                placeholder={isVietnamese ? 'Địa chỉ e-mail của bạn' : 'Enter your email address'}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" className="d2-newsletter-btn">
                {isVietnamese ? 'Đăng kí' : 'Subscribe'}
              </button>
            </form>
            {subscribed && (
              <div className="d2-newsletter-success">
                <i className="fa-solid fa-circle-check"></i>
                <span>
                  {isVietnamese
                    ? 'Cảm ơn bạn! D2 BadmintonShop đã ghi nhận email ưu đãi của bạn.'
                    : 'Thank you! D2 BadmintonShop has saved your email successfully.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. MAIN 4-COLUMN FOOTER */}
      <div className="d2-footer-main">
        <div className="d2-footer-grid">
          
          {/* CỘT 1: THƯƠNG HIỆU & THÔNG TIN LIÊN HỆ D2 BADMINTONSHOP */}
          <div className="d2-footer-col-brand">
            <div
              className="d2-footer-brand-header"
              onClick={() => handleNavClick('home')}
              title="D2 BadmintonShop - Badminton"
            >
              <img
                src="/logo-d2.png"
                alt="D2 BadmintonShop"
                style={{
                  height: '62px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25))'
                }}
              />
            </div>

            <div className="d2-footer-contact-list">
              <div className="d2-footer-contact-item">
                <i className="fa-solid fa-location-dot"></i>
                <span>
                  818/34 Xô Viết Nghệ Tĩnh, Phường Thạnh Mỹ Tây, Thành phố Hồ Chí Minh, Việt Nam
                </span>
              </div>

              <a href="tel:0914977030" className="d2-footer-contact-item">
                <i className="fa-solid fa-phone"></i>
                <strong>0914977030</strong>
              </a>

              <a href="mailto:d2shop.badminton@gmail.com" className="d2-footer-contact-item">
                <i className="fa-solid fa-envelope"></i>
                <span>d2shop.badminton@gmail.com</span>
              </a>
            </div>
          </div>

          {/* CỘT 2: QUY ĐỊNH VÀ CHÍNH SÁCH */}
          <div>
            <h4 className="d2-footer-heading">
              {isVietnamese ? 'Quy định và chính sách' : 'Rules & Policies'}
            </h4>
            <ul className="d2-footer-links-list">
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => setActiveModal('rules')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Quy chế Hoạt động ứng dụng' : 'Platform Operating Regulations'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => setActiveModal('payment')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Thông tin về thanh toán' : 'Payment Information'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => setActiveModal('privacy')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Chính sách bảo mật thông tin cá nhân' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => setActiveModal('support')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Thông tin chăm sóc khách hàng' : 'Customer Support & Care'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => setActiveModal('terms')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Điều khoản dịch vụ' : 'Terms of Service'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => setActiveModal('cookie')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Chính sách cookie' : 'Cookie Policy'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => setActiveModal('guide')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Hướng dẫn sử dụng' : 'User Guide & Booking Steps'}
                </button>
              </li>
            </ul>
          </div>

          {/* CỘT 3: LIÊN KẾT NHANH (THEO DỮ LIỆU CỦA DỰ ÁN) */}
          <div>
            <h4 className="d2-footer-heading">
              {isVietnamese ? 'Liên kết nhanh' : 'Quick Links'}
            </h4>
            <ul className="d2-footer-links-list">
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => handleNavClick('home')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Trang chủ' : 'Home'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => handleNavClick('about')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Giới thiệu về D2 BadmintonShop' : 'About D2 BadmintonShop'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => handleNavClick('booking')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Sân tập & Đặt sân thi đấu' : 'Tournament Courts & Booking'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => handleNavClick('news')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Tin tức & Giải đấu' : 'News & Tournaments'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => handleNavClick('contact')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Liên hệ & Bản đồ 4 chi nhánh' : 'Contact & 4 Branches Map'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="d2-footer-link-btn"
                  onClick={() => handleNavClick('admin')}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                  {isVietnamese ? 'Cổng Quản trị hệ thống' : 'Admin Portal'}
                </button>
              </li>
            </ul>
          </div>

          {/* CỘT 4: CHỨNG NHẬN ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG & THANH TOÁN */}
          <div className="d2-footer-col-cert">
            <div>
              <h4 className="d2-footer-heading">
                {isVietnamese ? 'Chứng nhận uy tín' : 'Verified Certifications'}
              </h4>
              
              {/* Badge ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG */}
              <a
                href="http://online.gov.vn"
                target="_blank"
                rel="noreferrer"
                className="d2-bct-badge-link"
                title={isVietnamese ? 'Đã đăng ký Bộ Công Thương' : 'Registered with Ministry of Industry and Trade'}
              >
                <svg
                  className="bo-cong-thuong-badge"
                  viewBox="0 0 200 62"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Red Pill Frame */}
                  <rect
                    x="1"
                    y="1"
                    width="198"
                    height="60"
                    rx="30"
                    fill="#d6001c"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {/* Verified Checkmark Seal */}
                  <circle cx="31" cy="31" r="23" fill="#ffffff" />
                  <circle cx="31" cy="31" r="20" fill="#d6001c" />
                  <path
                    d="M21 31L28 38L42 22"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text
                    x="31"
                    y="14"
                    fill="#ffffff"
                    fontSize="5.5"
                    fontWeight="900"
                    textAnchor="middle"
                    letterSpacing="0.5"
                  >
                    ONLINE.GOV.VN
                  </text>
                  {/* Badge Text */}
                  <text
                    x="68"
                    y="27"
                    fill="#ffffff"
                    fontSize="13.5"
                    fontWeight="900"
                    letterSpacing="0.6"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    ĐÃ ĐĂNG KÝ
                  </text>
                  <text
                    x="68"
                    y="45"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="800"
                    letterSpacing="0.4"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    BỘ CÔNG THƯƠNG
                  </text>
                </svg>
              </a>
            </div>

            {/* Thanh toán an toàn */}
            <div className="d2-footer-payments">
              <span className="d2-payments-label">
                {isVietnamese ? 'Thanh toán an toàn' : 'Secure Payments'}
              </span>
              <div className="d2-payments-icons">
                <span className="d2-payment-pill">
                  <i className="fa-solid fa-qrcode"></i> VietQR
                </span>
                <span className="d2-payment-pill">
                  <i className="fa-solid fa-wallet"></i> MoMo
                </span>
                <span className="d2-payment-pill">
                  <i className="fa-solid fa-credit-card"></i> Visa/Master
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 3. COPYRIGHT BAR */}
      <div className="d2-footer-copyright">
        Copyright © 2026 – <strong>D2 BadmintonShop</strong>. All rights reserved. {isVietnamese ? 'Nền tảng đặt sân & dịch vụ cầu lông hàng đầu.' : 'Leading badminton court booking & services portal.'}
      </div>

      {/* 4. MODAL HIỂN THỊ CHÍNH SÁCH */}
      {activeModal && policyContents[activeModal] && (
        <div className="d2-policy-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="d2-policy-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="d2-policy-modal-close"
              onClick={() => setActiveModal(null)}
              aria-label={isVietnamese ? 'Đóng' : 'Close'}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h3 className="d2-policy-modal-title">
              {policyContents[activeModal].title}
            </h3>
            <div className="d2-policy-modal-body">
              {policyContents[activeModal].content}
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
