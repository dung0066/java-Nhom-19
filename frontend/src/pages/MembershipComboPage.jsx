import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchMembershipPackages, buyMembershipPackage } from '../services/api';

export const COMBO_PACKAGES = [
  {
    id: 'COMBO_SINGLE_OFFPEAK',
    code: 'SINGLE_OFFPEAK',
    name: 'Combo Giờ Vắng Đơn (Sáng / Trưa)',
    badge: 'TIẾT KIỆM 35%',
    badgeColor: '#10b981',
    hours: 'Ca từ 05:00 - 16:30 hoặc sau 22:00',
    priceEstimate: 'Từ 65.000 đ/giờ',
    discount: 'Giảm 35% tiền sân',
    description: 'Thích hợp cho cá nhân hoặc bạn bè tập luyện thể lực, rèn cầu vào ban ngày với không gian thoáng đãng.',
    includes: [
      'Giảm 35% trực tiếp vào tiền thuê sân',
      'Tặng 02 chai nước khoáng LaVie 500ml ướp lạnh',
      'Tặng 02 khăn lạnh kháng khuẩn thể thao',
      'Miễn phí gửi xe máy và sử dụng phòng tắm nóng lạnh'
    ],
    actionType: 'BOOK_NOW',
    icon: 'fa-solid fa-sun'
  },
  {
    id: 'COMBO_DOUBLE_OFFPEAK',
    code: 'DOUBLE_OFFPEAK',
    name: 'Combo Đôi / Nhóm Giờ Vắng (2 Giờ)',
    badge: 'TIẾT KIỆM 40%',
    badgeColor: '#0284c7',
    hours: '2 Giờ chơi ca ngày (Trước 16:30)',
    priceEstimate: 'Từ 120.000 đ / 2 giờ',
    discount: 'Giảm 40% tiền sân',
    description: 'Combo hoàn hảo cho nhóm 4 người đánh đôi giao lưu, nghỉ trưa thể thao hoặc rèn luyện kỹ thuật.',
    includes: [
      'Giảm 40% trực tiếp vào tiền thuê sân',
      'Tặng 04 chai nước khoáng LaVie ướp lạnh',
      'Tặng 04 khăn lạnh thể thao cao cấp',
      'Mượn bảng điểm lật tay thi đấu miễn phí'
    ],
    actionType: 'BOOK_NOW',
    icon: 'fa-solid fa-users'
  },
  {
    id: 'COMBO_MONTHLY_FIXED',
    code: 'MONTHLY_FIXED',
    name: 'Combo Cố Định Tháng (Khung Giờ Vàng)',
    badge: 'GIỮ CA 100%',
    badgeColor: '#ea580c',
    hours: '17:00 - 22:00 (Thứ 2 đến Chủ Nhật)',
    priceEstimate: 'Theo lịch cố định tháng',
    discount: 'Ưu tiên giữ sân độc quyền',
    description: 'Dành cho các câu lạc bộ, công ty hoặc nhóm bạn chơi định kỳ 2-3 buổi/tuần mà không lo hết sân giờ cao điểm.',
    includes: [
      'Khóa cố định sân theo tuần/tháng, không bị hủy ca',
      'Tặng 01 ống cầu lông Hải Yến / Ba Sao chính hãng',
      'Hỗ trợ xuất hóa đơn VAT đầy đủ cho doanh nghiệp',
      'Chiết khấu 10% khi căng vợt và mua phụ kiện tại shop'
    ],
    actionType: 'CONTACT',
    icon: 'fa-solid fa-calendar-check'
  },
  {
    id: 'COMBO_STUDENT_PASS',
    code: 'STUDENT_PASS',
    name: 'Combo Học Sinh - Sinh Viên Thần Tốc',
    badge: 'HSSV GIẢM SÂU',
    badgeColor: '#8b5cf6',
    hours: '06:00 - 17:00 Hàng ngày',
    priceEstimate: 'Chỉ 60.000 đ/giờ',
    discount: 'Giá ưu đãi đặc biệt',
    description: 'Chương trình trợ giá tiếp sức học đường, thỏa đam mê cầu lông cho các bạn học sinh, sinh viên các trường ĐH.',
    includes: [
      'Áp dụng khi xuất trình thẻ HSSV hợp lệ',
      'Miễn phí mượn 2 vợt tập luyện tại sân',
      'Tặng nước bù khoáng điện giải Pocari / Revive',
      'Miễn phí wifi tốc độ cao và chỗ sạc điện thoại'
    ],
    actionType: 'BOOK_NOW',
    icon: 'fa-solid fa-graduation-cap'
  }
];

