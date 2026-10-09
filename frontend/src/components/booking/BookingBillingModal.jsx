import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../../context/LanguageContext';

export const REFRESHMENT_ITEMS = [
  { id: 'water_lavie', name: 'Nước khoáng LaVie 500ml', price: 10000, icon: 'fa-bottle-water', unit: 'chai' },
  { id: 'water_pocari', name: 'Nước điện giải Pocari Sweat 500ml', price: 20000, icon: 'fa-wine-bottle', unit: 'chai' },
  { id: 'water_revive', name: 'Nước bù khoáng Revive chanh muối', price: 18000, icon: 'fa-bolt-lightning', unit: 'chai' },
  { id: 'water_redbull', name: 'Nước tăng lực Red Bull Thái', price: 22000, icon: 'fa-fire-flame-curved', unit: 'lon' },
  { id: 'towel_cold', name: 'Khăn lạnh thể thao kháng khuẩn', price: 5000, icon: 'fa-snowflake', unit: 'cái' },
  { id: 'towel_cotton', name: 'Khăn bông cotton thấm hút thi đấu', price: 25000, icon: 'fa-rug', unit: 'cái' },
  { id: 'rent_racquet', name: 'Thuê vợt thi đấu cao cấp (Yonex/Lining)', price: 35000, icon: 'fa-wand-magic-sparkles', unit: 'cây/ca' },
  { id: 'rent_shoes', name: 'Thuê giày cầu lông khử khuẩn tia UV', price: 30000, icon: 'fa-shoe-prints', unit: 'đôi/ca' }
];

export const STRING_TYPES = [
  { id: 'bg65', name: 'Yonex BG65 (Độ bền cao, phổ biến nhất)', price: 140000, gauge: '0.70mm', feel: 'Medium' },
  { id: 'bg65ti', name: 'Yonex BG65 Titanium (Tiếng nổ đanh, trợ lực)', price: 160000, gauge: '0.70mm', feel: 'Hard' },
  { id: 'bg80', name: 'Yonex BG80 (Độ nảy khủng, smash uy lực)', price: 190000, gauge: '0.68mm', feel: 'Hard' },
  { id: 'bg80power', name: 'Yonex BG80 Power (Tấn công tốc độ cao)', price: 200000, gauge: '0.68mm', feel: 'Hard' },
  { id: 'exbolt63', name: 'Yonex Exbolt 63 (Siêu nảy, âm thanh vang dội)', price: 210000, gauge: '0.63mm', feel: 'Medium' },
  { id: 'exbolt65', name: 'Yonex Exbolt 65 (Kiểm soát cầu & độ nảy tối tân)', price: 220000, gauge: '0.65mm', feel: 'Hard' },
  { id: 'lining_no1', name: 'Lining No.1 (Âm thanh nổ to, trợ lực tuyệt đối)', price: 160000, gauge: '0.65mm', feel: 'Medium' },
  { id: 'kizuna_z63x', name: 'Kizuna Z63X Nhật Bản (Dây cước bọc titan)', price: 195000, gauge: '0.63mm', feel: 'Medium' }
];

export const TENSION_LEVELS = [
  { kg: 9.5, lbs: 21.0, label: '9.5 kg (Mới chơi / Nữ)' },
  { kg: 10.0, lbs: 22.0, label: '10.0 kg (Phong trào cơ bản)' },
  { kg: 10.5, lbs: 23.0, label: '10.5 kg (Phong trào chuẩn)' },
  { kg: 11.0, lbs: 24.2, label: '11.0 kg (Bán chuyên nghiệp)' },
  { kg: 11.5, lbs: 25.3, label: '11.5 kg (Tay khỏe / Chuyên nghiệp)' },
  { kg: 12.0, lbs: 26.4, label: '12.0 kg (Vận động viên thi đấu)' },
  { kg: 12.5, lbs: 27.5, label: '12.5 kg (Căng tối đa)' }
];

