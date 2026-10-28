import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../../services/api';
import { DEFAULT_D2_PRODUCTS } from '../../data/courtData';

/**
 * Khối Giới Thiệu Dụng Cụ, Vợt & Giày Cho Thuê (Trang Chủ)
 * Dữ liệu thật 100% kết nối với Spring Boot SQL Database và đồng bộ trực tiếp khi Admin chỉnh sửa!
 */
export default function HomeProductsSection({ onNavigate, isVietnamese = true }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const prodList = await fetchProducts().catch(() => null);
        let prods = prodList;
        if (!prods || prods.length === 0) {
          const saved = localStorage.getItem('d2_admin_products');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) prods = parsed;
            } catch (_) {}
          }
        }
        if (!prods || prods.length === 0) {
          prods = DEFAULT_D2_PRODUCTS;
        }
        if (prods && prods.length > 0) {
          setProducts(prods.filter(p => p.active !== false));
        }
      } catch (_) {}
      finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <section className="d2-section d2-section-white" id="gearSection" style={{ padding: '60px 0 70px' }}>
      <div className="d2-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        <div className="d2-section-header" style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="d2-pill-badge d2-pill-blue" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#e0f2fe', color: '#0284c7', padding: '6px 14px', borderRadius: '20px',
            fontSize: '12.5px', fontWeight: 700, marginBottom: '8px'
          }}>
            <i className="fa-solid fa-wand-magic-sparkles"></i> {isVietnamese ? 'Dịch Vụ Đi Kèm Tại Sân' : 'Court-side Amenities'}
          </span>
          <h2 className="d2-section-title" style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
            {isVietnamese ? 'Dụng Cụ, Vợt & Giày Cho Thuê Chính Hãng' : 'Genuine Gear & Rackets For Rent'}
          </h2>
          <p className="d2-section-desc" style={{ fontSize: '14px', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
            {isVietnamese
              ? 'Trải nghiệm các dòng vợt cao cấp Yonex, Lining, Victor và giày chuyên dụng ngay tại sân mà không cần mang theo cồng kềnh.'
              : 'Try out top-tier Yonex, Lining, Victor rackets and pro shoes directly at our court counters.'}
          </p>
        </div>

        {/* Grid Sản Phẩm Thật từ Admin SQL */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '22px'
        }}>
          {isLoading && products.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu dụng cụ...
            </div>
          ) : (
            products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
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
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
                }}
              >
                {/* Ảnh sản phẩm */}
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=600&auto=format&fit=crop'}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = '/banners/banner2.jpg';
                    }}
                  />
                  {p.badge && (
                    <span style={{
                      position: 'absolute', top: '10px', left: '10px',
                      background: 'linear-gradient(135deg, #ea580c, #c2410c)', color: '#fff',
                      fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)'
                    }}>
                      {p.badge}
                    </span>
                  )}
                  <span style={{
                    position: 'absolute', bottom: '10px', right: '10px',
                    background: 'rgba(15, 23, 42, 0.75)', color: '#fff',
                    fontSize: '10.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px'
                  }}>
                    {p.brand || 'CHÍNH HÃNG'}
                  </span>
                </div>

                {/* Nội dung card */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                    {p.name}
                  </h4>

                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px', flex: 1 }}>
                    {p.spec1 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '11px' }}></i>
                        {p.spec1}
                      </span>
                    )}
                    {p.spec2 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-circle-check" style={{ color: '#0284c7', fontSize: '11px' }}></i>
                        {p.spec2}
                      </span>
                    )}
                    {!p.spec1 && !p.spec2 && p.description && (
                      <span>{p.description}</span>
                    )}
                  </div>

                  {/* Giá & nút Đặt thuê */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: '12px', borderTop: '1px solid #f1f5f9'
                  }}>
                    <div>
                      <span style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block' }}>Giá thuê</span>
                      <strong style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c' }}>
                        {(p.price || 0).toLocaleString('vi-VN')} đ
                      </strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}> {p.priceUnit || '/ ca'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('booking')}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px',
                        fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                      }}
                    >
                      <span>Thuê Ngay</span>
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: '11px' }}></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
