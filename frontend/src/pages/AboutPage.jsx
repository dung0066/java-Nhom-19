import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/subpages.css';

export default function AboutPage({ onNavigate }) {
  const { isVietnamese } = useLanguage();

  const stats = [
    { number: '04', label: isVietnamese ? 'Cơ sở hiện đại tại TP.HCM' : 'Modern Branches in HCMC' },
    { number: '25+', label: isVietnamese ? 'Sân thảm BWF tiêu chuẩn' : 'BWF Standard Courts' },
    { number: '5,000+', label: isVietnamese ? 'Hội viên & VĐV tham gia' : 'Active Members & Players' },
    { number: '99.8%', label: isVietnamese ? 'Tỉ lệ hài lòng về dịch vụ' : 'Customer Satisfaction' }
  ];

  const pillars = [
    {
      icon: 'fa-solid fa-award',
      title: isVietnamese ? 'Thảm Taraflex Chuẩn BWF' : 'BWF Standard Taraflex Mats',
      desc: isVietnamese
        ? '100% sân đấu trang bị thảm Gerflor Taraflex 7.5mm chuyên dụng, đàn hồi cao, giảm tối đa phản lực lên khớp gối và cổ chân người chơi.'
        : '100% courts equipped with 7.5mm Gerflor Taraflex tournament mats, providing superior shock absorption and joint protection.'
    },
    {
      icon: 'fa-solid fa-lightbulb',
      title: isVietnamese ? 'Hệ Thống Đèn Chống Lóa 600 Lux' : '600 Lux Anti-Glare Lighting',
      desc: isVietnamese
        ? 'Dàn đèn LED chuyên dụng bố trí góc chiếu xiên chuẩn quốc tế, ánh sáng đều khắp mặt sân, không gây chói mắt khi ngửa đầu đón cầu cao.'
        : 'Specialized LED illumination installed at optimal angles, delivering uniform glare-free light across all court zones.'
    },
    {
      icon: 'fa-solid fa-wand-magic-sparkles',
      title: isVietnamese ? 'Dịch Vụ Căng Vợt & Dụng Cụ' : 'Pro Stringing & Rental Gear',
      desc: isVietnamese
        ? 'Máy căng cước điện tử Yonex chính xác đến 0.1kg. Cho thuê vợt cao cấp, giày khử khuẩn tia UV và quầy nước nạp khoáng lạnh tại sân.'
        : 'Yonex electronic stringing accurate to 0.1kg. High-end racket rentals, UV-sterilized shoes, and chilled electrolyte beverages.'
    },
    {
      icon: 'fa-solid fa-users',
      title: isVietnamese ? 'Cộng Đồng & Huấn Luyện Viên' : 'Coaching & Community',
      desc: isVietnamese
        ? 'Tổ chức thường xuyên các giải đấu phong trào, khóa học cầu lông từ cơ bản đến nâng cao cùng đội ngũ HLV kiện tướng quốc gia tận tâm.'
        : 'Regular amateur tournaments, training courses from beginner to pro levels with dedicated national master trainers.'
    }
  ];

  const gallery = [
    {
      img: '/banners/banner1.jpg',
      caption: isVietnamese ? 'Khu Vực Thi Đấu Khán Đài BWF' : 'BWF Grandstand Arena'
    },
    {
      img: '/banners/banner2.jpg',
      caption: isVietnamese ? 'Thảm Chuyên Dụng 5 Lớp Giảm Chấn' : '5-Layer Shock-Absorbing Mats'
    },
    {
      img: '/banners/banner3.jpg',
      caption: isVietnamese ? 'Không Gian Thoáng Mát & Đèn Chống Chói' : 'Spacious Courts & Anti-Glare Lights'
    },
    {
      img: '/banners/banner4.jpg',
      caption: isVietnamese ? 'Khu Vực Nghỉ Ngơi & Nước Giải Khát' : 'Rest Lounge & Refreshment Bar'
    },
    {
      img: '/banners/banner5.jpg',
      caption: isVietnamese ? 'Dịch Vụ Căng Cước Vợt Điện Tử Lấy Liền' : 'Electronic Fast Stringing Service'
    },
    {
      img: '/banners/banner2.jpg',
      caption: isVietnamese ? 'Phòng Thay Đồ & Tủ Locker Mã PIN' : 'Locker Rooms & PIN Safe Storage'
    }
  ];

  return (
    <div className="subpage-container">
      
      {/* 1. HERO BANNER */}
      <section className="subpage-hero" style={{ backgroundImage: "url('/banners/banner1.jpg')" }}>
        <div className="subpage-hero-overlay"></div>
        <div className="subpage-hero-content">
          <span className="subpage-hero-badge">
            <i className="fa-solid fa-medal"></i> {isVietnamese ? 'D2 BADMINTONSHOP' : 'ABOUT D2 BADMINTONSHOP'}
          </span>
          <h1 className="subpage-hero-title">
            {isVietnamese ? 'Hành Trình Kiến Tạo Sân Đấu Đẳng Cấp' : 'Crafting World-Class Badminton Arenas'}
          </h1>
          <p className="subpage-hero-desc">
            {isVietnamese
              ? 'D2 BadmintonShop tự hào là hệ thống sân cầu lông tiêu chuẩn thi đấu quốc tế BWF hàng đầu tại TP. Hồ Chí Minh, mang lại không gian tập luyện chuyên nghiệp và kết nối đam mê cho mọi lông thủ.'
              : 'D2 BadmintonShop is proud to be a premier international BWF standard badminton court network in Ho Chi Minh City, offering a professional arena and vibrant community for all enthusiasts.'}
          </p>
        </div>
      </section>

      {/* 2. STORY & VISION SECTION */}
      <section className="subpage-section">
        <div className="about-story-grid">
          <div className="about-story-image-wrap">
            <img src="/banners/banner3.jpg" alt="D2 BadmintonShop Court" className="about-story-img" />
            <div className="about-story-badge">
              <i className="fa-solid fa-trophy"></i>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>
                  {isVietnamese ? 'Tiêu Chuẩn BWF Quốc Tế' : 'BWF Certified Standard'}
                </strong>
                <span style={{ fontSize: '12px', opacity: 0.85 }}>
                  {isVietnamese ? 'An toàn khớp gối - Thi đấu đỉnh cao' : 'Joint safety & peak performance'}
                </span>
              </div>
            </div>
          </div>

          <div className="about-story-text">
            <span className="section-tag-pill">
              {isVietnamese ? 'CÂU CHUYỆN THƯƠNG HIỆU' : 'OUR STORY & PASSION'}
            </span>
            <h3>
              {isVietnamese
                ? 'Nâng Tầm Trải Nghiệm Cầu Lông Cho Cộng Đồng'
                : 'Elevating the Badminton Experience for Everyone'}
            </h3>
            <p>
              {isVietnamese
                ? 'Xuất phát từ niềm đam mê cháy bỏng với bộ môn cầu lông và thấu hiểu nhu cầu tìm kiếm một mặt sân an toàn, chất lượng cao của các lông thủ, D2 BadmintonShop đã ra đời với sứ mệnh xây dựng chuỗi sân chơi đạt chuẩn quốc tế ngay giữa lòng TP.HCM.'
                : 'Born from a deep passion for badminton and understanding players’ need for safe, premium courts, D2 BadmintonShop was founded with a mission to develop international-standard court facilities in Ho Chi Minh City.'}
            </p>
            <p>
              {isVietnamese
                ? 'Chúng tôi đầu tư đồng bộ từ thảm thi đấu Gerflor Taraflex cao cấp của Pháp, hệ thống đèn LED chống lóa đạt chuẩn 600 Lux đến quy trình đặt lịch số hóa thông minh thời gian thực. Mỗi ca chơi tại D2 BadmintonShop là một trải nghiệm trọn vẹn và tràn đầy năng lượng.'
                : 'We invest comprehensively in French Gerflor Taraflex mats, 600 Lux glare-free LED lighting, and real-time digital booking. Every match at D2 BadmintonShop delivers an exhilarating, high-energy experience.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => onNavigate('booking')}
                style={{
                  background: 'linear-gradient(135deg, #009fe3 0%, #0060df 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fa-solid fa-calendar-check"></i>
                <span>{isVietnamese ? 'Đặt Sân Thi Đấu' : 'Book a Court'}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                style={{
                  background: '#ffffff',
                  color: '#002d62',
                  border: '1.5px solid #cbd5e1',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {isVietnamese ? 'Liên Hệ Tư Vấn' : 'Contact Us'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4 CORE PILLARS */}
      <section className="subpage-section bg-alt">
        <div className="section-inner">
          <div className="section-header-center">
            <span className="section-tag-pill">
              {isVietnamese ? 'TIÊU CHUẨN VƯỢT TRỘI' : 'OUR CORE PILLARS'}
            </span>
            <h2 className="section-main-title">
              {isVietnamese ? 'Tại Sao Nên Chọn Sân D2 BadmintonShop?' : 'Why Choose D2 BadmintonShop Arenas?'}
            </h2>
            <p className="section-sub-desc">
              {isVietnamese
                ? 'Chúng tôi mang lại những điều kiện cơ sở vật chất lý tưởng nhất để bạn tự tin bứt phá từng pha cầu.'
                : 'We deliver optimal facilities allowing you to unleash your athletic potential with complete confidence.'}
            </p>
          </div>

          <div className="about-pillars-grid">
            {pillars.map((item, idx) => (
              <div key={idx} className="about-pillar-card">
                <div className="about-pillar-icon">
                  <i className={item.icon}></i>
                </div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="about-stats-bar">
            {stats.map((s, idx) => (
              <div key={idx}>
                <div className="about-stat-number">{s.number}</div>
                <div className="about-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FACILITY GALLERY */}
      <section className="subpage-section">
        <div className="section-header-center">
          <span className="section-tag-pill">
            {isVietnamese ? 'HÌNH ẢNH THỰC TẾ' : 'FACILITY SHOWCASE'}
          </span>
          <h2 className="section-main-title">
            {isVietnamese ? 'Không Gian Cơ Sở Vật Chất Đẳng Cấp' : 'World-Class Facility Gallery'}
          </h2>
          <p className="section-sub-desc">
            {isVietnamese
              ? 'Chiêm ngưỡng toàn cảnh không gian sân thi đấu, khu dịch vụ tiện ích và trang thiết bị hiện đại tại D2 BadmintonShop.'
              : 'Take a visual tour through our tournament courts, amenities, and modern sports equipment.'}
          </p>
        </div>

        <div className="about-gallery-grid">
          {gallery.map((g, idx) => (
            <div key={idx} className="about-gallery-item">
              <img src={g.img} alt={g.caption} />
              <div className="about-gallery-caption">
                <i className="fa-solid fa-camera" style={{ marginRight: '8px', color: '#38bdf8' }}></i>
                {g.caption}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
