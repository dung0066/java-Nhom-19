import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useLanguage } from "../context/LanguageContext";
import { BRANCHES, TIME_SLOTS, DEFAULT_D2_PRODUCTS } from "../data/courtData";
import { fetchMatrixData, createBooking, getStoredUser, fetchProducts } from "../services/api";
import ComboModal from "../components/booking/ComboModal";
import OrderHistoryModal from "../components/booking/OrderHistoryModal";
import GuideModal from "../components/booking/GuideModal";
import AuthModal from "../components/common/AuthModal";
import "../styles/stepper-booking.css";
import "../styles/booking.css";

// Dịch vụ tiêu chuẩn phục vụ thi đấu & tập luyện
const SERVICE_ITEMS = [
  {
    category: "Nước Giải Khát & Nạp Khoáng",
    icon: "fa-bottle-water",
    items: [
      {
        id: "water_pocari",
        name: "Pocari Sweat 500ml",
        desc: "Bù 5 ion khoáng thiết yếu, chống chuột rút",
        price: 20000,
        unit: "chai",
      },
      {
        id: "water_revive",
        name: "Revive Chanh Muối 500ml",
        desc: "Ướp lạnh sâu, giải khát tức thì",
        price: 18000,
        unit: "chai",
      },
      {
        id: "water_lavie",
        name: "Nước khoáng thiên nhiên LaVie 500ml",
        desc: "Thanh khiết, dịu mát",
        price: 10000,
        unit: "chai",
      },
      {
        id: "water_redbull",
        name: "Bò Húc Red Bull Thái",
        desc: "Tỉnh táo, bùng nổ thể lực",
        price: 22000,
        unit: "lon",
      },
    ],
  },
  {
    category: "Khăn Thể Thao & Vệ Sinh",
    icon: "fa-snowflake",
    items: [
      {
        id: "towel_cold",
        name: "Khăn Lạnh Kháng Khuẩn Bạc Hà",
        desc: "Mát lạnh, tiệt trùng sạch sẽ",
        price: 5000,
        unit: "cái",
      },
      {
        id: "towel_cotton",
        name: "Thuê Khăn Bông Yonex Cotton",
        desc: "Thấm hút mồ hôi tối đa, giặt sấy thơm tho",
        price: 25000,
        unit: "buổi",
      },
    ],
  },
  {
    category: "Thuê Dụng Cụ & Tiện Ích",
    icon: "fa-wand-magic-sparkles",
    items: [
      {
        id: "rent_racquet",
        name: "Thuê Vợt Yonex / Lining Cao Cấp",
        desc: "Vợt căng sẵn 10.5kg, trợ lực tốt",
        price: 35000,
        unit: "cây/ca",
      },
      {
        id: "rent_shoes",
        name: "Thuê Giày Cầu Lông Khử Khuẩn UV",
        desc: "Đế cao su bám sân chuẩn thi đấu",
        price: 30000,
        unit: "đôi/ca",
      },
      {
        id: "locker_service",
        name: "Ký Gửi Tủ Locker Mã PIN",
        desc: "Tủ riêng biệt bảo quản đồ an toàn",
        price: 20000,
        unit: "buổi",
      },
      {
        id: "shoe_cleaning",
        name: "Giặt Sấy & Khử Khuẩn Giày UV",
        desc: "Làm sạch sâu, sấy UV tiệt trùng 15p",
        price: 60000,
        unit: "đôi",
      },
    ],
  },
  {
    category: "Dịch Vụ Căng Cước Vợt Lấy Ngay",
    icon: "fa-screwdriver-wrench",
    items: [
      {
        id: "string_bg65",
        name: "Cước Yonex BG65 (Độ bền cao)",
        desc: "Dây cước phổ biến nhất, chịu lực bền bỉ",
        price: 140000,
        unit: "cây",
      },
      {
        id: "string_bg65ti",
        name: "Cước Yonex BG65 Titanium",
        desc: "Âm thanh nổ đanh, trợ lực đập cầu",
        price: 160000,
        unit: "cây",
      },
      {
        id: "string_bg80",
        name: "Cước Yonex BG80 (Smash uy lực)",
        desc: "Độ nảy khủng, lực cầu nhanh",
        price: 190000,
        unit: "cây",
      },
    ],
  },
];

