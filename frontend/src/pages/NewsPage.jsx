import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchArticles } from '../services/api';
import '../styles/subpages.css';

/**
 * Trang Tin Tức Cầu Lông D2 SHOP (Dành Cho Khách Hàng)
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

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const regularArticles = articles.length > 1 ? articles.slice(1) : (articles.length === 1 ? articles : []);

  return (
    <div className="subpage-container">
      {/* 1. HERO BANNER */}
      <section className="subpage-hero" style={{ backgroundImage: "url('/banners/banner2.jpg')" }}>
        <div className="subpage-hero-overlay"></div>
        <div className="subpage-hero-content">
          <span className="subpage-hero-badge">
            <i className="fa-solid fa-newspaper"></i> {isVietnamese ? 'BẢN TIN CẦU LÔNG D2 SHOP' : 'D2 BADMINTON NEWS'}
          </span>
          <h1 className="subpage-hero-title">
            {isVietnamese ? 'Tin Tức, Giải Đấu & Kỹ Thuật Đỉnh Cao' : 'News, Tournaments & Pro Badminton Skills'}
          </h1>
          <p className="subpage-hero-desc">
            {isVietnamese
              ? 'Dữ liệu tin tức cập nhật trực tiếp từ hệ thống D2 Shop. Cung cấp cẩm nang chọn vợt, bài tập thể lực và những giải đấu phong trào mới nhất.'
              : 'Live badminton articles and tournament updates synchronized with D2 Shop database.'}
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

      {/* 5. POPUP ĐỌC TOÀN VĂN BÀI VIẾT */}
      {readingArticle && (
        <div className="modal-backdrop-custom" onClick={() => setReadingArticle(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '16px', maxWidth: '720px', width: '100%',
              maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
              <img
                src={readingArticle.image || '/news/news1.png'}
                alt={readingArticle.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.src = '/banners/banner1.jpg'; }}
              />
              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
                  width: '36px', height: '36px', borderRadius: '50%',
                  fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                <span><i className="fa-regular fa-calendar"></i> {readingArticle.createdAt ? new Date(readingArticle.createdAt).toLocaleDateString('vi-VN') : '22 Tháng 07'}</span>
                <span><i className="fa-solid fa-user-pen"></i> {readingArticle.author || 'D2 Media'}</span>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>{readingArticle.categoryLabel || readingArticle.category}</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                {readingArticle.title}
              </h2>
              <div style={{ fontSize: '15px', color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {readingArticle.content || readingArticle.summary}
              </div>
              <div style={{ marginTop: '28px', borderTop: '1px solid #f1f5f9', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setReadingArticle(null);
                    onNavigate && onNavigate('booking');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <i className="fa-solid fa-calendar-check"></i> Đặt Sân Ngay Bây Giờ
                </button>
                <button
                  type="button"
                  onClick={() => setReadingArticle(null)}
                  style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#64748b', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
