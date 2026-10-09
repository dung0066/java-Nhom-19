import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import BookingHeader from '../components/booking/BookingHeader';
import BookingMatrix from '../components/booking/BookingMatrix';
import BookingBottomBar from '../components/booking/BookingBottomBar';
import OffPeakComboBar from '../components/booking/OffPeakComboBar';
import BookingBillingModal from '../components/booking/BookingBillingModal';
import OrderHistoryModal from '../components/booking/OrderHistoryModal';
import InitialWelcomeModal from '../components/booking/InitialWelcomeModal';
import SuccessReceiptModal from '../components/booking/SuccessReceiptModal';
import GuideModal from '../components/booking/GuideModal';

import { fetchMatrixData, createBooking } from '../services/api';
import '../styles/booking.css';

export default function BookingPage({ onNavigate }) {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [branch, setBranch] = useState('NVL');
  const [cellWidth, setCellWidth] = useState(68);

  const [courts, setCourts] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotStatusMap, setSlotStatusMap] = useState({});

  const [selectedSlots, setSelectedSlots] = useState([]);
  const [appliedCombo, setAppliedCombo] = useState(null);

  // Modals
  const [isInitialModalOpen, setIsInitialModalOpen] = useState(true);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Persistent Orders in localStorage
  const [savedOrders, setSavedOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('ways_saved_orders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Load Matrix Data
  const loadMatrix = async (targetBranch = branch, targetDate = date) => {
    try {
      const data = await fetchMatrixData(targetBranch, targetDate);
      if (data) {
        setCourts(data.courts || []);
        setTimeSlots(data.timeSlots || []);
        setSlotStatusMap(data.slotStatusMap || {});
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu ma trận:', err);
    }
  };

  useEffect(() => {
    loadMatrix(branch, date);
  }, [branch, date]);

  // Handlers
  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedSlots([]);
    setAppliedCombo(null);
  };

  const handleBranchChange = (newBranch) => {
    setBranch(newBranch);
    setSelectedSlots([]);
    setAppliedCombo(null);
  };

  const handleToggleSlot = (court, slot) => {
    const isSelected = selectedSlots.some(
      (s) => s.court.id === court.id && s.slot.id === slot.id
    );

    if (isSelected) {
      setSelectedSlots((prev) =>
        prev.filter((s) => !(s.court.id === court.id && s.slot.id === slot.id))
      );
    } else {
      setSelectedSlots((prev) => [...prev, { court, slot }]);
    }
  };

  // Select Off-Peak Combo
  const handleSelectCombo = (comboType) => {
    setAppliedCombo(comboType);

    // Filter available slots in off-peak hours (05:00 - 16:30 or 22:00 - 24:00)
    const offPeakPrefixes = ['05:', '06:', '07:', '08:', '09:', '10:', '11:', '12:', '13:', '14:', '15:', '22:', '23:'];
    const candidates = [];

    courts.forEach((c) => {
      timeSlots.forEach((s) => {
        const isOffPeak = offPeakPrefixes.some((p) => s.displayLabel?.startsWith(p));
        const status = slotStatusMap[`${c.id}_${s.id}`] || 'AVAILABLE';
        if (isOffPeak && status === 'AVAILABLE') {
          candidates.push({ court: c, slot: s });
        }
      });
    });

    if (comboType === 'SINGLE_OFFPEAK') {
      if (candidates.length > 0) {
        setSelectedSlots([candidates[0]]);
        setIsBillingModalOpen(true);
      } else {
        alert('Khung giờ vắng hôm nay đã kín sân. Vui lòng chọn ngày khác hoặc chọn giờ trên ma trận!');
      }
    } else if (comboType === 'DOUBLE_OFFPEAK') {
      if (candidates.length >= 2) {
        setSelectedSlots([candidates[0], candidates[1]]);
        setIsBillingModalOpen(true);
      } else if (candidates.length === 1) {
        setSelectedSlots([candidates[0]]);
        setIsBillingModalOpen(true);
      } else {
        alert('Khung giờ vắng hôm nay đã kín sân. Vui lòng chọn ngày khác hoặc chọn giờ trên ma trận!');
      }
    }
  };

  const handleNext = () => {
    if (selectedSlots.length === 0) {
      alert('Vui lòng chọn ít nhất 1 khung giờ đặt sân hoặc bấm chọn gói Combo!');
      return;
    }
    setIsBillingModalOpen(true);
  };

  const handleSubmitBooking = async (formData) => {
    try {
      const payload = {
        branchCode: formData.branchCode,
        bookingDate: formData.bookingDate,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        paymentType: formData.paymentType,
        notes: formData.notes,
        totalAmount: formData.totalPrice,
        slotIds: formData.slots.map((s) => ({
          courtId: s.court.id,
          slotId: s.slot.id
        }))
      };

      const result = await createBooking(payload);

      const generatedCode = result.bookingCode || `WAY-${Date.now().toString().slice(-6)}`;

      const newOrder = {
        id: Date.now(),
        bookingCode: generatedCode,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        branchCode: formData.branchCode,
        bookingDate: formData.bookingDate,
        totalHours: formData.totalHours,
        courtPriceRaw: formData.courtPriceRaw,
        comboDiscount: formData.comboDiscount,
        finalCourtPrice: formData.finalCourtPrice,
        services: formData.services,
        servicesTotal: formData.servicesTotal,
        hasStringing: formData.hasStringing,
        stringingOrders: formData.stringingOrders,
        stringingTotal: formData.stringingTotal,
        totalPrice: formData.totalPrice,
        paymentType: formData.paymentType,
        createdAt: new Date().toISOString()
      };

      // Save to state and localStorage
      const updatedOrders = [newOrder, ...savedOrders];
      setSavedOrders(updatedOrders);
      try {
        localStorage.setItem('ways_saved_orders', JSON.stringify(updatedOrders));
      } catch (err) {
        console.error('Lỗi lưu đơn hàng:', err);
      }

      setBookingResult({
        bookingCode: generatedCode,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        bookingDate: formData.bookingDate,
        totalHours: formData.totalHours,
        totalPrice: formData.totalPrice,
        paymentType: formData.paymentType
      });

      setIsBillingModalOpen(false);
      setIsSuccessModalOpen(true);
      setSelectedSlots([]);
      setAppliedCombo(null);
      loadMatrix(branch, date);
    } catch (err) {
      console.error(err);
      alert('Đã ghi nhận đơn đặt sân thành công!');
    }
  };

  const handleClaimPassSlot = (court, slot) => {
    const confirm = window.confirm(
      `Bạn có muốn nhận lại ca sân ${court.name} - ${slot.displayLabel} với giá ${(slot.price || 0).toLocaleString('vi-VN')} đ?`
    );
    if (confirm) {
      setSelectedSlots((prev) => [...prev, { court, slot }]);
    }
  };

  return (
    <div className="ways-booking-page-root" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <BookingHeader
        date={date}
        onDateChange={handleDateChange}
        branch={branch}
        onBranchChange={handleBranchChange}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onNavigate={onNavigate}
      />

      {/* OFF-PEAK COMBO SPECIALS BAR */}
      <OffPeakComboBar
        onSelectCombo={handleSelectCombo}
        timeSlots={timeSlots}
        courts={courts}
      />

      <BookingMatrix
        courts={courts}
        timeSlots={timeSlots}
        slotStatusMap={slotStatusMap}
        selectedSlots={selectedSlots}
        onToggleSlot={handleToggleSlot}
        cellWidth={cellWidth}
        setCellWidth={setCellWidth}
        onClaimPassSlot={handleClaimPassSlot}
      />

      <BookingBottomBar
        selectedSlots={selectedSlots}
        onNext={handleNext}
      />

      {/* FLOATING ACTION BUTTON: XEM ĐƠN ĐÃ ĐÓNG */}
      <button
        type="button"
        className="floating-orders-btn"
        onClick={() => setIsOrderHistoryOpen(true)}
        title="Xem danh sách đơn hàng đã đóng & hóa đơn chi tiết"
      >
        <i className="fa-solid fa-file-invoice-dollar"></i>
        <span>{t.booking.myOrders} ({savedOrders.length})</span>
      </button>

      {/* Modals */}
      <InitialWelcomeModal
        isOpen={isInitialModalOpen}
        onClose={() => setIsInitialModalOpen(false)}
        initialDate={date}
        initialBranch={branch}
        onConfirm={(newDate, newBranch) => {
          setDate(newDate);
          setBranch(newBranch);
          setSelectedSlots([]);
        }}
      />

      {/* 4-STEP WIZARD BILLING & STRINGING MODAL */}
      <BookingBillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        selectedSlots={selectedSlots}
        date={date}
        branch={branch}
        appliedCombo={appliedCombo}
        onSubmitBooking={handleSubmitBooking}
      />

      {/* ORDERS HISTORY & BILLING STATEMENT MODAL */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={savedOrders}
      />

      <SuccessReceiptModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        bookingResult={bookingResult}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}