export default function BookingBillingModal({
  isOpen,
  onClose,
  selectedSlots = [],
  date,
  branch,
  appliedCombo = null,
  onSubmitBooking
}) {
  const { t, isVietnamese } = useLanguage();
  const [step, setStep] = useState(1); // 1: Giờ sân -> 2: Dịch vụ -> 3: Căng vợt -> 4: Tính đơn
  const modalBoxRef = useRef(null);
  const stepContentRef = useRef(null);

  // Step 2: Dịch vụ đi kèm
  const [serviceQuantities, setServiceQuantities] = useState({
    water_lavie: appliedCombo === 'SINGLE_OFFPEAK' ? 2 : appliedCombo === 'DOUBLE_OFFPEAK' ? 4 : 0,
    water_pocari: 0,
    water_revive: 0,
    water_redbull: 0,
    towel_cold: appliedCombo === 'SINGLE_OFFPEAK' ? 2 : appliedCombo === 'DOUBLE_OFFPEAK' ? 4 : 0,
    towel_cotton: 0,
    rent_racquet: 0,
    rent_shoes: 0
  });

  // Step 3: Căng cước vợt
  const [hasStringing, setHasStringing] = useState(false);
  const [stringingOrders, setStringingOrders] = useState([
    {
      racquetName: 'Vợt 1',
      stringId: 'bg65ti',
      tensionKg: 10.5,
      knotType: '4 nút (Chuẩn thi đấu)',
      notes: ''
    }
  ]);

  // Step 4: Thông tin khách hàng & Thanh toán
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('VIETQR');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync combo pre-selections when combo changes
  useEffect(() => {
    if (appliedCombo === 'SINGLE_OFFPEAK') {
      setServiceQuantities((prev) => ({
        ...prev,
        water_lavie: Math.max(prev.water_lavie, 2),
        towel_cold: Math.max(prev.towel_cold, 2)
      }));
    } else if (appliedCombo === 'DOUBLE_OFFPEAK') {
      setServiceQuantities((prev) => ({
        ...prev,
        water_lavie: Math.max(prev.water_lavie, 4),
        towel_cold: Math.max(prev.towel_cold, 4)
      }));
    }
  }, [appliedCombo]);

  // Animate modal entrance
  useEffect(() => {
    if (isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.9, opacity: 0, y: -25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
      );
    }
  }, [isOpen]);

  // Animate step transitions
  useEffect(() => {
    if (stepContentRef.current) {
      gsap.fromTo(
        stepContentRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [step]);

  if (!isOpen) return null;

  // Calculators
  const courtPriceRaw = selectedSlots.reduce((sum, s) => sum + (s.slot?.price || 0), 0);
  const totalHours = selectedSlots.length;

  // Combo Discount
  let comboDiscount = 0;
  if (appliedCombo === 'SINGLE_OFFPEAK' && totalHours > 0) {
    comboDiscount = Math.round(courtPriceRaw * 0.35);
  } else if (appliedCombo === 'DOUBLE_OFFPEAK' && totalHours > 0) {
    comboDiscount = Math.round(courtPriceRaw * 0.4);
  }

  const finalCourtPrice = Math.max(0, courtPriceRaw - comboDiscount);

  // Refreshments Total
  const servicesTotal = Object.entries(serviceQuantities).reduce((sum, [id, qty]) => {
    const item = REFRESHMENT_ITEMS.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // Stringing Total
  const stringingTotal = hasStringing
    ? stringingOrders.reduce((sum, order) => {
        const str = STRING_TYPES.find((s) => s.id === order.stringId);
        return sum + (str ? str.price : 0);
      }, 0)
    : 0;

  // Grand Total
  const grandTotal = finalCourtPrice + servicesTotal + stringingTotal;

  // Quantity controllers for Step 2
  const handleUpdateQuantity = (id, delta) => {
    setServiceQuantities((prev) => {
      const current = prev[id] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  // Stringing controllers for Step 3
  const handleAddStringingRacquet = () => {
    setStringingOrders((prev) => [
      ...prev,
      {
        racquetName: `Vợt ${prev.length + 1}`,
        stringId: 'bg65ti',
        tensionKg: 10.5,
        knotType: '4 nút (Chuẩn thi đấu)',
        notes: ''
      }
    ]);
  };

  const handleRemoveStringingRacquet = (idx) => {
    setStringingOrders((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateStringOrder = (idx, field, value) => {
    setStringingOrders((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // Step 4 Submit Final Order
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Vui lòng nhập Họ tên và Số điện thoại để hoàn tất đóng đơn!');
      return;
    }

    setIsSubmitting(true);
    try {
      const billingPayload = {
        branchCode: branch,
        bookingDate: date,
        customerName,
        customerPhone,
        customerEmail,
        paymentType: paymentMethod,
        notes: orderNotes,
        appliedCombo,
        slots: selectedSlots,
        totalHours,
        courtPriceRaw,
        comboDiscount,
        finalCourtPrice,
        services: Object.entries(serviceQuantities)
          .filter(([_, qty]) => qty > 0)
          .map(([id, qty]) => {
            const item = REFRESHMENT_ITEMS.find((i) => i.id === id);
            return { id, name: item?.name, qty, price: item?.price, total: (item?.price || 0) * qty };
          }),
        servicesTotal,
        hasStringing,
        stringingOrders: hasStringing ? stringingOrders : [],
        stringingTotal,
        totalPrice: grandTotal
      };

      await onSubmitBooking(billingPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="billing-modal-overlay show">
      <div className="billing-modal-card" ref={modalBoxRef}>
        {/* MODAL HEADER WITH WIZARD STEPPER */}
        <div className="billing-modal-header">
          <div className="billing-title-meta">
            <span className="step-tag">{isVietnamese ? 'QUY TRÌNH ĐẶT SÂN & TÍNH ĐƠN TRỌN GÓI' : 'FULL-SERVICE BOOKING & BILLING WIZARD'}</span>
            <h2>
              <i className="fa-solid fa-file-invoice-dollar"></i> {isVietnamese ? 'Hệ Thống Đặt Sân & Dịch Vụ Ways Station' : 'Ways Station Booking & Service Portal'}
            </h2>
          </div>
          <button type="button" className="billing-close-btn" onClick={onClose} title={t.wizard.btnClose}>
            &times;
          </button>
        </div>

        {/* 4-STEP PROGRESS INDICATOR */}
        <div className="billing-stepper-bar">
          <div
            className={`stepper-step ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}
            onClick={() => setStep(1)}
          >
            <div className="step-circle">1</div>
            <div className="step-text">
              <span className="step-num">{isVietnamese ? 'Bước 1' : 'Step 1'}</span>
              <strong className="step-name">{isVietnamese ? 'Giờ Đặt Sân' : 'Court & Hours'}</strong>
            </div>
          </div>
          <div className="step-arrow"><i className="fa-solid fa-chevron-right"></i></div>

          <div
            className={`stepper-step ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}
            onClick={() => setStep(2)}
          >
            <div className="step-circle">2</div>
            <div className="step-text">
              <span className="step-num">{isVietnamese ? 'Bước 2' : 'Step 2'}</span>
              <strong className="step-name">{isVietnamese ? 'Nước & Khăn' : 'Drinks & Towels'}</strong>
            </div>
          </div>
          <div className="step-arrow"><i className="fa-solid fa-chevron-right"></i></div>

          <div
            className={`stepper-step ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}
            onClick={() => setStep(3)}
          >
            <div className="step-circle">3</div>
            <div className="step-text">
              <span className="step-num">{isVietnamese ? 'Bước 3' : 'Step 3'}</span>
              <strong className="step-name">{isVietnamese ? 'Căng Dây Vợt' : 'Racket Stringing'}</strong>
            </div>
          </div>
          <div className="step-arrow"><i className="fa-solid fa-chevron-right"></i></div>

          <div
            className={`stepper-step ${step >= 4 ? 'active' : ''} ${step === 4 ? 'current' : ''}`}
            onClick={() => setStep(4)}
          >
            <div className="step-circle">4</div>
            <div className="step-text">
              <span className="step-num">{isVietnamese ? 'Bước 4' : 'Step 4'}</span>
              <strong className="step-name">{isVietnamese ? 'Tính & Đóng Đơn' : 'Bill & Checkout'}</strong>
            </div>
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="billing-step-body" ref={stepContentRef}>
          {/* ================= STEP 1: XEM LẠI GIỜ SÂN ================= */}
          {step === 1 && (
            <div className="step-1-content">
              <div className="step-section-banner">
                <i className="fa-solid fa-calendar-check banner-icon"></i>
                <div>
                  <h4>Kiểm Tra Lịch Sân Đã Chọn</h4>
                  <p>Chi nhánh: <strong>{branch}</strong> • Ngày chơi: <strong>{date}</strong></p>
                </div>
              </div>

              {appliedCombo && (
                <div className="combo-applied-alert">
                  <i className="fa-solid fa-crown"></i>
                  <span>
                    Đang kích hoạt gói: <strong>{appliedCombo === 'SINGLE_OFFPEAK' ? 'Combo Sân Đơn Giờ Vắng (Giảm 35%)' : 'Combo Sân Đôi Giờ Vắng (Giảm 40%)'}</strong>. Đã bao gồm nước suối và khăn lạnh miễn phí ở bước tiếp theo!
                  </span>
                </div>
              )}

              <div className="slots-review-list">
                {selectedSlots.map((item, idx) => (
                  <div key={idx} className="slot-review-card">
                    <div className="court-badge">{item.court?.name}</div>
                    <div className="slot-time-info">
                      <span className="time-val">{item.slot?.displayLabel}</span>
                      <span className="court-spec">Thảm Enlio BWF • Đèn chống chói</span>
                    </div>
                    <div className="slot-price-info">
                      {(item.slot?.price || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                ))}
              </div>

              <div className="step-subtotal-bar">
                <span>Tổng thời gian sân: <strong>{totalHours} giờ</strong></span>
                <span>
                  Tiền giờ sân: <strong>{finalCourtPrice.toLocaleString('vi-VN')} đ</strong>
                  {comboDiscount > 0 && <small className="discount-tag"> (Đã giảm {comboDiscount.toLocaleString('vi-VN')}đ)</small>}
                </span>
              </div>
            </div>
          )}

          {/* ================= STEP 2: DỊCH VỤ ĐI KÈM ================= */}
          {step === 2 && (
            <div className="step-2-content">
              <div className="step-section-banner">
                <i className="fa-solid fa-bottle-water banner-icon"></i>
                <div>
                  <h4>Chọn Dịch Vụ Nước Giải Khát, Khăn Lạnh & Thuê Dụng Cụ</h4>
                  <p>Được nhân viên chuẩn bị sẵn sàng ngay tại sân trước khi bạn nhận ca chơi!</p>
                </div>
              </div>

              <div className="services-pick-grid">
                {REFRESHMENT_ITEMS.map((item) => {
                  const qty = serviceQuantities[item.id] || 0;
                  return (
                    <div key={item.id} className={`service-pick-card ${qty > 0 ? 'selected' : ''}`}>
                      <div className="service-icon-box">
                        <i className={`fa-solid ${item.icon}`}></i>
                      </div>
                      <div className="service-info">
                        <h5>{item.name}</h5>
                        <span className="service-price">
                          {item.price.toLocaleString('vi-VN')} đ <small>/{item.unit}</small>
                        </span>
                      </div>
                      <div className="quantity-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          disabled={qty === 0}
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="qty-number">{qty}</span>
                        <button
                          type="button"
                          className="qty-btn add"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="step-subtotal-bar">
                <span>Tiền dịch vụ đi kèm:</span>
                <strong>{servicesTotal.toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>
          )}

          {/* ================= STEP 3: DỊCH VỤ CĂNG CƯỚC VỢT ================= */}
          {step === 3 && (
            <div className="step-3-content">
              <div className="stringing-toggle-box">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={hasStringing}
                    onChange={(e) => setHasStringing(e.target.checked)}
                  />
                  <span className="slider round"></span>
                  <div className="switch-text">
                    <strong>Đăng Ký Căng Cước Vợt Cầu Lông Chuyên Nghiệp</strong>
                    <p>Máy điện tử Yonex Precision 9.0 • Đan 2/4 nút thi đấu • Lấy liền hoặc gửi quầy</p>
                  </div>
                </label>
              </div>

              {hasStringing ? (
                <div className="stringing-form-area">
                  {stringingOrders.map((order, idx) => {
                    const currentStr = STRING_TYPES.find((s) => s.id === order.stringId);
                    return (
                      <div key={idx} className="stringing-card-item">
                        <div className="stringing-card-head">
                          <h5>
                            <i className="fa-solid fa-wand-magic-sparkles"></i> {order.racquetName}
                          </h5>
                          {stringingOrders.length > 1 && (
                            <button
                              type="button"
                              className="btn-remove-racquet"
                              onClick={() => handleRemoveStringingRacquet(idx)}
                            >
                              <i className="fa-solid fa-trash-can"></i> Xóa
                            </button>
                          )}
                        </div>

                        <div className="stringing-fields-grid">
                          {/* 1. Chọn loại cước */}
                          <div className="field-group">
                            <label>Loại dây cước Yonex / Lining:</label>
                            <select
                              className="form-select-styled"
                              value={order.stringId}
                              onChange={(e) => handleUpdateStringOrder(idx, 'stringId', e.target.value)}
                            >
                              {STRING_TYPES.map((str) => (
                                <option key={str.id} value={str.id}>
                                  {str.name} — {str.price.toLocaleString('vi-VN')} đ ({str.gauge})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 2. Chọn mức căng (kg) */}
                          <div className="field-group">
                            <label>Mức căng cước (Tension):</label>
                            <select
                              className="form-select-styled"
                              value={order.tensionKg}
                              onChange={(e) => handleUpdateStringOrder(idx, 'tensionKg', parseFloat(e.target.value))}
                            >
                              {TENSION_LEVELS.map((t) => (
                                <option key={t.kg} value={t.kg}>
                                  {t.label} (~{t.lbs} lbs)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 3. Kiểu đan */}
                          <div className="field-group">
                            <label>Kiểu đan dây:</label>
                            <select
                              className="form-select-styled"
                              value={order.knotType}
                              onChange={(e) => handleUpdateStringOrder(idx, 'knotType', e.target.value)}
                            >
                              <option value="4 nút (Chuẩn thi đấu BWF)">4 nút (Chuẩn thi đấu BWF - Tối ưu lực smash)</option>
                              <option value="2 nút (Yonex Standard)">2 nút (Yonex Standard - Tròn đều mặt vợt)</option>
                            </select>
                          </div>

                          {/* 4. Ghi chú */}
                          <div className="field-group">
                            <label>Ghi chú cho kỹ thuật viên:</label>
                            <input
                              type="text"
                              className="form-input-styled"
                              placeholder="VD: Căng dây đỏ, kiểm tra gen vợt..."
                              value={order.notes}
                              onChange={(e) => handleUpdateStringOrder(idx, 'notes', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="string-item-cost">
                          Phí căng cước vợt này: <strong>{(currentStr?.price || 0).toLocaleString('vi-VN')} đ</strong>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    className="btn-add-more-stringing"
                    onClick={handleAddStringingRacquet}
                  >
                    <i className="fa-solid fa-plus-circle"></i> Thêm Vợt Khác Cần Căng Cước
                  </button>

                  <div className="step-subtotal-bar">
                    <span>Tổng tiền căng cước ({stringingOrders.length} vợt):</span>
                    <strong>{stringingTotal.toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>
              ) : (
                <div className="stringing-skip-notice">
                  <i className="fa-solid fa-info-circle"></i>
                  <span>Bạn chưa chọn dịch vụ căng cước. Nhấn <strong>Tiếp Tục</strong> để sang bước Tính Đơn & Thanh Toán.</span>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 4: TÍNH ĐƠN & DANH SÁCH ĐÓNG ĐƠN ================= */}
          {step === 4 && (
            <div className="step-4-content">
              <div className="invoice-review-box">
                <div className="invoice-header">
                  <div className="inv-brand">
                    <h4>WAYS STATION BADMINTON CLUB</h4>
                    <span>BẢNG KÊ CHI TIẾT TÍNH ĐƠN ĐẶT SÂN & DỊCH VỤ</span>
                  </div>
                  <div className="inv-date">
                    <span>Ngày tạo: {new Date().toLocaleDateString('vi-VN')}</span>
                    <span className="code-pill">MÃ DỰ KIẾN: WAY-{Date.now().toString().slice(-6)}</span>
                  </div>
                </div>

                {/* HẠNG MỤC 1: SÂN */}
                <div className="invoice-section">
                  <div className="inv-sec-title">
                    <i className="fa-solid fa-calendar-days"></i> 1. Tiền Thuê Sân Cầu Lông ({totalHours} giờ)
                  </div>
                  <table className="inv-table">
                    <thead>
                      <tr>
                        <th>Tên Sân</th>
                        <th>Khung Giờ</th>
                        <th className="text-right">Đơn Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSlots.map((s, idx) => (
                        <tr key={idx}>
                          <td><strong>{s.court?.name}</strong></td>
                          <td>{s.slot?.displayLabel}</td>
                          <td className="text-right">{(s.slot?.price || 0).toLocaleString('vi-VN')} đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {comboDiscount > 0 && (
                    <div className="inv-discount-row">
                      <span><i className="fa-solid fa-tag"></i> Chiết khấu ưu đãi combo giờ vắng:</span>
                      <strong className="text-success">- {comboDiscount.toLocaleString('vi-VN')} đ</strong>
                    </div>
                  )}
                </div>

                {/* HẠNG MỤC 2: DỊCH VỤ ĐI KÈM */}
                {servicesTotal > 0 && (
                  <div className="invoice-section">
                    <div className="inv-sec-title">
                      <i className="fa-solid fa-bottle-water"></i> 2. Dịch Vụ Nước & Khăn Đi Kèm
                    </div>
                    <table className="inv-table">
                      <thead>
                        <tr>
                          <th>Tên Mặt Hàng</th>
                          <th className="text-center">Số Lượng</th>
                          <th className="text-right">Thành Tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(serviceQuantities)
                          .filter(([_, qty]) => qty > 0)
                          .map(([id, qty]) => {
                            const it = REFRESHMENT_ITEMS.find((i) => i.id === id);
                            return (
                              <tr key={id}>
                                <td>{it?.name}</td>
                                <td className="text-center">{qty}</td>
                                <td className="text-right">{((it?.price || 0) * qty).toLocaleString('vi-VN')} đ</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* HẠNG MỤC 3: CĂNG DÂY VỢT */}
                {hasStringing && stringingTotal > 0 && (
                  <div className="invoice-section">
                    <div className="inv-sec-title">
                      <i className="fa-solid fa-wand-magic-sparkles"></i> 3. Dịch Vụ Căng Cước Vợt ({stringingOrders.length} cây)
                    </div>
                    <table className="inv-table">
                      <thead>
                        <tr>
                          <th>Tên Vợt</th>
                          <th>Loại Dây & Mức Căng</th>
                          <th className="text-right">Phí Đan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stringingOrders.map((ord, idx) => {
                          const str = STRING_TYPES.find((s) => s.id === ord.stringId);
                          return (
                            <tr key={idx}>
                              <td><strong>{ord.racquetName}</strong></td>
                              <td>{str?.name} • <strong>{ord.tensionKg} kg</strong> ({ord.knotType})</td>
                              <td className="text-right">{(str?.price || 0).toLocaleString('vi-VN')} đ</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TỔNG KẾT HÓA ĐƠN */}
                <div className="invoice-grand-total-row">
                  <div>
                    <span className="total-label">TỔNG TIỀN THANH TOÁN TOÀN BỘ ĐƠN:</span>
                    <small>Đã bao gồm tiền sân, dịch vụ và phí đan cước</small>
                  </div>
                  <div className="grand-price-figure">
                    {grandTotal.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* FORM THÔNG TIN KHÁCH HÀNG & PHƯƠNG THỨC THANH TOÁN */}
              <form onSubmit={handleFinalSubmit} className="order-final-form">
                <div className="form-grid-2">
                  <div className="field-block">
                    <label>Họ và tên khách hàng: <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Nguyễn Văn Anh"
                      className="form-input-box"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="field-block">
                    <label>Số điện thoại liên hệ: <span className="req">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="VD: 0912345678"
                      className="form-input-box"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field-block">
                  <label>Email nhận biên lai xác nhận (tùy chọn):</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="form-input-box"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div className="field-block">
                  <label>Phương thức thanh toán:</label>
                  <div className="pay-methods-grid">
                    <label className={`pay-method-card ${paymentMethod === 'VIETQR' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payMethod"
                        value="VIETQR"
                        checked={paymentMethod === 'VIETQR'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <i className="fa-solid fa-qrcode"></i>
                      <div>
                        <strong>Quét Mã VietQR (MB Bank)</strong>
                        <span>Khớp lệnh tự động tức thì</span>
                      </div>
                    </label>

                    <label className={`pay-method-card ${paymentMethod === 'CASH' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payMethod"
                        value="CASH"
                        checked={paymentMethod === 'CASH'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <i className="fa-solid fa-money-bill-wave"></i>
                      <div>
                        <strong>Thanh Toán Tại Quầy</strong>
                        <span>Thanh toán khi tới sân nhận ca</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="field-block">
                  <label>Ghi chú đơn hàng:</label>
                  <textarea
                    rows="2"
                    placeholder="Ghi chú thêm về giờ nhận sân hoặc số lượng đồ gửi..."
                    className="form-input-box"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-complete-order"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Đang Đóng Đơn & Tạo Mã QR...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check-double"></i> XÁC NHẬN & ĐÓNG ĐƠN ({grandTotal.toLocaleString('vi-VN')} đ)
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* MODAL FOOTER BUTTONS */}
        <div className="billing-modal-footer">
          <div className="footer-left">
            {step > 1 && (
              <button
                type="button"
                className="btn-wizard-back"
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              >
                <i className="fa-solid fa-arrow-left"></i> {t.wizard.btnBack}
              </button>
            )}
          </div>

          <div className="footer-right">
            <span className="live-grand-preview">
              {isVietnamese ? 'Tạm tính:' : 'Subtotal:'} <strong>{grandTotal.toLocaleString('vi-VN')} đ</strong>
            </span>

            {step < 4 ? (
              <button
                type="button"
                className="btn-wizard-next"
                onClick={() => setStep((prev) => Math.min(4, prev + 1))}
              >
                <span>
                  {isVietnamese
                    ? `Tiếp: ${step === 1 ? 'Chọn Nước & Khăn' : step === 2 ? 'Căng Dây Vợt' : 'Tính & Đóng Đơn'}`
                    : `Next: ${step === 1 ? 'Drinks & Towels' : step === 2 ? 'Racket Stringing' : 'Bill & Checkout'}`}
                </span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