export default function BookingPage({ onNavigate }) {
  const { t, isVietnamese } = useLanguage();

  // Current Step: 1 | 2 | 3 | 4 | 'success'
  const [currentStep, setCurrentStep] = useState(1);
  const stepContainerRef = useRef(null);
  const matrixScrollRef = useRef(null);

  // Wheel handler to translate vertical scroll to horizontal scroll over matrix
  const handleMatrixWheel = (e) => {
    if (e.deltaY !== 0 && matrixScrollRef.current) {
      if (!e.shiftKey) {
        matrixScrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  // Selection states
  const todayStr = new Date().toISOString().split("T")[0];
  const [branch, setBranch] = useState("NVL");
  const [date, setDate] = useState(todayStr);

  // Cell width for matrix (zoomable: 26px - 84px, default 32px to fit 100% full screen width)
  const [cellWidth, setCellWidth] = useState(32);

  // Matrix data
  const [courts, setCourts] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotStatusMap, setSlotStatusMap] = useState({});

  // Group courts into blocks of 2 (Sân 1+2, Sân 3+4, Sân 5+6, Sân 7)
  const blocks = [];
  if (courts && courts.length > 0) {
    for (let i = 0; i < courts.length; i += 2) {
      if (i + 1 < courts.length) {
        blocks.push([courts[i], courts[i + 1]]);
      } else {
        blocks.push([courts[i]]);
      }
    }
  }

  // Selected courts & slots
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [appliedCombo, setAppliedCombo] = useState(null);
  const [consecutiveWarning, setConsecutiveWarning] = useState("");
  const warningTimerRef = useRef(null);

  const showWarning = (msg) => {
    setConsecutiveWarning(msg);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => {
      setConsecutiveWarning("");
    }, 6000);
  };

  // Services Quantities & Dynamic Products from SQL
  const [serviceCategories, setServiceCategories] = useState(SERVICE_ITEMS);
  const [serviceQuantities, setServiceQuantities] = useState({});

  // Customer & Payment Form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentType, setPaymentType] = useState("VIETQR");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success result
  const [bookingResult, setBookingResult] = useState(null);

  // Modals
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState("Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục đặt sân!");
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  // Tự động điền thông tin nếu đã đăng nhập
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
      if (!customerName) setCustomerName(user.fullName || user.username || "");
      if (!customerPhone) setCustomerPhone(user.phone || "");
      if (!customerEmail) setCustomerEmail(user.email || "");
    }
  }, []);

  // Tải danh mục sản phẩm và dụng cụ thật từ SQL Database (/api/products)
  useEffect(() => {
    const loadRealProducts = async () => {
      try {
        const prodList = await fetchProducts().catch(() => null);
        let products = prodList;
        if (!products || products.length === 0) {
          const saved = localStorage.getItem('d2_admin_products');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) products = parsed;
            } catch (_) {}
          }
        }
        if (!products || products.length === 0) {
          products = DEFAULT_D2_PRODUCTS;
        }

        if (products && products.length > 0) {
          const activeProds = products.filter(p => p.active !== false);
          if (activeProds.length > 0) {
            const grouped = {};
            activeProds.forEach(p => {
              const rawCat = typeof p.category === 'object' ? p.category?.code : p.category;
              const catKey = (rawCat || p.categoryCode || 'SERVICES').toUpperCase();
              if (!grouped[catKey]) grouped[catKey] = [];
              grouped[catKey].push({
                id: `prod_${p.id}`,
                name: p.name,
                desc: p.description || p.spec1 || (p.brand ? `Thương hiệu: ${p.brand}` : 'Chính hãng D2 Shop'),
                price: Number(p.price) || 0,
                unit: p.priceUnit ? p.priceUnit.replace('/', '').trim() : 'cái',
                badge: p.badge
              });
            });

            // Sắp xếp thứ tự danh mục: Nước -> Khăn -> Vợt -> Giày -> Dịch vụ
            const catOrder = ['REFRESHMENTS', 'ACCESSORY', 'RACKET', 'RACQUET', 'SHOES', 'SERVICES'];
            const sortedCatKeys = Object.keys(grouped).sort((a, b) => {
              const idxA = catOrder.indexOf(a) !== -1 ? catOrder.indexOf(a) : 99;
              const idxB = catOrder.indexOf(b) !== -1 ? catOrder.indexOf(b) : 99;
              return idxA - idxB;
            });

            const catList = sortedCatKeys.map((catKey) => {
              let catName = 'Dụng Cụ & Thiết Bị';
              let icon = 'fa-wand-magic-sparkles';
              if (catKey === 'REFRESHMENTS' || catKey === 'DRINKS') {
                catName = 'Nước Giải Khát & Nạp Khoáng';
                icon = 'fa-bottle-water';
              } else if (catKey === 'ACCESSORY') {
                catName = 'Khăn Thể Thao & Vệ Sinh';
                icon = 'fa-snowflake';
              } else if (catKey === 'RACKET' || catKey === 'RACQUET') {
                catName = 'Thuê Vợt Thi Đấu Cao Cấp';
                icon = 'fa-shield-halved';
              } else if (catKey === 'SHOES') {
                catName = 'Thuê Giày Cầu Lông Chuyên Dụng';
                icon = 'fa-shoe-prints';
              } else if (catKey === 'SERVICES') {
                catName = 'Dịch Vụ Căng Cước Vợt Lấy Ngay & Tiện Ích';
                icon = 'fa-screwdriver-wrench';
              }
              return { category: catName, icon, items: grouped[catKey] };
            });

            if (catList.length > 0) {
              setServiceCategories(catList);
            }
          }
        }
      } catch (_) {}
    };
    loadRealProducts();
  }, []);

  // Hàm chặn nếu chưa đăng nhập
  const ensureLoggedIn = (noticeText = "Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục đặt sân!") => {
    const user = getStoredUser();
    if (!user) {
      setAuthNotice(noticeText);
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (user) {
      setCustomerName(user.fullName || user.username || "");
      setCustomerPhone(user.phone || "");
      setCustomerEmail(user.email || "");
    }
  };

  // Load matrix from API & sync with Admin Courts
  const loadMatrix = async (targetBranch = branch, targetDate = date) => {
    try {
      const data = await fetchMatrixData(targetBranch, targetDate).catch(() => null);
      
      // Lấy danh sách sân do Admin quản lý từ SQL / localStorage
      let adminCourts = [];
      try {
        const saved = localStorage.getItem('d2_admin_courts');
        if (saved) adminCourts = JSON.parse(saved);
      } catch (_) {}

      // Lọc sân theo đúng chi nhánh đang chọn
      let branchCourts = adminCourts.filter(c => {
        const code = c.branch?.code || c.branchCode || 'NVL';
        return code === targetBranch;
      });

      // Nếu chưa có trong admin thì dùng danh sách sân theo từng chi nhánh
      if (branchCourts.length === 0) {
        if (targetBranch === 'DQII') {
          branchCourts = [
            { id: 21, courtNumber: 1, name: 'Sân 1', courtGroup: 'Thảm Taraflex BWF', branchCode: 'DQII', active: true },
            { id: 22, courtNumber: 2, name: 'Sân 2', courtGroup: 'Thảm Taraflex BWF', branchCode: 'DQII', active: true },
            { id: 23, courtNumber: 3, name: 'Sân 3', courtGroup: 'Thảm PVC Tiêu Chuẩn', branchCode: 'DQII', active: true },
            { id: 24, courtNumber: 4, name: 'Sân 4', courtGroup: 'Thảm PVC Tiêu Chuẩn', branchCode: 'DQII', active: true }
          ];
        } else if (targetBranch === 'NQA') {
          branchCourts = [
            { id: 31, courtNumber: 1, name: 'Sân 1', courtGroup: 'Thảm Taraflex BWF', branchCode: 'NQA', active: true },
            { id: 32, courtNumber: 2, name: 'Sân 2', courtGroup: 'Thảm Taraflex BWF', branchCode: 'NQA', active: true },
            { id: 33, courtNumber: 3, name: 'Sân 3', courtGroup: 'Thảm Taraflex BWF', branchCode: 'NQA', active: true }
          ];
        } else if (targetBranch === 'HB') {
          branchCourts = [
            { id: 41, courtNumber: 1, name: 'Sân 1 VIP Máy Lạnh', courtGroup: 'Phòng VIP Riêng', branchCode: 'HB', active: true },
            { id: 42, courtNumber: 2, name: 'Sân 2 VIP Máy Lạnh', courtGroup: 'Phòng VIP Riêng', branchCode: 'HB', active: true }
          ];
        } else {
          branchCourts = data?.courts?.length ? data.courts : COURTS_NVL;
        }
      }

      setCourts(branchCourts);
      setTimeSlots(data?.timeSlots || TIME_SLOTS);
      setSlotStatusMap(data?.slotStatusMap || {});
    } catch (err) {
      console.error("Lỗi tải dữ liệu sân:", err);
    }
  };

  useEffect(() => {
    loadMatrix(branch, date);
  }, [branch, date]);

  // Smooth scroll / animation on step change
  useEffect(() => {
    if (stepContainerRef.current) {
      gsap.fromTo(
        stepContainerRef.current,
        { autoAlpha: 0.4, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" },
      );
    }
    window.scrollTo({ top: 40, behavior: "smooth" });
  }, [currentStep]);

  // Generate 7 upcoming days for quick selector
  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayNames = isVietnamese ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName =
      i === 0 ? (isVietnamese ? "Hôm nay" : "Today") : i === 1 ? (isVietnamese ? "Ngày mai" : "Tomorrow") : dayNames[d.getDay()];
    const dateNumber = `${d.getDate()}/${d.getMonth() + 1}`;
    return { dateStr, dayName, dateNumber };
  });

  // Tính chỉ số thứ tự của slot theo thời gian trong ngày (38 ca 30 phút từ 05:00 đến 24:00)
  const getSlotOrderIndex = (slot) => {
    if (slot.sortOrder !== undefined && slot.sortOrder !== null) {
      return Number(slot.sortOrder);
    }
    if (slot.startTime) {
      const [h, m] = slot.startTime.split(":").map(Number);
      return h * 2 + (m >= 30 ? 1 : 0);
    }
    return Number(slot.id) || 0;
  };

  // Kiểm tra danh sách các slot có liên tục liền kề nhau không (không bị cách xa giờ)
  const areSlotsConsecutive = (slotsArr) => {
    if (!slotsArr || slotsArr.length <= 1) return true;
    const sorted = [...slotsArr].sort(
      (a, b) => getSlotOrderIndex(a.slot) - getSlotOrderIndex(b.slot),
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      const cur = getSlotOrderIndex(sorted[i].slot);
      const nxt = getSlotOrderIndex(sorted[i + 1].slot);
      if (nxt - cur !== 1) return false;
    }
    return true;
  };

  // Slot toggle handler với quy tắc BẮT BUỘC KHUNG GIỜ PHẢI LIỀN KỀ NHAU
  const handleToggleSlot = (court, slot, baseStatus) => {
    if (baseStatus === "BOOKED") return;

    const isSelected = selectedSlots.some(
      (s) => s.court.id === court.id && s.slot.id === slot.id,
    );

    if (isSelected) {
      const remaining = selectedSlots.filter(
        (s) => !(s.court.id === court.id && s.slot.id === slot.id),
      );
      // Nếu bỏ ô ở giữa làm dãy còn lại bị ngắt quãng
      if (remaining.length > 1 && !areSlotsConsecutive(remaining)) {
        showWarning("⚠️ Quý khách không thể bỏ khung giờ ở giữa! Các ca đặt sân phải giữ tính liên tiếp nhau. Quý khách vui lòng bỏ chọn từ hai đầu (ca đầu tiên hoặc ca cuối cùng).");
        return;
      }
      setSelectedSlots(remaining);
      setConsecutiveWarning("");
    } else {
      // 1. Kiểm tra cùng sân
      if (selectedSlots.length > 0 && selectedSlots[0].court.id !== court.id) {
        showWarning(`⚠️ Quý khách đang đặt tại "${selectedSlots[0].court.name}". Mỗi đơn đặt sân chỉ được chọn các ca trên cùng 1 sân! Bấm "Chọn Lại Từ Đầu" nếu muốn đổi sân.`);
        return;
      }

      // 2. Kiểm tra tính liền kề với các ca đã chọn
      const candidate = [...selectedSlots, { court, slot }];
      if (!areSlotsConsecutive(candidate)) {
        showWarning("⚠️ Khung giờ không liền kề! Quý khách phải đặt các ca giờ liền tiếp nhau (ví dụ: 10:00 - 10:30 - 11:00), không thể chọn ngắt quãng hoặc cách xa giờ!");
        return;
      }

      // Hợp lệ -> Thêm slot và sắp xếp theo trình tự thời gian
      setSelectedSlots(
        candidate.sort((a, b) => getSlotOrderIndex(a.slot) - getSlotOrderIndex(b.slot)),
      );
      setConsecutiveWarning("");
    }
  };

  // Combo Handler
  const handleSelectCombo = (comboType) => {
    setAppliedCombo(comboType);

    const offPeakPrefixes = [
      "05:",
      "06:",
      "07:",
      "08:",
      "09:",
      "10:",
      "11:",
      "12:",
      "13:",
      "14:",
      "15:",
      "22:",
      "23:",
    ];
    const candidates = [];
    courts.forEach((c) => {
      timeSlots.forEach((s) => {
        const isOffPeak = offPeakPrefixes.some((p) =>
          s.displayLabel?.startsWith(p),
        );
        const status =
          slotStatusMap[`${c.id}_${s.id}`]?.status ||
          slotStatusMap[`${c.id}_${s.id}`] ||
          "AVAILABLE";
        if (
          isOffPeak &&
          (status === "AVAILABLE" || typeof status !== "string")
        ) {
          candidates.push({ court: c, slot: s });
        }
      });
    });

    if (comboType === "SINGLE_OFFPEAK") {
      if (candidates.length >= 2) {
        setSelectedSlots([candidates[0], candidates[1]]);
        setServiceQuantities((prev) => ({
          ...prev,
          water_lavie: Math.max(prev.water_lavie || 0, 2),
          towel_cold: Math.max(prev.towel_cold || 0, 2),
        }));
        setCurrentStep(2);
      } else if (candidates.length === 1) {
        setSelectedSlots([candidates[0]]);
        setServiceQuantities((prev) => ({
          ...prev,
          water_lavie: Math.max(prev.water_lavie || 0, 2),
          towel_cold: Math.max(prev.towel_cold || 0, 2),
        }));
        setCurrentStep(2);
      } else {
        alert(
          "Khung giờ vắng của ngày này đã kín sân. Vui lòng chọn ngày khác!",
        );
      }
    } else if (comboType === "DOUBLE_OFFPEAK") {
      if (candidates.length >= 4) {
        setSelectedSlots([
          candidates[0],
          candidates[1],
          candidates[2],
          candidates[3],
        ]);
      } else if (candidates.length >= 2) {
        setSelectedSlots([candidates[0], candidates[1]]);
      } else if (candidates.length === 1) {
        setSelectedSlots([candidates[0]]);
      }
      setServiceQuantities((prev) => ({
        ...prev,
        water_pocari: Math.max(prev.water_pocari || 0, 4),
        towel_cold: Math.max(prev.towel_cold || 0, 4),
      }));
      setCurrentStep(2);
    }
  };

  // Service quantity changes
  const handleQtyChange = (itemId, delta) => {
    setServiceQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  // Price calculations (30 phút / slot)
  const rawCourtPrice = selectedSlots.reduce(
    (sum, s) =>
      sum +
      (s.slot.price ||
        s.slot.standardPrice ||
        (s.slot.isPeakHour ? 60000 : 35000)),
    0,
  );

  let comboDiscount = 0;
  if (appliedCombo === "SINGLE_OFFPEAK" && selectedSlots.length >= 2) {
    comboDiscount = Math.max(0, rawCourtPrice - 99000);
  } else if (appliedCombo === "DOUBLE_OFFPEAK" && selectedSlots.length >= 4) {
    comboDiscount = Math.max(0, rawCourtPrice - 189000);
  }

  const finalCourtPrice = Math.max(0, rawCourtPrice - comboDiscount);

  // Services price (Tính theo danh mục sản phẩm từ SQL Database)
  const allFlattenedServices = (serviceCategories || SERVICE_ITEMS).flatMap((c) => c.items);
  const servicesTotal = Object.entries(serviceQuantities).reduce(
    (sum, [id, qty]) => {
      if (!qty) return sum;
      const item = allFlattenedServices.find((s) => s.id === id);
      return sum + (item ? item.price * qty : 0);
    },
    0,
  );

  const totalAmount = finalCourtPrice + servicesTotal;
  const currentBranchObj =
    BRANCHES.find((b) => b.code === branch) || BRANCHES[0];

  // Submit Booking to Backend
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!ensureLoggedIn("Vui lòng đăng nhập hoặc đăng ký tài khoản để xác nhận đặt sân!")) {
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Vui lòng nhập Họ tên và Số điện thoại nhận sân!");
      return;
    }

    setIsSubmitting(true);
    try {
      const addonItemsPayload = Object.entries(serviceQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty], idx) => ({
          productId: idx + 1,
          quantity: qty,
          serviceCode: id,
        }));

      const payload = {
        branchCode: branch,
        bookingDate: date,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        paymentType,
        notes: orderNotes.trim(),
        totalAmount,
        slotIds: selectedSlots.map((s) => ({
          courtId: s.court.id,
          slotId: s.slot.id,
        })),
        addonItems: addonItemsPayload,
      };

      let result;
      try {
        result = await createBooking(payload);
      } catch (apiErr) {
        console.warn(
          "Backend call failed, using mock success for demo:",
          apiErr,
        );
        result = {
          bookingId: Date.now(),
          bookingCode: `WAY-${Math.floor(100000 + Math.random() * 900000)}`,
          status: paymentType === "VIETQR" ? "PENDING" : "CONFIRMED",
          totalPrice: totalAmount,
        };
      }

      setBookingResult({
        bookingId: result.bookingId || Date.now(),
        bookingCode:
          result.bookingCode || `WAY-${Date.now().toString().slice(-6)}`,
        status: result.status || "PENDING",
        totalPrice: totalAmount,
        customerName,
        customerPhone,
        paymentType,
        branchName: currentBranchObj.name,
        branchAddress: currentBranchObj.address,
        date,
        slots: selectedSlots,
      });

      try {
        const existing = JSON.parse(localStorage.getItem('d2_user_bookings') || '[]');
        const newBookingRecord = {
          id: Date.now(),
          bookingCode: result.bookingCode || `D2-${Date.now().toString().slice(-6)}`,
          customerName: customerName || 'Khách Đặt Online',
          customerPhone: customerPhone || '0914977030',
          branch: { code: branch, name: currentBranchObj.name },
          branchCode: branch,
          branchName: currentBranchObj.name,
          courtName: selectedSlots && selectedSlots.length ? selectedSlots[0].courtName || 'Sân tiêu chuẩn BWF' : 'Sân BWF',
          bookingDate: date,
          playDate: date,
          timeSlotStr: selectedSlots && selectedSlots.length ? `${selectedSlots[0].courtName || 'Sân 1'}: ${selectedSlots.length} ca (${selectedSlots[0].startTime || ''} - ${selectedSlots[selectedSlots.length - 1].endTime || ''})` : '18:00 - 19:30',
          timeRange: selectedSlots && selectedSlots.length ? `${selectedSlots.length} ca (${selectedSlots[0].startTime || ''} - ${selectedSlots[selectedSlots.length - 1].endTime || ''})` : '18:00 - 19:30',
          totalAmount: totalAmount,
          totalPrice: totalAmount,
          paymentType: paymentType === 'VIETQR' ? 'VietQR MB Bank' : 'Thanh toán tại quầy',
          status: 'CONFIRMED',
          createdAt: new Date().toLocaleDateString('vi-VN')
        };
        localStorage.setItem('d2_user_bookings', JSON.stringify([newBookingRecord, ...existing]));
      } catch {
        // Ignore storage error
      }

      setCurrentStep("success");
      loadMatrix(branch, date);
    } catch (err) {
      alert(
        err.message || "Có lỗi xảy ra khi tạo đơn đặt sân. Vui lòng thử lại!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNew = () => {
    setSelectedSlots([]);
    setAppliedCombo(null);
    setServiceQuantities({});
    setBookingResult(null);
    setCurrentStep(1);
  };

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        paddingBottom: "12px",
      }}
    >
      <div
        className="booking-stepper-container"
        style={{ paddingBottom: 0 }}   
      >
        {/* 1. STANDARDIZED 4-STEP PROGRESS HEADER */}
        {currentStep !== "success" && (
          <div className="stepper-header-card" style={{ marginBottom: "20px" }}>
            <div className="stepper-steps-list">
              <button
                type="button"
                className={`stepper-step-item ${currentStep === 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}
                onClick={() => setCurrentStep(1)}
              >
                <div className="step-circle">
                  {currentStep > 1 ? (
                    <i className="fa-solid fa-check"></i>
                  ) : (
                    "1"
                  )}
                </div>
                <div className="step-label-group">
                  <span className="step-sub-text">{isVietnamese ? 'Bước 1' : 'Step 1'}</span>
                  <span className="step-main-title">{isVietnamese ? 'Chọn Cơ Sở & Ngày' : 'Select Branch & Date'}</span>
                </div>
              </button>

              <div
                className={`step-divider-line ${currentStep > 1 ? "filled" : ""}`}
              ></div>

              <button
                type="button"
                className={`stepper-step-item ${currentStep === 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}
                onClick={() => {
                  if (currentStep > 2) setCurrentStep(2);
                }}
              >
                <div className="step-circle">
                  {currentStep > 2 ? (
                    <i className="fa-solid fa-check"></i>
                  ) : (
                    "2"
                  )}
                </div>
                <div className="step-label-group">
                  <span className="step-sub-text">{isVietnamese ? 'Bước 2' : 'Step 2'}</span>
                  <span className="step-main-title">{isVietnamese ? 'Chọn Sân & Giờ' : 'Pick Court & Time'}</span>
                </div>
              </button>

              <div
                className={`step-divider-line ${currentStep > 2 ? "filled" : ""}`}
              ></div>

              <button
                type="button"
                className={`stepper-step-item ${currentStep === 3 ? "active" : ""} ${currentStep > 3 ? "completed" : ""}`}
                onClick={() => {
                  if (currentStep > 3) setCurrentStep(3);
                }}
              >
                <div className="step-circle">
                  {currentStep > 3 ? (
                    <i className="fa-solid fa-check"></i>
                  ) : (
                    "3"
                  )}
                </div>
                <div className="step-label-group">
                  <span className="step-sub-text">{isVietnamese ? 'Bước 3' : 'Step 3'}</span>
                  <span className="step-main-title">{isVietnamese ? 'Dịch Vụ & Combo' : 'Services & Combos'}</span>
                </div>
              </button>

              <div
                className={`step-divider-line ${currentStep > 3 ? "filled" : ""}`}
              ></div>

              <button
                type="button"
                className={`stepper-step-item ${currentStep === 4 ? "active" : ""}`}
              >
                <div className="step-circle">4</div>
                <div className="step-label-group">
                  <span className="step-sub-text">{isVietnamese ? 'Bước 4' : 'Step 4'}</span>
                  <span className="step-main-title">{isVietnamese ? 'Xác Nhận & Thanh Toán' : 'Confirm & Payment'}</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP CONTENT CONTAINER */}
        <div ref={stepContainerRef}>
          {/* BANNER THÔNG BÁO TÀI KHOẢN ĐẶT SÂN */}
          {!currentUser ? (
            <div style={{
              backgroundColor: "#fffbeb",
              border: "1.5px solid #fde68a",
              borderRadius: "12px",
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "18px",
              gap: "12px",
              flexWrap: "wrap",
              boxShadow: "0 2px 8px rgba(245, 158, 11, 0.08)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="fa-solid fa-shield-halved" style={{ color: "#d97706", fontSize: "18px" }}></i>
                <span style={{ fontSize: "13.5px", color: "#92400e", fontWeight: "600" }}>
                  Hệ thống yêu cầu <strong>Đăng nhập</strong> hoặc <strong>Đăng ký</strong> để chọn giờ và đặt sân thi đấu.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthNotice("Vui lòng Đăng Nhập hoặc Đăng Ký tài khoản để đặt sân thi đấu!");
                  setIsAuthModalOpen(true);
                }}
                style={{
                  backgroundColor: "#0284c7",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <i className="fa-solid fa-user-lock"></i>
                Đăng Nhập / Đăng Ký Ngay
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "10px",
              padding: "8px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "#166534",
              fontWeight: "600"
            }}>
              <i className="fa-solid fa-circle-check" style={{ color: "#16a34a" }}></i>
              Đang đặt sân với tài khoản: <strong>{currentUser.fullName || currentUser.username}</strong>
            </div>
          )}

          {/* ====================================================
              BƯỚC 1: CHỌN CHI NHÁNH & NGÀY ĐẶT SÂN
              ==================================================== */}
          {currentStep === 1 && (
            <div>
              <div
                className="step-section-heading"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2>
                    <i
                      className="fa-solid fa-location-dot"
                      style={{ color: "#0284c7" }}
                    ></i>
                    Chọn Cơ Sở Sân Cầu Lông
                  </h2>
                  <p>
                    Hệ thống 4 cụm sân Ways Station đạt chuẩn BWF thi đấu quốc
                    tế
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-change-step1"
                  onClick={() => setIsGuideModalOpen(true)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <i className="fa-solid fa-circle-question"></i> Bảng giá &
                  Hướng dẫn
                </button>
              </div>

              {/* CARDS LIST OF BRANCHES (HIỆN ĐẠI, GẮN LOGO WAYS STATION) */}
              <div className="branch-cards-grid">
                {BRANCHES.map((b) => {
                  const isSelected = branch === b.code;
                  return (
                    <div
                      key={b.code}
                      className={`branch-select-card ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setBranch(b.code);
                        setSelectedSlots([]);
                        setAppliedCombo(null);
                      }}
                    >
                      <div className="branch-card-badge">
                        {isSelected ? (
                          <>
                            <i className="fa-solid fa-circle-check"></i> Đang Chọn
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-layer-group"></i> {b.totalCourts} Sân
                          </>
                        )}
                      </div>

                      <div>
                        <div className="branch-card-header">
                          <div className="branch-logo-box">
                            <img
                              src="/logo-d2.png"
                              alt="D2 Shop"
                              className="branch-logo-img"
                            />
                          </div>
                          <div>
                            <div className="branch-name-title">{b.name}</div>
                            <span className="branch-code-pill">
                              Mã sân: {b.code}
                            </span>
                          </div>
                        </div>

                        <div className="branch-address">
                          <i
                            className="fa-solid fa-map-pin"
                            style={{ color: "#ef4444", marginTop: "3px" }}
                          ></i>
                          <span>{b.address}</span>
                        </div>

                        <div className="branch-facilities-tags">
                          {(b.facilities || []).slice(0, 3).map((f, i) => (
                            <span key={i} className="facility-tag">
                              <i
                                className="fa-solid fa-check"
                                style={{ fontSize: "10px", color: "#10b981" }}
                              ></i>
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="branch-card-footer">
                        <span>
                          <i className="fa-regular fa-clock" style={{ color: "#0284c7" }}></i> {b.openHours}
                        </span>
                        <span
                          className={`branch-action-pill ${isSelected ? "selected" : "unselected"}`}
                        >
                          {isSelected ? "✓ ĐÃ CHỌN" : "CHỌN CƠ SỞ →"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DATE SELECTION CARD */}
              <div className="step-section-heading">
                <h2>
                  <i
                    className="fa-regular fa-calendar-days"
                    style={{ color: "#0284c7" }}
                  ></i>
                  Chọn Ngày Chơi
                </h2>
                <p>Chọn ngày hôm nay, các ngày sắp tới hoặc lịch tùy chọn</p>
              </div>

              <div className="date-picker-section-card">
                <div className="quick-dates-row">
                  {upcomingDays.map((d) => {
                    const isSelected = date === d.dateStr;
                    return (
                      <button
                        key={d.dateStr}
                        type="button"
                        className={`quick-date-btn ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          setDate(d.dateStr);
                          setSelectedSlots([]);
                          setAppliedCombo(null);
                        }}
                      >
                        <span className="date-day-label">{d.dayName}</span>
                        <span className="date-number-label">
                          {d.dateNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="custom-date-row">
                  <label htmlFor="customCalendarInput">
                    <i
                      className="fa-solid fa-calendar-check"
                      style={{ color: "#0284c7" }}
                    ></i>{" "}
                    Hoặc chọn ngày khác:
                  </label>
                  <input
                    id="customCalendarInput"
                    type="date"
                    value={date}
                    min={todayStr}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setSelectedSlots([]);
                      setAppliedCombo(null);
                    }}
                    className="custom-calendar-input"
                  />
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    (Đang chọn: <strong>{date}</strong>)
                  </span>
                </div>
              </div>

              {/* STICKY ACTION FOOTER BAR BƯỚC 1 (CỐ ĐỊNH Ở ĐÁY MÀN HÌNH - LƯỚT LÊN / LƯỚT XUỐNG VẪN LUÔN HIỆN) */}
              <div
                style={{
                  position: "sticky",
                  bottom: "12px",
                  zIndex: 99,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  background: "rgba(255, 255, 255, 0.96)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1.5px solid #94a3b8",
                  borderRadius: "14px",
                  boxShadow: "0 8px 30px rgba(15, 23, 42, 0.16)",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  className="btn-step-prev"
                  onClick={() => setIsHistoryModalOpen(true)}
                  style={{ margin: 0, padding: "10px 18px" }}
                >
                  <i className="fa-solid fa-receipt"></i> Lịch Sử Đơn Đặt
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#0369a1",
                      background: "#e0f2fe",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "1px solid #bae6fd",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="fa-solid fa-location-dot" style={{ color: "#0284c7" }}></i>
                    {currentBranchObj.name}
                  </span>

                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#0f172a",
                      background: "#f1f5f9",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="fa-regular fa-calendar-days" style={{ color: "#0284c7" }}></i>
                    {date}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-step-next"
                  style={{ margin: 0, padding: "10px 24px" }}
                  onClick={() => setCurrentStep(2)}
                >
                  <span>Tiếp tục: Chọn Sân & Giờ</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* ====================================================
              BƯỚC 2: CHỌN SÂN & KHUNG GIỜ (CHUẨN HÌNH 2, KHÔNG CHỮ 35K)
              ==================================================== */}
          {currentStep === 2 && (
            <div>
              {/* Top Bar Info & Separate Combo Modal Button */}
              <div
                className="court-selection-top-bar"
                style={{ marginBottom: "14px" }}
              >
                <div className="current-branch-date-info">
                  <span className="info-badge-branch">
                    <i className="fa-solid fa-location-dot"></i>{" "}
                    {currentBranchObj.name}
                  </span>
                  <span className="info-badge-date">
                    <i className="fa-regular fa-calendar"></i> {date}
                  </span>
                  <button
                    type="button"
                    className="btn-change-step1"
                    onClick={() => setCurrentStep(1)}
                  >
                    Đổi cơ sở / ngày
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-open-combo-modal"
                  onClick={() => setIsComboModalOpen(true)}
                >
                  <i className="fa-solid fa-gift"></i>
                  <span>Gói Combo Giờ Vắng (Giảm tới 40%)</span>
                </button>
              </div>

              {/* CẢNH BÁO BẮT BUỘC KHUNG GIỜ PHẢI LIỀN KỀ NHAU */}
              {consecutiveWarning && (
                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    border: "1.5px solid #f59e0b",
                    borderRadius: "12px",
                    padding: "12px 18px",
                    marginBottom: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    color: "#b45309",
                    fontSize: "13.5px",
                    fontWeight: "700",
                    boxShadow: "0 4px 16px rgba(245, 158, 11, 0.2)",
                    animation: "fadeIn 0.25s ease-out"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "22px", color: "#ea580c" }}></i>
                    <span>{consecutiveWarning}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSlots([]);
                        setConsecutiveWarning("");
                      }}
                      style={{
                        background: "#ea580c",
                        color: "#ffffff",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <i className="fa-solid fa-rotate-left"></i> Chọn Lại Từ Đầu
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsecutiveWarning("")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#b45309",
                        fontSize: "18px",
                        cursor: "pointer",
                        padding: "0 6px"
                      }}
                      title="Đóng thông báo"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Zoom & Range Sliders with Presets */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    className="status-legend-bar"
                    style={{ margin: 0, padding: "6px 14px" }}
                  >
                    <div className="legend-item">
                      <span
                        className="legend-color-dot available"
                        style={{ border: "1px solid #cbd5e1" }}
                      ></span>
                      <span>Trống</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color-dot selected"></span>
                      <span>Đang Chọn ({selectedSlots.length})</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color-dot booked"></span>
                      <span>Đã Đặt</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color-dot pass"></span>
                      <span>Cần Pass</span>
                    </div>
                  </div>
                </div>

                {/* ZOOM & FULL SCREEN CONTROLLER */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#fff",
                    padding: "5px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#475569",
                    }}
                  >
                    Chế độ xem:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCellWidth(30)}
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      background: cellWidth <= 32 ? "#0284c7" : "#f8fafc",
                      color: cellWidth <= 32 ? "#fff" : "#475569",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 9px",
                      cursor: "pointer",
                    }}
                    title="Co giãn tự động 100% vừa khít màn hình"
                  >
                    Toàn màn hình
                  </button>
                  <button
                    type="button"
                    onClick={() => setCellWidth(44)}
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      background:
                        cellWidth > 32 && cellWidth <= 48
                          ? "#0284c7"
                          : "#f8fafc",
                      color:
                        cellWidth > 32 && cellWidth <= 48 ? "#fff" : "#475569",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 9px",
                      cursor: "pointer",
                    }}
                  >
                    Chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => setCellWidth(58)}
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      background: cellWidth > 48 ? "#0284c7" : "#f8fafc",
                      color: cellWidth > 48 ? "#fff" : "#475569",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 9px",
                      cursor: "pointer",
                    }}
                    title="Phóng to dài rộng rãi"
                  >
                    To dài (Rộng)
                  </button>
                  <input
                    type="range"
                    min="26"
                    max="84"
                    value={cellWidth}
                    onChange={(e) => setCellWidth(Number(e.target.value))}
                    style={{
                      accentColor: "#0284c7",
                      cursor: "pointer",
                      width: "85px",
                    }}
                    title="Kéo thanh trượt để phóng to / thu nhỏ khung giờ tự do"
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      fontStyle: "italic",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <i className="fa-solid fa-arrows-left-right"></i> Lăn chuột
                    để cuộn ngang
                  </span>
                </div>
              </div>

              {/* UNIFIED 2-COURT MATRIX (TO DÀI TRÀN MÀN HÌNH, CO GIÃN TỰ ĐỘNG, KHÔNG BỊ GIỮ CỨNG) */}
              <div
                ref={matrixScrollRef}
                onWheel={handleMatrixWheel}
                className="matrix-scroll-container"
                style={{
                  width: "100%",
                  overflowX: "auto",
                  overflowY: "hidden",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  marginBottom: "16px",
                }}
              >
                <div
                  className="matrix-blocks-wrapper"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    width: "100%",
                    minWidth: `${96 + 38 * cellWidth}px`,
                  }}
                >
                  {blocks.length === 0 ? (
                    <div
                      style={{
                        padding: "30px",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      <i
                        className="fa-solid fa-spinner fa-spin"
                        style={{ fontSize: "20px", color: "#0284c7" }}
                      ></i>
                      <p style={{ marginTop: "8px", color: "#64748b" }}>
                        Đang tải sơ đồ sân...
                      </p>
                    </div>
                  ) : (
                    blocks.map((courtPair, blockIdx) => (
                      <div
                        key={blockIdx}
                        className="court-block-group"
                        style={{
                          width: "100%",
                          border: "1.5px solid #94a3b8",
                          borderRadius: "4px",
                          overflow: "hidden",
                          background: "#ffffff",
                          boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                        }}
                      >
                        {/* 1. Header Row With All 38 Time Slots */}
                        <div
                          className="block-header-row"
                          style={{
                            display: "flex",
                            width: "100%",
                            backgroundColor: "#cbe9fb",
                            borderBottom: "1.5px solid #93c5fd",
                          }}
                        >
                          <div
                            className="block-header-corner"
                            style={{
                              width: "96px",
                              minWidth: "96px",
                              maxWidth: "96px",
                              position: "sticky",
                              left: 0,
                              zIndex: 12,
                              background: "#cbe9fb",
                              borderRight: "1.5px solid #93c5fd",
                              boxShadow: "2px 0 5px rgba(0,0,0,0.06)",
                            }}
                          ></div>
                          <div
                            className="block-header-slots"
                            style={{
                              display: "flex",
                              flex: 1,
                              width: "calc(100% - 96px)",
                            }}
                          >
                            {timeSlots.map((slot) => (
                              <div
                                key={slot.id}
                                className="header-slot-cell"
                                style={{
                                  flex: "1 1 0",
                                  minWidth: `${cellWidth}px`,
                                  height: "36px",
                                  borderRight: "1px solid #93c5fd",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: "1px",
                                  boxSizing: "border-box",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: cellWidth < 42 ? "8px" : "9.5px",
                                    fontWeight: "800",
                                    color: "#0284c7",
                                    whiteSpace: "nowrap",
                                    letterSpacing: "-0.3px",
                                  }}
                                >
                                  {cellWidth < 40
                                    ? slot.startTime
                                    : slot.displayLabel}
                                </span>
                                {cellWidth >= 38 && (
                                  <span
                                    style={{
                                      fontSize: "7.5px",
                                      fontWeight: "600",
                                      color: slot.isPeakHour
                                        ? "#ea580c"
                                        : "#0369a1",
                                      marginTop: "1px",
                                    }}
                                  >
                                    {slot.isPeakHour ? "vàng" : "thường"}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Court Data Rows (2 courts per block) */}
                        {courtPair.map((court) => (
                          <div
                            key={court.id}
                            className="court-data-row"
                            style={{
                              display: "flex",
                              width: "100%",
                              borderBottom: "1px solid #cbd5e1",
                            }}
                          >
                            {/* Sticky Left Court Info Cell */}
                            <div
                              className="court-title-cell"
                              style={{
                                width: "96px",
                                minWidth: "96px",
                                maxWidth: "96px",
                                height: "38px",
                                position: "sticky",
                                left: 0,
                                zIndex: 11,
                                backgroundColor: court.active === false ? "#f59e0b" : "#009fe3",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0 6px",
                                borderRight: "1.5px solid #0077b6",
                                boxSizing: "border-box",
                                boxShadow: "2px 0 5px rgba(0,0,0,0.08)",
                              }}
                              title={court.active === false ? "Sân đang bảo trì kỹ thuật" : "Sân đang hoạt động"}
                            >
                              <span
                                style={{
                                  fontSize: "8.5px",
                                  fontWeight: "800",
                                  background: "rgba(0,0,0,0.22)",
                                  padding: "2px 4px",
                                  borderRadius: "3px",
                                }}
                              >
                                {court.active === false ? "BẢO TRÌ" : `CN ${branch}`}
                              </span>
                              <span
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: "800",
                                }}
                              >
                                {court.name}
                              </span>
                            </div>

                            {/* 38 Slots For This Court (BỎ CHỮ 35K THEO YÊU CẦU - ĐỂ KHUNG TRẮNG TINH, CO GIÃN TỰ ĐỘNG) */}
                            <div
                              className="court-slots-row"
                              style={{
                                display: "flex",
                                flex: 1,
                                width: "calc(100% - 96px)",
                              }}
                            >
                              {timeSlots.map((slot) => {
                                const isMaintenance = court.active === false;
                                const slotKey = `${court.id}_${slot.id}`;
                                const rawStatus = slotStatusMap[slotKey];
                                const baseStatus =
                                  typeof rawStatus === "object"
                                    ? rawStatus.status
                                    : rawStatus || "AVAILABLE";
                                const isBooked = baseStatus === "BOOKED";
                                const isPassWanted =
                                  baseStatus === "PASS_WANTED";
                                const isSelected = selectedSlots.some(
                                  (s) =>
                                    s.court.id === court.id &&
                                    s.slot.id === slot.id,
                                );

                                let cellBg = "#ffffff"; // Khung trắng sạch sẽ
                                let cellColor = "#0f172a";
                                let cellContent = ""; // BỎ CHỮ 35K, ĐỂ TRẮNG TINH THEO YÊU CẦU

                                if (isMaintenance) {
                                  cellBg = "#f1f5f9"; // Màu xám nhạt bảo trì
                                  cellColor = "#94a3b8";
                                  cellContent = "🔧";
                                } else if (isBooked) {
                                  cellBg = "#f87171"; // Màu đỏ cam đã đặt
                                  cellColor = "#ffffff";
                                  cellContent = "";
                                } else if (isPassWanted) {
                                  cellBg = "#c084fc"; // Màu tím cần pass
                                  cellColor = "#ffffff";
                                  cellContent = cellWidth < 38 ? "P" : "Pass";
                                } else if (isSelected) {
                                  cellBg = "#f59e0b"; // Màu vàng đã chọn
                                  cellColor = "#ffffff";
                                  cellContent = "✓";
                                }

                                return (
                                  <div
                                    key={slot.id}
                                    className={`grid-cell-slot ${isSelected ? "is-selected" : ""}`}
                                    style={{
                                      flex: "1 1 0",
                                      minWidth: `${cellWidth}px`,
                                      height: "38px",
                                      borderRight: "1px solid #cbd5e1",
                                      backgroundColor: cellBg,
                                      color: cellColor,
                                      cursor: isBooked || isMaintenance
                                        ? "not-allowed"
                                        : "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "11px",
                                      fontWeight: "800",
                                      userSelect: "none",
                                      boxSizing: "border-box",
                                      transition: "background-color 0.15s ease",
                                    }}
                                    onClick={() => {
                                      if (isMaintenance) {
                                        showWarning(`⚠️ Sân ${court.name} hiện đang tạm ngưng hoạt động để bảo trì kỹ thuật! Quý khách vui lòng chọn sân khác.`);
                                        return;
                                      }
                                      handleToggleSlot(court, slot, baseStatus);
                                    }}
                                    title={isMaintenance ? `${court.name} đang bảo trì kỹ thuật` : `${court.name} | ${slot.displayLabel} | ${isBooked ? "Đã đặt" : `${(slot.price || (slot.isPeakHour ? 60000 : 35000)).toLocaleString("vi-VN")} đ`}`}
                                  >
                                    {cellContent}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* STICKY ACTION FOOTER BAR (CỐ ĐỊNH Ở ĐÁY MÀN HÌNH - LƯỚT LÊN / LƯỚT XUỐNG VẪN LUÔN HIỆN) */}
              <div
                style={{
                  position: "sticky",
                  bottom: "12px",
                  zIndex: 99,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  background: "rgba(255, 255, 255, 0.96)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1.5px solid #94a3b8",
                  borderRadius: "14px",
                  boxShadow: "0 8px 30px rgba(15, 23, 42, 0.16)",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  className="btn-step-prev"
                  onClick={() => setCurrentStep(1)}
                  style={{ margin: 0, padding: "10px 18px" }}
                >
                  <i className="fa-solid fa-arrow-left"></i> Quay lại Bước 1
                </button>

                {selectedSlots.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      marginLeft: "auto",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12.5px", color: "#64748b" }}>
                        Đã chọn <strong>{selectedSlots.length} ca</strong> (
                        {selectedSlots.length * 0.5}h)
                      </div>
                      <div
                        style={{
                          fontSize: "17px",
                          fontWeight: "800",
                          color: "#ea580c",
                        }}
                      >
                        Tạm tính: {finalCourtPrice.toLocaleString("vi-VN")} đ
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-step-next"
                      style={{ margin: 0, padding: "10px 24px" }}
                      onClick={() => {
                        if (!ensureLoggedIn("Quý khách cần Đăng Nhập hoặc Đăng Ký tài khoản để tiếp tục đặt sân!")) return;
                        if (!areSlotsConsecutive(selectedSlots)) {
                          showWarning("⚠️ Các khung giờ đặt sân phải liên tiếp nhau! Quý khách vui lòng chọn các ca liền kề trước khi tiếp tục.");
                          return;
                        }
                        setCurrentStep(3);
                      }}
                    >
                      <span>Tiếp tục: Dịch Vụ & Combo</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      fontStyle: "italic",
                      marginLeft: "auto",
                    }}
                  >
                    👉 Bấm vào các ô trắng trên bảng để chọn giờ chơi
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ====================================================
              BƯỚC 3: DỊCH VỤ & COMBO ĐI KÈM
              ==================================================== */}
          {currentStep === 3 && (
            <div>
              <div className="step-section-heading">
                <h2>
                  <i
                    className="fa-solid fa-cube"
                    style={{ color: "#0284c7" }}
                  ></i>
                  Dịch Vụ & Nước Uống Tiện Ích
                </h2>
                <p>
                  Nước khoáng ướp lạnh, khăn tiệt trùng, thuê vợt thi đấu cao
                  cấp
                </p>
              </div>

              {appliedCombo && (
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1.5px solid #10b981",
                    borderRadius: "12px",
                    padding: "12px 18px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: "800", color: "#047857" }}>
                      <i className="fa-solid fa-gift"></i> Đã áp dụng{" "}
                      {appliedCombo === "SINGLE_OFFPEAK"
                        ? "Combo Sân Đơn (99.000đ/giờ)"
                        : "Combo Sân Đôi (189.000đ/gói)"}
                    </span>
                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "#065f46",
                        marginTop: "2px",
                      }}
                    >
                      Tự động cộng kèm nước suối và khăn lạnh theo gói ưu đãi.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-change-step1"
                    onClick={() => setAppliedCombo(null)}
                  >
                    Hủy gói combo
                  </button>
                </div>
              )}

              <div className="services-step-layout">
                {(serviceCategories || SERVICE_ITEMS).map((cat, catIdx) => (
                  <div key={catIdx} className="service-category-block">
                    <div className="service-category-title">
                      <i
                        className={`fa-solid ${cat.icon}`}
                        style={{ color: "#0284c7" }}
                      ></i>
                      <span>{cat.category}</span>
                    </div>

                    <div className="services-items-grid">
                      {cat.items.map((item) => {
                        const qty = serviceQuantities[item.id] || 0;
                        return (
                          <div key={item.id} className="service-item-card">
                            <div className="service-item-info">
                              <span className="service-item-name">
                                {item.name}
                              </span>
                              <span className="service-item-desc">
                                {item.desc}
                              </span>
                              <span className="service-item-price">
                                {item.price.toLocaleString("vi-VN")} đ /{" "}
                                {item.unit}
                              </span>
                            </div>

                            <div className="quantity-stepper-btn-group">
                              <button
                                type="button"
                                className="qty-control-btn"
                                onClick={() => handleQtyChange(item.id, -1)}
                              >
                                -
                              </button>
                              <span className="qty-number-display">{qty}</span>
                              <button
                                type="button"
                                className="qty-control-btn"
                                onClick={() => handleQtyChange(item.id, 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* STICKY ACTION FOOTER BAR BƯỚC 3 (CỐ ĐỊNH Ở ĐÁY MÀN HÌNH) */}
              <div
                style={{
                  position: "sticky",
                  bottom: "12px",
                  zIndex: 99,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  background: "rgba(255, 255, 255, 0.96)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1.5px solid #94a3b8",
                  borderRadius: "14px",
                  boxShadow: "0 8px 30px rgba(15, 23, 42, 0.16)",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  type="button"
                  className="btn-step-prev"
                  onClick={() => setCurrentStep(2)}
                  style={{ margin: 0, padding: "10px 18px" }}
                >
                  <i className="fa-solid fa-arrow-left"></i> Quay lại chọn sân
                </button>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      Tiền dịch vụ thêm:
                    </span>
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: "800",
                        color: "#0284c7",
                      }}
                    >
                      {servicesTotal.toLocaleString("vi-VN")} đ
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-step-next"
                    style={{ margin: 0, padding: "10px 24px" }}
                    onClick={() => {
                      if (!ensureLoggedIn("Quý khách cần Đăng Nhập hoặc Đăng Ký tài khoản để tiến hành thanh toán!")) return;
                      setCurrentStep(4);
                    }}
                  >
                    <span>Tiếp tục: Thanh toán</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              BƯỚC 4: XÁC NHẬN & THANH TOÁN
              ==================================================== */}
          {currentStep === 4 && (
            <div>
              <div className="step-section-heading">
                <h2>
                  <i
                    className="fa-solid fa-credit-card"
                    style={{ color: "#0284c7" }}
                  ></i>
                  Xác Nhận & Thanh Toán
                </h2>
                <p>
                  Kiểm tra lại thông tin đơn đặt sân và chọn phương thức thanh
                  toán thuận tiện
                </p>
              </div>

              <form
                onSubmit={handleSubmitBooking}
                className="checkout-two-columns"
              >
                <div className="checkout-card">
                  <h3 className="checkout-card-title">
                    <i
                      className="fa-solid fa-user-check"
                      style={{ color: "#0284c7" }}
                    ></i>
                    Thông Tin Người Nhận Sân
                  </h3>

                  <div className="form-group-item">
                    <label>Họ và Tên *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Nguyễn Văn Tuấn"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Số Điện Thoại (Zalo nhận vé) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="VD: 0912 345 678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Email (Nhận hóa đơn điện tử)</label>
                    <input
                      type="email"
                      placeholder="VD: tuan.nguyen@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Ghi Chú Đặt Sân</label>
                    <textarea
                      rows={2}
                      placeholder="VD: Cần mượn giỏ bóng tập, cần hỗ trợ bật đèn sớm..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <h3
                    className="checkout-card-title"
                    style={{ marginTop: "20px" }}
                  >
                    <i
                      className="fa-solid fa-wallet"
                      style={{ color: "#0284c7" }}
                    ></i>
                    Phương Thức Thanh Toán
                  </h3>

                  <div className="payment-method-selector-grid">
                    <div
                      className={`payment-method-card ${paymentType === "VIETQR" ? "active" : ""}`}
                      onClick={() => setPaymentType("VIETQR")}
                    >
                      <div className="pay-card-header">
                        <i
                          className="fa-solid fa-qrcode"
                          style={{ color: "#0284c7" }}
                        ></i>
                        <span>Chuyển Khoản VietQR</span>
                      </div>
                      <span className="pay-card-desc">
                        Quét mã QR tự động điền số tiền, xác nhận tức thì trong
                        3 giây.
                      </span>
                    </div>

                    <div
                      className={`payment-method-card ${paymentType === "CASH" ? "active" : ""}`}
                      onClick={() => setPaymentType("CASH")}
                    >
                      <div className="pay-card-header">
                        <i
                          className="fa-solid fa-money-bill-wave"
                          style={{ color: "#10b981" }}
                        ></i>
                        <span>Thanh Toán Tại Quầy</span>
                      </div>
                      <span className="pay-card-desc">
                        Thanh toán tiền mặt hoặc quẹt thẻ POS khi đến nhận sân
                        (giữ chỗ 15p).
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-summary-sidebar">
                  <div className="checkout-card">
                    <h3 className="checkout-card-title">
                      <i
                        className="fa-solid fa-receipt"
                        style={{ color: "#0284c7" }}
                      ></i>
                      Chi Tiết Hóa Đơn
                    </h3>

                    <div className="summary-details-box">
                      <div className="summary-line-row">
                        <span>Cơ sở:</span>
                        <strong>{currentBranchObj.name}</strong>
                      </div>
                      <div className="summary-line-row">
                        <span>Ngày đặt:</span>
                        <strong>{date}</strong>
                      </div>

                      <div
                        style={{
                          borderTop: "1px dashed #cbd5e1",
                          margin: "12px 0",
                        }}
                      ></div>

                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#1e293b",
                          marginBottom: "8px",
                        }}
                      >
                        Khung giờ đã chọn ({selectedSlots.length} ca):
                      </div>
                      {selectedSlots.map((s, i) => (
                        <div
                          key={i}
                          className="summary-line-row"
                          style={{ fontSize: "12.5px", marginBottom: "6px" }}
                        >
                          <span>
                            {s.court.name} ({s.slot.displayLabel})
                          </span>
                          <span>
                            {(s.slot.price || 35000).toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                      ))}

                      {comboDiscount > 0 && (
                        <div
                          className="summary-line-row"
                          style={{ color: "#059669", fontWeight: "700" }}
                        >
                          <span>Ưu đãi Combo giờ vắng:</span>
                          <span>
                            -{comboDiscount.toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                      )}

                      {Object.entries(serviceQuantities).some(
                        ([_, qty]) => qty > 0,
                      ) && (
                        <>
                          <div
                            style={{
                              borderTop: "1px dashed #cbd5e1",
                              margin: "12px 0",
                            }}
                          ></div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#1e293b",
                              marginBottom: "8px",
                            }}
                          >
                            Dịch vụ cộng thêm:
                          </div>
                          {Object.entries(serviceQuantities).map(
                            ([id, qty]) => {
                              if (!qty) return null;
                              const item = allFlattenedServices.find(
                                (s) => s.id === id,
                              );
                              if (!item) return null;
                              return (
                                <div
                                  key={id}
                                  className="summary-line-row"
                                  style={{
                                    fontSize: "12.5px",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <span>
                                    {item.name} x {qty}
                                  </span>
                                  <span>
                                    {(item.price * qty).toLocaleString("vi-VN")}{" "}
                                    đ
                                  </span>
                                </div>
                              );
                            },
                          )}
                        </>
                      )}
                    </div>

                    <div
                      className="summary-total-banner"
                      style={{ marginTop: "14px" }}
                    >
                      <span className="total-banner-label">
                        Tổng Thanh Toán:
                      </span>
                      <span className="total-banner-price">
                        {totalAmount.toLocaleString("vi-VN")} đ
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-step-confirm"
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i> Đang
                          xử lý...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-circle-check"></i> XÁC NHẬN
                          ĐẶT SÂN
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn-step-prev"
                    style={{ justifyContent: "center" }}
                    onClick={() => setCurrentStep(3)}
                  >
                    <i className="fa-solid fa-arrow-left"></i> Quay lại chỉnh
                    sửa dịch vụ
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ====================================================
              VIEW HOÀN TẤT: VÉ ĐẶT SÂN THÀNH CÔNG
              ==================================================== */}
          {currentStep === "success" && bookingResult && (
            <div className="booking-success-view-card">
              <div className="success-icon-animated">
                <i className="fa-solid fa-check"></i>
              </div>
              <h2 className="success-main-title">Đặt Sân Thành Công!</h2>
              <p className="success-sub-desc">
                Thông tin xác nhận đã được lưu vào hệ thống của Ways Station
                Badminton Club.
              </p>

              <div className="booking-code-pill-box">
                <div className="booking-code-label">
                  Mã Đặt Sân (Booking Code)
                </div>
                <div className="booking-code-value">
                  {bookingResult.bookingCode}
                </div>
              </div>

              {bookingResult.paymentType === "VIETQR" && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1.5px solid #86efac",
                    borderRadius: "14px",
                    padding: "18px",
                    maxWidth: "380px",
                    margin: "0 auto 20px auto",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13.5px",
                      fontWeight: "800",
                      color: "#166534",
                      marginBottom: "8px",
                    }}
                  >
                    <i className="fa-solid fa-qrcode"></i> QUÉT MÃ VIETQR ĐỂ
                    HOÀN TẤT
                  </div>
                  <img
                    src={`https://api.vietqr.io/image/970422-0889555559-compact2.jpg?amount=${bookingResult.totalPrice}&addInfo=${encodeURIComponent(bookingResult.bookingCode)}&accountName=WAYS%20STATION%20BADMINTON`}
                    alt="VietQR Code"
                    style={{
                      width: "210px",
                      height: "210px",
                      objectFit: "contain",
                      margin: "0 auto",
                      display: "block",
                      borderRadius: "8px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#15803d",
                      marginTop: "8px",
                      lineHeight: "1.4",
                    }}
                  >
                    Ngân hàng Quân Đội (MB Bank)
                    <br />
                    STK: <strong>0889555559</strong> - Tên:{" "}
                    <strong>WAYS STATION BADMINTON</strong>
                    <br />
                    Nội dung: <strong>{bookingResult.bookingCode}</strong>
                  </div>
                </div>
              )}

              <div className="success-info-table">
                <div className="info-table-row">
                  <span className="info-table-label">Người nhận sân:</span>
                  <span className="info-table-value">
                    {bookingResult.customerName} - {bookingResult.customerPhone}
                  </span>
                </div>
                <div className="info-table-row">
                  <span className="info-table-label">Cơ sở:</span>
                  <span className="info-table-value">
                    {bookingResult.branchName}
                  </span>
                </div>
                <div className="info-table-row">
                  <span className="info-table-label">Địa chỉ:</span>
                  <span className="info-table-value">
                    {bookingResult.branchAddress}
                  </span>
                </div>
                <div className="info-table-row">
                  <span className="info-table-label">Ngày chơi:</span>
                  <span className="info-table-value">{bookingResult.date}</span>
                </div>
                <div className="info-table-row">
                  <span className="info-table-label">Các ca sân:</span>
                  <span className="info-table-value">
                    {bookingResult.slots
                      .map((s) => `${s.court.name} (${s.slot.displayLabel})`)
                      .join(", ")}
                  </span>
                </div>
                <div className="info-table-row">
                  <span className="info-table-label">Tổng thanh toán:</span>
                  <span
                    className="info-table-value"
                    style={{ color: "#ea580c", fontSize: "16px" }}
                  >
                    {bookingResult.totalPrice.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              <div className="success-actions-row">
                <button
                  type="button"
                  className="btn-step-prev"
                  onClick={() => window.print()}
                >
                  <i className="fa-solid fa-print"></i> In / Lưu Phiếu Đặt
                </button>

                <button
                  type="button"
                  className="btn-step-next"
                  style={{ margin: 0 }}
                  onClick={handleResetForNew}
                >
                  <i className="fa-solid fa-plus"></i> Đặt Thêm Sân Khác
                </button>

                <button
                  type="button"
                  className="btn-step-prev"
                  onClick={() => onNavigate("home")}
                >
                  <i className="fa-solid fa-house"></i> Về Trang Chủ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ComboModal
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
        onSelectCombo={handleSelectCombo}
      />

      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        titleNotice={authNotice}
      />
    </div>
  );
}
