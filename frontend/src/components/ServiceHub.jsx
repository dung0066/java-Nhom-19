import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Sparkles, Plus, Minus, Check, Layers, ShieldCheck, Droplets, Sparkle, Lock } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ServiceHub({ categories, addonQuantities, onUpdateQuantity }) {
  const hubRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all');

  useGSAP(() => {
    // ScrollTrigger entrance for service cards
    gsap.from('.service-item-card', {
      scrollTrigger: {
        trigger: hubRef.current,
        start: 'top 85%',
        once: true
      },
      opacity: 0,
      y: 15,
      duration: 0.4,
      stagger: 0.04,
      ease: 'power2.out'
    });
  }, { scope: hubRef });

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const displayedCategories = activeTab === 'all'
    ? categories
    : categories.filter((c) => c.id === activeTab);

  return (
    <section className="service-hub-section" id="services-section" ref={hubRef}>
      <div className="section-header-row">
        <div>
          <div className="section-pill">
            <Sparkles size={13} className="text-emerald" />
            <span>Tiện Ích & Dịch Vụ Đi Kèm</span>
          </div>
          <h2 className="section-main-title">Dịch Vụ Chăm Sóc Vợt, Giày & Đồ Uống</h2>
          <p className="section-desc">
            Vệ sinh sấy giày tiệt trùng UV, ký gửi tủ locker bảo mật, quấn cán căng vợt và quầy nước khăn ướp lạnh phục vụ tận sân.
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className="category-filter-nav">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`cat-nav-btn ${activeTab === 'all' ? 'active' : ''}`}
          >
            Tất cả dịch vụ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('refreshments')}
            className={`cat-nav-btn ${activeTab === 'refreshments' ? 'active' : ''}`}
          >
            Nước & Khăn lạnh
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('care_locker')}
            className={`cat-nav-btn ${activeTab === 'care_locker' ? 'active' : ''}`}
          >
            Vệ sinh giày, Vợt & Locker
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rental_equipment')}
            className={`cat-nav-btn ${activeTab === 'rental_equipment' ? 'active' : ''}`}
          >
            Thuê vợt & Cầu
          </button>
        </div>
      </div>

      {/* Render by Category Groups */}
      <div className="categories-list-wrap">
        {displayedCategories.map((cat) => (
          <div key={cat.id} className="category-group-block">
            <div className="category-block-header">
              <div className="cat-title-wrap">
                <h3 className="cat-title">{cat.title}</h3>
                <span className="cat-badge">{cat.badge}</span>
              </div>
              <p className="cat-subtitle">{cat.subtitle}</p>
            </div>

            <div className="services-cards-grid">
              {cat.items.map((item) => {
                const qty = addonQuantities[item.id] || 0;
                return (
                  <div key={item.id} className={`service-item-card ${qty > 0 ? 'selected' : ''}`}>
                    <div className="service-card-top">
                      <span className="service-category-tag">{item.category}</span>
                      <span className="service-price">
                        {formatVND(item.price)} <small>/ {item.unit}</small>
                      </span>
                    </div>

                    <h4 className="service-name">{item.name}</h4>
                    <p className="service-description">{item.desc}</p>

                    <div className="service-action-row">
                      <div className="service-status-text">
                        {qty > 0 ? (
                          <span className="text-emerald selected-status">
                            <Check size={13} strokeWidth={3} /> Đã thêm {qty} {item.unit}
                          </span>
                        ) : (
                          <span>Sẵn sàng phục vụ</span>
                        )}
                      </div>

                      <div className="service-counter-controls">
                        <button
                          type="button"
                          disabled={qty === 0}
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="btn-counter"
                          title="Giảm bớt"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="counter-display">{qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="btn-counter add"
                          title="Thêm dịch vụ"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