export default function MembershipComboPage({ onNavigate }) {
  const { currentUser, isLoggedIn, openAuthModal, refreshUser } = useAuth();
  const { isVietnamese } = useLanguage();

  const [activeTab, setActiveTab] = useState('memberships'); // 'memberships' | 'combos'
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buy VIP state
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('VIETQR');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const list = await fetchMembershipPackages();
        setPackages(list || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleOpenBuy = (pkg) => {
    setSelectedPkg(pkg);
    if (!isLoggedIn) {
      openAuthModal('login');
      return;
    }
    setSuccessReceipt(null);
    setIsBuyModalOpen(true);
  };

  const handleConfirmBuy = async () => {
    if (!currentUser?.id || !selectedPkg?.id) return;
    setIsSubmitting(true);
    try {
      const res = await buyMembershipPackage(currentUser.id, selectedPkg.id, paymentMethod, notes);
      setSuccessReceipt(res);
      await refreshUser();
    } catch (err) {
      alert(err.message || 'Lỗi khi kích hoạt gói hội viên!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const vietQrUrl = selectedPkg && currentUser
    ? `https://api.vietqr.io/image/970436-102874136458-qr_only.jpg?amount=${selectedPkg.price}&addInfo=${encodeURIComponent(`VIP_${currentUser.username}_${selectedPkg.code}`)}`
    : '';

  return (
    <div className="ways-membership-combo-page" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '60px' }}>
      {/* 1. HERO BANNER */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0369a1 100%)',
          color: '#ffffff',
          padding: '48px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              display: 'inline-block',
              marginBottom: '14px'
            }}
          >
            CHƯƠNG TRÌNH ĐẶC QUYỀN THỂ THAO 2026
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            HỘI VIÊN THÂN THIẾT VIP & COMBO GIỜ VÀNG
          </h1>
          <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 auto 24px', maxWidth: '680px' }}>
            Tham gia gói thành viên để nhận ngay chiết khấu trực tiếp <strong>đến 10% mọi ca sân</strong>, miễn phí gửi đồ cá nhân, sấy khử khuẩn giày tia UV và các combo giờ vắng siêu tiết kiệm.
          </p>

          {/* Nav pills */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.12)',
              padding: '5px',
              borderRadius: '14px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('memberships')}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'memberships' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeTab === 'memberships' ? '0 4px 12px rgba(245, 158, 11, 0.4)' : 'none'
              }}
            >
              <i className="fa-solid fa-crown"></i>
              <span>Gói Hội Viên VIP ({packages.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('combos')}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'combos' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeTab === 'combos' ? '0 4px 12px rgba(2, 132, 199, 0.4)' : 'none'
              }}
            >
              <i className="fa-solid fa-bolt"></i>
              <span>Combo Giờ Vắng & Tháng ({COMBO_PACKAGES.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ maxWidth: '1200px', margin: '36px auto 0', padding: '0 20px' }}>
        {/* TAB 1: GÓI HỘI VIÊN VIP */}
        {activeTab === 'memberships' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                Bảng Quyền Lợi & Giá Gói Hội Viên Ways Station
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Chiết khấu tự động trừ trực tiếp trên hệ thống đặt sân ngay sau khi kích hoạt
              </p>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px' }}></i>
                <p style={{ marginTop: '10px' }}>Đang nạp danh sách gói VIP từ hệ thống...</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '24px'
                }}
              >
                {packages.map((pkg) => {
                  const isGold = pkg.code === 'GOLD';
                  return (
                    <div
                      key={pkg.id}
                      style={{
                        background: isGold ? '#fffdf5' : '#ffffff',
                        border: isGold ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                        borderRadius: '20px',
                        padding: '28px 24px',
                        boxShadow: isGold ? '0 12px 30px rgba(245, 158, 11, 0.15)' : '0 4px 16px rgba(0, 0, 0, 0.04)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s'
                      }}
                    >
                      {isGold && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-12px',
                            right: '20px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                          }}
                        >
                          GÓI PHỔ BIẾN NHẤT
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: pkg.badgeColor ? `${pkg.badgeColor}15` : '#fef3c7',
                            color: pkg.badgeColor || '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                          }}
                        >
                          <i className={pkg.icon || 'fa-solid fa-crown'}></i>
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                            {pkg.name}
                          </h3>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Hạn dùng: {pkg.durationDays} ngày</span>
                        </div>
                      </div>

                      <div style={{ margin: '14px 0 16px' }}>
                        <span style={{ fontSize: '26px', fontWeight: 900, color: '#f59e0b' }}>
                          {(pkg.price || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <div
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          color: '#15803d',
                          fontWeight: 800,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '16px'
                        }}
                      >
                        <i className="fa-solid fa-tags"></i>
                        <span>Giảm {pkg.discountPercent}% trực tiếp tiền giờ chơi</span>
                      </div>

                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 18px', flex: 1 }}>
                        {pkg.description}
                      </p>

                      {pkg.perks && (
                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '14px', marginBottom: '20px', fontSize: '12.5px', color: '#334155' }}>
                          <strong style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#64748b' }}>
                            ĐẶC QUYỀN ĐI KÈM:
                          </strong>
                          {pkg.perks.split(';').map((perk, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                              <i className="fa-solid fa-check" style={{ color: '#10b981', marginTop: '3px', fontSize: '11px' }}></i>
                              <span>{perk.trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenBuy(pkg)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: 'none',
                          background: isGold
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '13.5px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <i className="fa-solid fa-crown"></i>
                        <span>Đăng Ký Gói VIP Này</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMBO GIỜ VẮNG & THÁNG */}
        {activeTab === 'combos' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                Danh Sách Gói Combo Giờ Vắng & Khung Giờ Cố Định
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Tận hưởng mức giá ưu đãi cực lớn khi chơi vào khung giờ ngày hoặc đặt lịch cố định theo tháng
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}
            >
              {COMBO_PACKAGES.map((combo) => (
                <div
                  key={combo.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '28px 24px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: `${combo.badgeColor}15`,
                          color: combo.badgeColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}
                      >
                        <i className={combo.icon}></i>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#0f172a' }}>
                          {combo.name}
                        </h3>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{combo.hours}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      alignSelf: 'flex-start',
                      background: `${combo.badgeColor}15`,
                      color: combo.badgeColor,
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}
                  >
                    {combo.badge}
                  </span>

                  <div style={{ margin: '8px 0 14px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
                      {combo.priceEstimate}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px', flex: 1 }}>
                    {combo.description}
                  </p>

                  <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '14px', marginBottom: '20px', fontSize: '12.5px', color: '#334155' }}>
                    <strong style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#64748b' }}>
                      CHI TIẾT ƯU ĐÃI:
                    </strong>
                    {combo.includes.map((inc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <i className="fa-solid fa-check" style={{ color: '#10b981', marginTop: '3px', fontSize: '11px' }}></i>
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>

                  {combo.actionType === 'BOOK_NOW' ? (
                    <button
                      type="button"
                      onClick={() => onNavigate('booking')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                      }}
                    >
                      <i className="fa-solid fa-calendar-check"></i>
                      <span>Đặt Sân Với Ưu Đãi Này</span>
                    </button>
                  ) : (
                    <a
                      href="tel:0889555559"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                        boxSizing: 'border-box'
                      }}
                    >
                      <i className="fa-solid fa-phone"></i>
                      <span>Hotline Giữ Sân: 0889 555 559</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* CHECKOUT MODAL CHO GÓI VIP */}
      {isBuyModalOpen && selectedPkg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBuyModalOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '620px',
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.35)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                <i className="fa-solid fa-crown" style={{ marginRight: '8px' }}></i>
                Kích Hoạt Gói {selectedPkg.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px' }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {!successReceipt ? (
                <>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Tài khoản:</span>
                      <strong>{currentUser.username} ({currentUser.fullName})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Chiết khấu giờ chơi:</span>
                      <strong style={{ color: '#10b981' }}>Giảm {selectedPkg.discountPercent}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                      <span style={{ fontWeight: 700 }}>Tổng thanh toán:</span>
                      <span style={{ fontSize: '20px', fontWeight: 900, color: '#f59e0b' }}>
                        {(selectedPkg.price || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Chọn hình thức thanh toán:
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', border: paymentMethod === 'VIETQR' ? '2px solid #0284c7' : '1px solid #cbd5e1', background: paymentMethod === 'VIETQR' ? '#f0f9ff' : '#fff', cursor: 'pointer', fontSize: '13px' }}>
                        <input type="radio" name="paymethod" checked={paymentMethod === 'VIETQR'} onChange={() => setPaymentMethod('VIETQR')} />
                        <span style={{ fontWeight: 700, color: '#0284c7' }}>🏦 Chuyển khoản VietQR (Khớp lệnh tức thì)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', border: paymentMethod === 'WALLET' ? '2px solid #0284c7' : '1px solid #cbd5e1', background: paymentMethod === 'WALLET' ? '#f0f9ff' : '#fff', cursor: 'pointer', fontSize: '13px' }}>
                        <input type="radio" name="paymethod" checked={paymentMethod === 'WALLET'} onChange={() => setPaymentMethod('WALLET')} />
                        <span style={{ fontWeight: 700, color: '#059669' }}>💳 Ví Ways Station (Dư: {(currentUser.walletBalance || 0).toLocaleString('vi-VN')} đ)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', border: paymentMethod === 'CASH' ? '2px solid #0284c7' : '1px solid #cbd5e1', background: paymentMethod === 'CASH' ? '#f0f9ff' : '#fff', cursor: 'pointer', fontSize: '13px' }}>
                        <input type="radio" name="paymethod" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} />
                        <span style={{ fontWeight: 700, color: '#475569' }}>💵 Thanh toán tiền mặt tại quầy lễ tân</span>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'VIETQR' && (
                    <div style={{ textAlign: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                      <img
                        src={vietQrUrl}
                        alt="VietQR"
                        style={{ width: '180px', height: '180px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      />
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                        VietinBank • STK: <strong>102874136458</strong> • Nội dung: <strong>VIP_{currentUser.username}_{selectedPkg.code}</strong>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setIsBuyModalOpen(false)}
                      style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmBuy}
                      style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', fontWeight: 800, fontSize: '13.5px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                      {isSubmitting ? 'Đang kích hoạt...' : 'Xác Nhận Kích Hoạt VIP'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 14px' }}>
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    Kích Hoạt VIP Thành Công!
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#64748b', margin: '8px 0 20px' }}>
                    {successReceipt?.message || 'Chúc mừng bạn đã trở thành hội viên VIP của Ways Station Badminton.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBuyModalOpen(false);
                      onNavigate('booking');
                    }}
                    style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', fontWeight: 800, fontSize: '13.5px', cursor: 'pointer' }}
                  >
                    Đi Đặt Sân Ngay Với Ưu Đãi VIP
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
