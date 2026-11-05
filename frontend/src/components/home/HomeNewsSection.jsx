import React, { useState, useEffect } from 'react';
import { fetchArticles } from '../../services/api';

/**
 * Khối Tin Tức & Sự Kiện Cầu Lông (Nằm ngay trên Footer)
 * Dữ liệu thật kết nối SQL Database (/api/articles), đồng bộ tức thì khi Admin chỉnh sửa!
 */
export default function HomeNewsSection({ onNavigate }) {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      try {
        const data = await fetchArticles();
        if (data && data.length > 0) {
          setArticles(data.filter(a => a.published !== false));
        } else {
          // Lấy từ dữ liệu admin đã lưu
          const saved = localStorage.getItem('d2_admin_articles');
          if (saved) {
            setArticles(JSON.parse(saved).filter(a => a.published !== false));
          }
        }
      } catch (_) {
        const saved = localStorage.getItem('d2_admin_articles');
        if (saved) {
          setArticles(JSON.parse(saved).filter(a => a.published !== false));
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, []);

  return (
    <section className="d2-home-news-section" style={{ backgroundColor: '#ffffff', padding: '60px 0 50px', borderTop: '1px solid #f1f5f9' }}>
      <div className="d2-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header khối tin tức */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: '#0284c7', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px'
            }}>
              <i className="fa-solid fa-newspaper"></i> BẢN TIN & SỰ KIỆN
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Tin Tức Cầu Lông Mới Nhất
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('news')}
            style={{
              background: 'transparent', border: '1px solid #cbd5e1', color: '#0284c7',
              padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
            }}
          >
            <span>Xem Tất Cả Tin</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        {/* Grid Cards tin tức từ SQL Database */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {isLoading && articles.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin"></i> Đang tải tin tức từ máy chủ...
            </div>
          ) : (
            articles.slice(0, 4).map((item) => (
              <article
                key={item.id}
                onClick={() => onNavigate && onNavigate('news')}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.05)';
                }}
              >
                {/* Hình ảnh banner bài viết */}
                <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                  <img
                    src={item.image || '/news/news1.png'}
                    alt={item.title}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = `/banners/banner${(item.id % 4) + 1}.jpg`;
                    }}
                  />
                </div>

                {/* Nội dung text card */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{
                    fontSize: '15px', fontWeight: 800, color: '#0f172a',
                    lineHeight: '1.45', margin: '0 0 10px 0',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {item.title}
                  </h3>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', color: '#94a3b8', marginBottom: '10px'
                  }}>
                    <i className="fa-regular fa-calendar-days" style={{ color: '#0284c7' }}></i>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '22 Tháng 07'}</span>
                    <span style={{ margin: '0 4px' }}>•</span>
                    <span style={{ color: '#0284c7', fontWeight: 600 }}>{item.categoryLabel || item.category || 'Tin tức'}</span>
                  </div>

                  <p style={{
                    fontSize: '13px', color: '#64748b', lineHeight: '1.5',
                    margin: 0, flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {item.summary || item.content}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
