import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchArticles } from '../services/api';
import '../styles/subpages.css';

/**
 * Trang Tin Tức Cầu Lông D2 BADMINTONSHOP (Dành Cho Khách Hàng)
 * Dữ liệu thật 100% kết nối SQL Database (/api/articles), đồng bộ thời gian thực với Admin!
 */
export default function NewsPage({ onNavigate }) {
  const { isVietnamese } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [readingArticle, setReadingArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', label: isVietnamese ? 'Tất Cả' : 'All Articles' },
    { id: 'KY_THUAT', label: isVietnamese ? 'Kỹ Thuật & Mẹo' : 'Skills & Tips' },
    { id: 'TIEU_CHUAN', label: isVietnamese ? 'Tiêu Chuẩn Sân' : 'Court Standards' },
    { id: 'GIAI_DAU', label: isVietnamese ? 'Giải Đấu' : 'Tournaments' },
    { id: 'SU_KIEN', label: isVietnamese ? 'Sự Kiện & CLB' : 'Events & Clubs' }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchArticles(selectedCategory);
        if (data && data.length > 0) {
          setArticles(data.filter(a => a.published !== false));
        } else {
          // Đọc từ localStorage admin đã lưu
          const saved = localStorage.getItem('d2_admin_articles');
          if (saved) {
            const parsed = JSON.parse(saved);
            const filtered = selectedCategory === 'all'
              ? parsed.filter(a => a.published !== false)
              : parsed.filter(a => a.published !== false && a.category === selectedCategory);
            setArticles(filtered);
          }
        }
      } catch (_) {
        const saved = localStorage.getItem('d2_admin_articles');
        if (saved) {
          const parsed = JSON.parse(saved);
          const filtered = selectedCategory === 'all'
            ? parsed.filter(a => a.published !== false)
            : parsed.filter(a => a.published !== false && a.category === selectedCategory);
          setArticles(filtered);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedCategory]);

  useEffect(() => {
    if (readingArticle) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setReadingArticle(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [readingArticle]);

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const regularArticles = articles.length > 1 ? articles.slice(1) : (articles.length === 1 ? articles : []);

  return (
    <div className="subpage-container">
      {/* 1. HERO BANNER */}
      <section className="subpage-hero" style={{ backgroundImage: "url('/banners/banner2.jpg')" }}>
        <div className="subpage-hero-overlay"></div>
        <div className="subpage-hero-content">
          <span className="subpage-hero-badge">
            <i className="fa-solid fa-newspaper"></i> {isVietnamese ? 'BẢN TIN CẦU LÔNG D2 BADMINTONSHOP' : 'D2 BADMINTON NEWS'}
          </span>
          <h1 className="subpage-hero-title">
            {isVietnamese ? 'Tin Tức, Giải Đấu & Kỹ Thuật Đỉnh Cao' : 'News, Tournaments & Pro Badminton Skills'}
          </h1>
          <p className="subpage-hero-desc">
            {isVietnamese
              ? 'Dữ liệu tin tức cập nhật trực tiếp từ hệ thống D2 BadmintonShop. Cung cấp cẩm nang chọn vợt, bài tập thể lực và những giải đấu phong trào mới nhất.'
              : 'Live badminton articles and tournament updates synchronized with D2 BadmintonShop database.'}
          </p>
        </div>
      </section>

      {/* 2. CATEGORY FILTER TABS */}
      <section className="subpage-section">
        <div className="news-filter-tabs">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`news-filter-btn ${selectedCategory === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#0284c7', marginBottom: '12px' }}></i>
            <p style={{ margin: 0, fontWeight: 600 }}>Đang nạp bài viết từ cơ sở dữ liệu...</p>
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <i className="fa-regular fa-folder-open" style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }}></i>
            <p style={{ margin: 0, fontWeight: 600 }}>Không tìm thấy bài viết nào trong danh mục này.</p>
          </div>
        )}

        {/* 3. FEATURED ARTICLE */}
        {!isLoading && featuredArticle && (
          <div className="news-featured-card" onClick={() => setReadingArticle(featuredArticle)}>
            <div className="news-featured-img-box">
              <img
                src={featuredArticle.image || '/news/news1.png'}
                alt={featuredArticle.title}
                onError={(e) => { e.currentTarget.src = '/banners/banner1.jpg'; }}
              />
              <span className="news-featured-badge">{featuredArticle.categoryLabel || featuredArticle.category || 'Nổi Bật'}</span>
            </div>
            <div className="news-featured-content">
              <div className="news-meta-row">
                <span><i className="fa-solid fa-calendar"></i> {featuredArticle.createdAt ? new Date(featuredArticle.createdAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}</span>
                <span><i className="fa-solid fa-clock"></i> {featuredArticle.readTime || '4 phút đọc'}</span>
                <span><i className="fa-solid fa-user-pen"></i> {featuredArticle.author || 'D2 Media'}</span>
              </div>
              <h2 className="news-featured-title">{featuredArticle.title}</h2>
              <p className="news-featured-desc">{featuredArticle.summary || featuredArticle.content}</p>
              <div className="news-read-more-btn">
                <span>{isVietnamese ? 'Đọc toàn văn bài viết' : 'Read Full Article'}</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </div>
          </div>
        )}

        {/* 4. ARTICLES GRID */}
        {!isLoading && regularArticles.length > 0 && (
          <div className="news-grid">
            {regularArticles.map((item) => (
              <article
                key={item.id}
                className="news-card"
                onClick={() => setReadingArticle(item)}
              >
                <div className="news-card-img-box">
                  <img
                    src={item.image || '/news/news2.png'}
                    alt={item.title}
                    onError={(e) => { e.currentTarget.src = '/banners/banner2.jpg'; }}
                  />
                  <span className="news-card-badge">{item.categoryLabel || item.category || 'Tin tức'}</span>
                </div>
                <div className="news-card-body">
                  <div className="news-meta-row" style={{ fontSize: '11px', marginBottom: '8px' }}>
                    <span><i className="fa-regular fa-calendar"></i> {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
                    <span><i className="fa-regular fa-clock"></i> {item.readTime || '3 phút'}</span>
                  </div>
                  <h3 className="news-card-title">{item.title}</h3>
                  <p className="news-card-desc">{item.summary || item.content}</p>
                  <div className="news-card-footer">
                    <span className="news-link-read">
                      {isVietnamese ? 'Xem chi tiết' : 'Read more'} <i className="fa-solid fa-chevron-right"></i>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 5. POPUP ĐỌC TOÀN VĂN BÀI VIẾT (RENDER BẰNG PORTAL TRÁNH BỊ TRƯỢT/KẸT VÀO PARENT) */}
      {readingArticle && createPortal(
        <div
          className="modal-backdrop-custom"
          onClick={() => setReadingArticle(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '20px',
            boxSizing: 'border-box'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '760px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              animation: 'newsModalFadeIn 0.22s ease-out'
            }}
          >
            {/* Header Image với Gradient & Nút Đóng */}
            <div style={{ position: 'relative', height: '260px', width: '100%', flexShrink: 0, backgroundColor: '#0f172a', overflow: 'hidden' }}>
              <img
                src={readingArticle.image || '/news/news1.png'}
                alt={readingArticle.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                onError={(e) => { e.currentTarget.src = '/banners/banner1.jpg'; }}
              />
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)'
              }}></div>
              
              <span style={{
                position: 'absolute', bottom: '18px', left: '24px',
                background: '#0284c7', color: '#ffffff', padding: '6px 14px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}>
                {readingArticle.categoryLabel || readingArticle.category || 'Tin Tức'}
              </span>

              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                aria-label="Đóng bài viết"
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255, 255, 255, 0.25)', color: '#ffffff',
                  width: '38px', height: '38px', borderRadius: '50%',
                  fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s', zIndex: 10
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'; }}
              >
                ✕
              </button>
            </div>

            {/* Content Area cuộn mượt mà */}
            <div style={{ padding: '28px 32px 32px', overflowY: 'auto', flex: 1 }}>
              {/* Metadata row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-regular fa-calendar" style={{ color: '#0284c7' }}></i>
                  {readingArticle.createdAt ? new Date(readingArticle.createdAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-user-pen" style={{ color: '#0284c7' }}></i>
                  {readingArticle.author || 'D2 Media Team'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-regular fa-clock" style={{ color: '#0284c7' }}></i>
                  {readingArticle.readTime || '3 phút đọc'}
                </span>
              </div>

              {/* Tiêu đề bài viết */}
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 18px 0', lineHeight: 1.4 }}>
                {readingArticle.title}
              </h2>

              {/* Tóm tắt / Highlight Box */}
              {readingArticle.summary && readingArticle.summary !== readingArticle.content && (
                <div style={{
                  background: '#f0f9ff',
                  borderLeft: '4px solid #0284c7',
                  padding: '14px 18px',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: '20px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0369a1',
                  lineHeight: 1.6
                }}>
                  {readingArticle.summary}
                </div>
              )}

              {/* Nội dung chi tiết */}
              <div style={{ fontSize: '15.5px', color: '#334155', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                {readingArticle.content || readingArticle.summary}
              </div>

              {/* Hộp mẹo thi đấu thể thao */}
              <div style={{
                marginTop: '24px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fa-solid fa-circle-info" style={{ color: '#0284c7', fontSize: '20px' }}></i>
                <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5 }}>
                  <strong>Lưu ý từ Ban Huấn Luyện:</strong> Khởi động kỹ và sử dụng đúng loại giày chuyên dụng cho thảm thi đấu Taraflex để đạt phong độ cao nhất và phòng ngừa chấn thương.
                </div>
              </div>

              {/* Bottom Buttons */}
              <div style={{
                marginTop: '28px',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setReadingArticle(null);
                    onNavigate && onNavigate('booking');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 24px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <i className="fa-solid fa-calendar-check"></i> Đặt Sân Ngay Bây Giờ
                </button>
                <button
                  type="button"
                  onClick={() => setReadingArticle(null)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    padding: '11px 20px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Đóng Bài Viết
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
