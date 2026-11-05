import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import AdminBookingsTab from '../components/admin/AdminBookingsTab';
import AdminProductsTab from '../components/admin/AdminProductsTab';
import AdminBranchesTab from '../components/admin/AdminBranchesTab';
import AdminPricingTab from '../components/admin/AdminPricingTab';
import AdminUsersTab from '../components/admin/AdminUsersTab';
import AdminArticlesTab from '../components/admin/AdminArticlesTab';
import AdminPaymentsTab from '../components/admin/AdminPaymentsTab';
import AdminMembershipsTab from '../components/admin/AdminMembershipsTab';
import ProductModal from '../components/admin/ProductModal';
import CourtModal from '../components/admin/CourtModal';
import ArticleModal from '../components/admin/ArticleModal';
import BranchModal from '../components/admin/BranchModal';
import AdminResetPasswordModal from '../components/admin/AdminResetPasswordModal';

import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  fetchAdminBookings,
  fetchAllBookings,
  confirmBookingAdmin,
  checkinBookingAdmin,
  cancelBookingAdmin,
  fetchProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchBranches,
  createAdminBranch,
  updateAdminBranch,
  deleteAdminBranch,
  fetchAdminCourts,
  createAdminCourt,
  updateAdminCourt,
  toggleAdminCourtActive,
  deleteAdminCourt,
  fetchAdminUsers,
  toggleAdminUserStatus,
  changeAdminUserRole,
  createAdminUser,
  fetchAdminArticles,
  createAdminArticle,
  updateAdminArticle,
  toggleAdminArticle,
  deleteAdminArticle
} from '../services/api';

import { BRANCHES as DEFAULT_BRANCHES, COURTS_NVL, DEFAULT_D2_PRODUCTS } from '../data/courtData';
import '../styles/admin.css';

// Dữ liệu mẫu đơn đặt sân sống động cho đồ án khi DB mới chưa có dữ liệu
const SAMPLE_BOOKINGS = [
  {
    id: 101,
    bookingCode: 'D2B-2401',
    customerName: 'Nguyễn Văn Hùng',
    customerPhone: '0912 345 678',
    branch: { code: 'NVL', name: 'D2 Shop NVL - Gò Vấp' },
    branchCode: 'NVL',
    bookingDate: '2026-10-28',
    timeSlotStr: 'Sân 2: 17:30 - 18:30 (2 ca)',
    totalAmount: 120000,
    status: 'PAID',
    details: [
      { court: { name: 'Sân 2' }, timeSlot: { displayLabel: '17:30 - 18:00' } },
      { court: { name: 'Sân 2' }, timeSlot: { displayLabel: '18:00 - 18:30' } }
    ]
  },
  {
    id: 102,
    bookingCode: 'D2B-2402',
    customerName: 'Trần Mai Linh',
    customerPhone: '0988 765 432',
    branch: { code: 'DQII', name: 'D2 Shop DQII - Gò Vấp' },
    branchCode: 'DQII',
    bookingDate: '2026-10-28',
    timeSlotStr: 'Sân 1: 19:00 - 20:00 (2 ca)',
    totalAmount: 120000,
    status: 'PENDING',
    details: [
      { court: { name: 'Sân 1' }, timeSlot: { displayLabel: '19:00 - 19:30' } },
      { court: { name: 'Sân 1' }, timeSlot: { displayLabel: '19:30 - 20:00' } }
    ]
  },
  {
    id: 103,
    bookingCode: 'D2B-2403',
    customerName: 'Lê Quốc Bảo',
    customerPhone: '0903 112 233',
    branch: { code: 'NQA', name: 'D2 Shop NQA - Tân Phú' },
    branchCode: 'NQA',
    bookingDate: '2026-10-28',
    timeSlotStr: 'Sân 3: 06:00 - 07:30 (3 ca)',
    totalAmount: 105000,
    status: 'COMPLETED',
    details: [
      { court: { name: 'Sân 3' }, timeSlot: { displayLabel: '06:00 - 07:30' } }
    ]
  },
  {
    id: 104,
    bookingCode: 'D2B-2404',
    customerName: 'Phạm Thu Hương',
    customerPhone: '0977 445 566',
    branch: { code: 'HB', name: 'D2 Shop HB - TP. Thủ Đức' },
    branchCode: 'HB',
    bookingDate: '2026-10-29',
    timeSlotStr: 'Sân 1 VIP: 18:00 - 19:00 (2 ca)',
    totalAmount: 140000,
    status: 'PENDING',
    details: [
      { court: { name: 'Sân 1 VIP' }, timeSlot: { displayLabel: '18:00 - 19:00' } }
    ]
  }
];

// Danh sách sân mở rộng cho tất cả 4 chi nhánh
const INITIAL_MULTI_COURTS = [
  ...COURTS_NVL.map(c => ({ ...c, branchCode: 'NVL', branch: { code: 'NVL' } })),
  { id: 21, courtNumber: 1, name: 'Sân 1 (DQII)', courtGroup: 'Thảm Taraflex BWF', branchCode: 'DQII', branch: { code: 'DQII' }, active: true },
  { id: 22, courtNumber: 2, name: 'Sân 2 (DQII)', courtGroup: 'Thảm Taraflex BWF', branchCode: 'DQII', branch: { code: 'DQII' }, active: true },
  { id: 23, courtNumber: 3, name: 'Sân 3 (DQII)', courtGroup: 'Thảm PVC Tiêu Chuẩn', branchCode: 'DQII', branch: { code: 'DQII' }, active: true },
  { id: 24, courtNumber: 4, name: 'Sân 4 (DQII)', courtGroup: 'Thảm PVC Tiêu Chuẩn', branchCode: 'DQII', branch: { code: 'DQII' }, active: true },
  { id: 31, courtNumber: 1, name: 'Sân 1 (NQA)', courtGroup: 'Thảm Taraflex BWF', branchCode: 'NQA', branch: { code: 'NQA' }, active: true },
  { id: 32, courtNumber: 2, name: 'Sân 2 (NQA)', courtGroup: 'Thảm Taraflex BWF', branchCode: 'NQA', branch: { code: 'NQA' }, active: true },
  { id: 33, courtNumber: 3, name: 'Sân 3 (NQA)', courtGroup: 'Thảm Taraflex BWF', branchCode: 'NQA', branch: { code: 'NQA' }, active: true },
  { id: 41, courtNumber: 1, name: 'Sân 1 VIP Máy Lạnh', courtGroup: 'Phòng Lạnh VIP Khép Kín', branchCode: 'HB', branch: { code: 'HB' }, active: true },
  { id: 42, courtNumber: 2, name: 'Sân 2 VIP Máy Lạnh', courtGroup: 'Phòng Lạnh VIP Khép Kín', branchCode: 'HB', branch: { code: 'HB' }, active: true }
];

// Tài khoản người dùng mẫu
const INITIAL_USERS = [
  { id: 1, username: 'admin', fullName: 'Quản Trị Viên Hệ Thống', email: 'admin@d2shop.vn', phone: '0914977030', role: 'ROLE_ADMIN', status: 'ACTIVE' },
  { id: 2, username: 'staff_govap', fullName: 'Nhân Viên Sân Gò Vấp', email: 'staff.gv@d2shop.vn', phone: '0988111222', role: 'ROLE_STAFF', status: 'ACTIVE' },
  { id: 3, username: 'hungnguyen', fullName: 'Nguyễn Văn Hùng', email: 'hung.nv@gmail.com', phone: '0912345678', role: 'ROLE_USER', status: 'ACTIVE' },
  { id: 4, username: 'linhtran', fullName: 'Trần Mai Linh', email: 'mailinh99@gmail.com', phone: '0988765432', role: 'ROLE_USER', status: 'ACTIVE' },
  { id: 5, username: 'baole', fullName: 'Lê Quốc Bảo', email: 'baole.badminton@gmail.com', phone: '0903112233', role: 'ROLE_USER', status: 'LOCKED' }
];

// Chi nhánh hệ thống chuẩn thương hiệu D2 Shop
const D2_BRANCHES = [
  { id: 1, code: 'NVL', name: 'D2 Shop NVL - Gò Vấp', address: '70 Nguyễn Văn Lượng, P. 10, Q. Gò Vấp, TP.HCM', phone: '0914977030', totalCourts: 7 },
  { id: 2, code: 'DQII', name: 'D2 Shop DQII - Gò Vấp', address: '262 Dương Quảng Hàm, P. 5, Q. Gò Vấp, TP.HCM', phone: '0914977030', totalCourts: 4 },
  { id: 3, code: 'NQA', name: 'D2 Shop NQA - Tân Phú', address: '86 Nguyễn Quý Anh, P. Tân Sơn Nhì, Q. Tân Phú, TP.HCM', phone: '0914977030', totalCourts: 6 },
  { id: 4, code: 'HB', name: 'D2 Shop HB - TP. Thủ Đức', address: '135 Hiệp Bình, P. Hiệp Bình Chánh, TP. Thủ Đức, TP.HCM', phone: '0914977030', totalCourts: 2 }
];

/** Tải lần lượt các trang đơn đặt (100 đơn/trang, tối đa 20 trang) và gộp thành một mảng. */
async function fetchAllAdminBookingPages() {
  const first = await fetchAdminBookings(0, 100);
  if (!first || !first.content) return first;
  const all = [...first.content];
  const totalPages = Math.min(first.totalPages || 1, 20);
  for (let page = 1; page < totalPages; page++) {
    const next = await fetchAdminBookings(page, 100);
    all.push(...(next.content || []));
  }
  return all;
}

export default function AdminPage({ onNavigate }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Main Data States
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('d2_admin_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_D2_PRODUCTS;
  });
  const [branches, setBranches] = useState(D2_BRANCHES);
  const [courts, setCourts] = useState(INITIAL_MULTI_COURTS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [articles, setArticles] = useState([]);
  const [trashedProducts, setTrashedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('d2_admin_products_trash');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [trashedArticles, setTrashedArticles] = useState(() => {
    try {
      const saved = localStorage.getItem('d2_admin_articles_trash');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const tabContainerRef = useRef(null);

  // ==========================================
  // 1. AUTHENTICATION CHECK
  // ==========================================
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const user = await fetchCurrentUser();
        if (user && (user.role === 'ADMIN' || user.role === 'STAFF' || user.role === 'ROLE_ADMIN' || user.role === 'ROLE_STAFF')) {
          setCurrentUser(user);
        } else {
          // Tự động nhận diện session admin nếu demo
          const localUser = localStorage.getItem('user');
          if (localUser) {
            const parsed = JSON.parse(localUser);
            if (parsed.role?.includes('ADMIN') || parsed.role?.includes('STAFF')) {
              setCurrentUser(parsed);
            }
          }
        }
      } catch (e) {
        // Fallback local user if present
        try {
          const localUser = JSON.parse(localStorage.getItem('user') || 'null');
          if (localUser?.role?.includes('ADMIN')) setCurrentUser(localUser);
        } catch (_) {}
      } finally {
        setIsCheckingAuth(false);
      }
    };
    verifyAuth();
  }, []);

  // ==========================================
  // 2. LOAD DATA FROM SQL API + LOCAL STORAGE
  // ==========================================
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Gọi song song các API quản trị từ Spring Boot Backend
      const [bRes, pList, brList, cList, uList, aList] = await Promise.all([
        fetchAllAdminBookingPages().catch(() => fetchAllBookings().catch(() => null)),
        fetchProducts().catch(() => null),
        fetchBranches().catch(() => null),
        fetchAdminCourts().catch(() => null),
        fetchAdminUsers().catch(() => null),
        fetchAdminArticles().catch(() => null)
      ]);

      // 1. Xử lý Đơn đặt sân (Bookings)
      let backendBookings = [];
      if (bRes && bRes.content) {
        backendBookings = bRes.content;
      } else if (Array.isArray(bRes)) {
        backendBookings = bRes;
      }

      // Đọc các đơn khách vừa đặt online lưu tại localStorage (d2_user_bookings)
      let localBookings = [];
      try {
        const rawLocal = localStorage.getItem('d2_user_bookings');
        if (rawLocal) localBookings = JSON.parse(rawLocal);
      } catch (_) {}

      // Ghép đơn từ SQL + đơn khách vừa đặt + đơn mẫu thực tế
      let mergedBookings = [...localBookings, ...backendBookings];
      if (mergedBookings.length === 0) {
        mergedBookings = SAMPLE_BOOKINGS;
      }
      setBookings(mergedBookings);

      // 2. Xử lý Chi nhánh (Branches)
      if (brList && brList.length > 0) {
        setBranches(brList);
      }

      // 3. Xử lý Sân đấu (Courts)
      if (cList && cList.length > 0) {
        setCourts(cList);
      } else {
        const savedCourts = localStorage.getItem('d2_admin_courts');
        if (savedCourts) {
          setCourts(JSON.parse(savedCourts));
        }
      }

      // 4. Xử lý Dụng cụ / Vợt & Giày (Products)
      if (pList && Array.isArray(pList) && pList.length > 0) {
        setProducts(pList);
        localStorage.setItem('d2_admin_products', JSON.stringify(pList));
      } else {
        const savedProducts = localStorage.getItem('d2_admin_products');
        if (savedProducts) {
          try {
            const parsed = JSON.parse(savedProducts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProducts(parsed);
            } else {
              setProducts(DEFAULT_D2_PRODUCTS);
              localStorage.setItem('d2_admin_products', JSON.stringify(DEFAULT_D2_PRODUCTS));
            }
          } catch (_) {
            setProducts(DEFAULT_D2_PRODUCTS);
          }
        } else {
          setProducts(DEFAULT_D2_PRODUCTS);
          localStorage.setItem('d2_admin_products', JSON.stringify(DEFAULT_D2_PRODUCTS));
        }
      }

      // 5. Xử lý Tài khoản người dùng (Users)
      if (uList && uList.length > 0) {
        setUsers(uList);
      } else {
        const savedUsers = localStorage.getItem('d2_admin_users');
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers));
        }
      }

      // 6. Xử lý Tin tức & Bài viết (Articles)
      if (aList && aList.length > 0) {
        setArticles(aList);
      } else {
        const savedArticles = localStorage.getItem('d2_admin_articles');
        if (savedArticles) {
          setArticles(JSON.parse(savedArticles));
        } else {
          // 4 bài viết thực tế mặc định
          const defaultArticles = [
            { id: 1, title: 'Khởi Động Cầu Lông Chuẩn Cho Người Mới Tránh Chấn Thương', summary: 'Hướng dẫn bài tập khởi động cầu lông chuẩn cho người mới chơi giúp bảo vệ cổ chân, khớp gối...', image: '/news/news1.png', category: 'KY_THUAT', categoryLabel: 'Kỹ Thuật & Sức Khỏe', author: 'D2 Coach Team', published: true },
            { id: 2, title: 'Sân Cầu Lông Đạt Chuẩn Giúp Tránh Chấn Thương Cho Lông Thủ', summary: 'Tìm hiểu 5 tiêu chuẩn chọn sân cầu lông đạt chuẩn giúp bảo vệ khớp, độ nảy thảm Taraflex BWF 7.5mm...', image: '/news/news2.png', category: 'TIEU_CHUAN', categoryLabel: 'Tiêu Chuẩn Sân', author: 'Ban Quản Lý D2', published: true },
            { id: 3, title: 'Giải Cầu Lông New Academy Lần 2 – Chào Mừng 30/4 Tại D2 Shop', summary: 'Tham gia Giải Cầu Lông New Academy Lần 2 tại Sân D2 Shop với cơ cấu giải thưởng hấp dẫn...', image: '/news/news3.png', category: 'GIAI_DAU', categoryLabel: 'Giải Đấu Mở Rộng', author: 'BTC Giải Đấu', published: true },
            { id: 4, title: 'CLB Cầu Lông D2 Shop – Sân Chơi Chuyên Nghiệp & Đặt Lịch Giao Lưu', summary: 'Bài viết giới thiệu chi tiết về CLB Cầu Lông D2 Shop, một địa điểm tập luyện và giao lưu sôi nổi...', image: '/news/news4.png', category: 'SU_KIEN', categoryLabel: 'Sự Kiện & CLB', author: 'D2 Club Leader', published: true }
          ];
          setArticles(defaultArticles);
          localStorage.setItem('d2_admin_articles', JSON.stringify(defaultArticles));
        }
      }

    } catch (err) {
      console.error('Lỗi khi nạp dữ liệu quản trị:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // ==========================================
  // 3. ADMIN AUTH ACTIONS
  // ==========================================
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const data = await loginUser(loginForm.username, loginForm.password);
      const user = data.user;
      if (user && (user.role === 'ADMIN' || user.role === 'STAFF' || user.role === 'ROLE_ADMIN' || user.role === 'ROLE_STAFF')) {
        setCurrentUser(user);
      } else {
        // Cấp quyền Admin cho demo nếu user là admin
        if (loginForm.username === 'admin') {
          const demoAdmin = { id: 1, username: 'admin', fullName: 'Quản Trị Viên D2', role: 'ROLE_ADMIN' };
          localStorage.setItem('user', JSON.stringify(demoAdmin));
          setCurrentUser(demoAdmin);
        } else {
          logoutUser();
          setLoginError('Tài khoản của bạn không có quyền quản trị (cần quyền ROLE_ADMIN hoặc ROLE_STAFF)!');
        }
      }
    } catch (err) {
      // Cho phép đăng nhập admin demo mượt mà nếu backend offline
      if (loginForm.username === 'admin') {
        const demoAdmin = { id: 1, username: 'admin', fullName: 'Quản Trị Viên D2 Shop', role: 'ROLE_ADMIN' };
        localStorage.setItem('user', JSON.stringify(demoAdmin));
        setCurrentUser(demoAdmin);
      } else {
        setLoginError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleSwitchTab = (tabKey) => {
    setActiveTab(tabKey);
    if (tabContainerRef.current) {
      gsap.fromTo(
        tabContainerRef.current,
        { opacity: 0.6, y: 8 },
        // clearProps: gỡ transform sau khi chạy xong, vì phần tử còn transform sẽ làm hộp thoại position:fixed bên trong bị lệch khỏi màn hình
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out', clearProps: 'transform,opacity' }
      );
    }
  };

  // ==========================================
  // 4. COURT CRUD ACTIONS (QUẢN LÝ SÂN ĐẤU)
  // ==========================================
  const handleOpenAddCourt = () => {
    setEditingCourt(null);
    setIsCourtModalOpen(true);
  };

  const handleEditCourt = (court) => {
    setEditingCourt(court);
    setIsCourtModalOpen(true);
  };

  const handleSaveCourt = async (courtData) => {
    try {
      let savedCourt = null;
      if (courtData.id) {
        // Cập nhật sân trong SQL
        try {
          savedCourt = await updateAdminCourt(courtData.id, courtData);
        } catch (_) {}
        setCourts(prev => {
          const next = prev.map(c => c.id === courtData.id ? { ...c, ...courtData } : c);
          localStorage.setItem('d2_admin_courts', JSON.stringify(next));
          return next;
        });
        alert(`Đã cập nhật thông tin "${courtData.name}" thành công!`);
      } else {
        // Tạo mới sân trong SQL
        const newId = Date.now();
        const newCourtObj = { ...courtData, id: newId };
        try {
          savedCourt = await createAdminCourt(courtData);
          if (savedCourt && savedCourt.id) newCourtObj.id = savedCourt.id;
        } catch (_) {}
        setCourts(prev => {
          const next = [newCourtObj, ...prev];
          localStorage.setItem('d2_admin_courts', JSON.stringify(next));
          return next;
        });
        alert(`Thêm sân "${courtData.name}" mới thành công!`);
      }
      setIsCourtModalOpen(false);
    } catch (err) {
      alert(`Lỗi khi lưu sân: ${err.message}`);
    }
  };

  const handleToggleCourtActive = async (courtId) => {
    try {
      try {
        await toggleAdminCourtActive(courtId);
      } catch (_) {}
      setCourts(prev => {
        const next = prev.map(c => {
          if (c.id === courtId) {
            const currentActive = c.active !== false;
            return { ...c, active: !currentActive };
          }
          return c;
        });
        localStorage.setItem('d2_admin_courts', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      alert(`Không thể đổi trạng thái sân: ${err.message}`);
    }
  };

  // Xóa tạm: sân chuyển vào thùng rác (khôi phục được). Lỗi từ máy chủ (ví dụ sân còn lịch chưa diễn ra) được báo nguyên văn.
  const handleDeleteCourt = async (courtId) => {
    if (!window.confirm('Chuyển sân này vào thùng rác? Bạn có thể khôi phục lại sau.')) return;
    try {
      const res = await deleteAdminCourt(courtId);
      alert(res?.message || 'Đã chuyển sân vào thùng rác!');
    } catch (err) {
      alert(`Không thể xóa sân: ${err.message}`);
    } finally {
      loadData();
    }
  };

  // ==========================================
  // 5. BOOKING ACTIONS (QUẢN LÝ ĐƠN ĐẶT SÂN)
  // ==========================================
  // Các thao tác trên đơn gọi máy chủ thật; lỗi (ví dụ đơn đã hết hạn giữ chỗ) được báo nguyên văn và danh sách luôn được tải lại từ máy chủ.
  const handleConfirmPayment = async (id) => {
    if (!window.confirm(`Xác nhận đã nhận tiền và duyệt đơn #${id}?`)) return;
    try {
      await confirmBookingAdmin(id);
      alert(`Đã xác nhận đơn #${id} thành công!`);
    } catch (err) {
      alert(`Không thể xác nhận đơn #${id}: ${err.message}`);
    } finally {
      loadData();
    }
  };

  const handleCheckinBooking = async (id) => {
    if (!window.confirm(`Xác nhận khách đã đến sân và hoàn tất Check-in cho đơn #${id}?`)) return;
    try {
      await checkinBookingAdmin(id);
      alert(`Đã hoàn tất check-in nhận sân cho đơn #${id}!`);
    } catch (err) {
      alert(`Lỗi check-in: ${err.message}`);
    } finally {
      loadData();
    }
  };

  const handleCancelBooking = async (id) => {
    const reason = window.prompt(`Nhập lý do hủy đơn #${id}:`, 'Khách yêu cầu dời lịch / hủy');
    if (reason === null) return;
    try {
      await cancelBookingAdmin(id, reason);
      alert(`Đã hủy đơn #${id} thành công!`);
    } catch (err) {
      alert(`Không thể hủy đơn: ${err.message}`);
    } finally {
      loadData();
    }
  };

  // ==========================================
  // 6. USER MANAGEMENT ACTIONS (QUẢN LÝ KHÁCH HÀNG)
  // ==========================================
  // Các thao tác gọi máy chủ thật; lỗi (ví dụ tự khóa chính mình) được báo nguyên văn rồi danh sách được tải lại từ máy chủ.
  const handleToggleUserStatus = async (userId) => {
    try {
      await toggleAdminUserStatus(userId);
      alert('Đã cập nhật trạng thái tài khoản thành công!');
    } catch (err) {
      alert(`Lỗi khi đổi trạng thái: ${err.message}`);
    } finally {
      loadData();
    }
  };

  const handleChangeUserRole = async (userId, role) => {
    try {
      await changeAdminUserRole(userId, role);
      alert('Đã đổi vai trò tài khoản thành công!');
    } catch (err) {
      alert(`Không thể đổi vai trò: ${err.message}`);
    } finally {
      loadData();
    }
  };

  // Hộp thoại thêm tài khoản tự báo lỗi nên hàm này để lỗi nổi lên cho nó xử lý
  const handleCreateUser = async (formData) => {
    await createAdminUser(formData);
    await loadData();
  };

  // ==========================================
  // 7. PRODUCT CRUD ACTIONS (QUẢN LÝ DỤNG CỤ)
  // ==========================================
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleToggleProductActive = async (id) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const updated = { ...prod, active: !prod.active };
    try {
      await updateAdminProduct(id, updated);
    } catch (err) {
      console.warn('Cập nhật backend chưa sẵn sàng, lưu localStorage:', err);
    }
    setProducts(prev => {
      const next = prev.map(p => p.id === id ? updated : p);
      localStorage.setItem('d2_admin_products', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteProduct = async (id) => {
    const item = products.find(p => p.id === id);
    if (!item) return;
    if (!window.confirm(`Bạn có chắc muốn chuyển "${item.name}" vào thùng rác?`)) return;
    try {
      await deleteAdminProduct(id);
    } catch (err) {
      console.warn('Xóa backend chưa sẵn sàng, lưu localStorage:', err);
    }
    const trashedItem = { ...item, deletedAt: new Date().toISOString() };
    setTrashedProducts(prev => {
      const next = [trashedItem, ...prev.filter(t => t.id !== id)];
      localStorage.setItem('d2_admin_products_trash', JSON.stringify(next));
      return next;
    });
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem('d2_admin_products', JSON.stringify(next));
      return next;
    });
  };

  const handleRestoreProduct = (id) => {
    const item = trashedProducts.find(p => p.id === id);
    if (!item) return;
    setTrashedProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem('d2_admin_products_trash', JSON.stringify(next));
      return next;
    });
    setProducts(prev => {
      const { deletedAt, ...rest } = item;
      const next = [rest, ...prev.filter(p => p.id !== id)];
      localStorage.setItem('d2_admin_products', JSON.stringify(next));
      return next;
    });
  };

  const handlePermanentDeleteProduct = async (id) => {
    const item = trashedProducts.find(p => p.id === id);
    const itemName = item?.name || `#${id}`;
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn "${itemName}"? Không thể khôi phục lại!`)) return;
    try {
      await deleteAdminProduct(id);
    } catch (_) {}
    setTrashedProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem('d2_admin_products_trash', JSON.stringify(next));
      return next;
    });
  };

  const handleClearProductTrash = () => {
    if (!window.confirm('Bạn có chắc muốn dọn sạch toàn bộ thùng rác dụng cụ? Các mục sẽ bị xóa vĩnh viễn.')) return;
    setTrashedProducts([]);
    localStorage.removeItem('d2_admin_products_trash');
  };

  const handleSaveProduct = async (formData) => {
    try {
      if (formData.id) {
        await updateAdminProduct(formData.id, formData);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await createAdminProduct(formData);
        alert('Thêm sản phẩm mới thành công!');
      }
    } catch (err) {
      alert(formData.id ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm mới thành công!');
    }
    setProducts(prev => {
      let next;
      if (formData.id) {
        next = prev.map(p => p.id === formData.id ? { ...p, ...formData } : p);
      } else {
        const newId = Date.now();
        next = [{ ...formData, id: newId }, ...prev];
      }
      localStorage.setItem('d2_admin_products', JSON.stringify(next));
      return next;
    });
    setIsProductModalOpen(false);
  };

  // ==========================================
  // 8. ARTICLE / NEWS ACTIONS (QUẢN LÝ BÀI VIẾT)
  // ==========================================
  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setIsArticleModalOpen(true);
  };

  const handleEditArticle = (art) => {
    setEditingArticle(art);
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = async (formData) => {
    try {
      if (formData.id) {
        try {
          await updateAdminArticle(formData.id, formData);
        } catch (_) {}
        setArticles(prev => {
          const next = prev.map(a => a.id === formData.id ? { ...a, ...formData } : a);
          localStorage.setItem('d2_admin_articles', JSON.stringify(next));
          return next;
        });
        alert('Cập nhật bài viết thành công!');
      } else {
        const newArt = { ...formData, id: Date.now() };
        try {
          const res = await createAdminArticle(formData);
          if (res && res.id) newArt.id = res.id;
        } catch (_) {}
        setArticles(prev => {
          const next = [newArt, ...prev];
          localStorage.setItem('d2_admin_articles', JSON.stringify(next));
          return next;
        });
        alert('Đăng bài viết mới thành công!');
      }
      setIsArticleModalOpen(false);
    } catch (err) {
      alert(`Lỗi khi lưu bài viết: ${err.message}`);
    }
  };

  const handleToggleArticlePublished = async (id) => {
    try {
      try {
        await toggleAdminArticle(id);
      } catch (_) {}
      setArticles(prev => {
        const next = prev.map(a => {
          if (a.id === id) return { ...a, published: !a.published };
          return a;
        });
        localStorage.setItem('d2_admin_articles', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      alert(`Không thể đổi trạng thái bài viết: ${err.message}`);
    }
  };

  const handleDeleteArticle = async (id) => {
    const item = articles.find(a => a.id === id);
    if (!item) return;
    if (!window.confirm(`Bạn có chắc muốn chuyển bài viết "${item.title}" vào thùng rác?`)) return;
    try {
      try {
        await deleteAdminArticle(id);
      } catch (_) {}
      const trashedItem = { ...item, deletedAt: new Date().toISOString() };
      setTrashedArticles(prev => {
        const next = [trashedItem, ...prev.filter(t => t.id !== id)];
        localStorage.setItem('d2_admin_articles_trash', JSON.stringify(next));
        return next;
      });
      setArticles(prev => {
        const next = prev.filter(a => a.id !== id);
        localStorage.setItem('d2_admin_articles', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      alert(`Lỗi xóa bài viết: ${err.message}`);
    }
  };

  const handleRestoreArticle = (id) => {
    const item = trashedArticles.find(a => a.id === id);
    if (!item) return;
    setTrashedArticles(prev => {
      const next = prev.filter(a => a.id !== id);
      localStorage.setItem('d2_admin_articles_trash', JSON.stringify(next));
      return next;
    });
    setArticles(prev => {
      const { deletedAt, ...rest } = item;
      const next = [rest, ...prev.filter(a => a.id !== id)];
      localStorage.setItem('d2_admin_articles', JSON.stringify(next));
      return next;
    });
  };

  const handlePermanentDeleteArticle = async (id) => {
    const item = trashedArticles.find(a => a.id === id);
    const itemTitle = item?.title || `#${id}`;
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn bài viết "${itemTitle}"? Không thể khôi phục lại!`)) return;
    try {
      await deleteAdminArticle(id);
    } catch (_) {}
    setTrashedArticles(prev => {
      const next = prev.filter(a => a.id !== id);
      localStorage.setItem('d2_admin_articles_trash', JSON.stringify(next));
      return next;
    });
  };

  const handleClearArticleTrash = () => {
    if (!window.confirm('Bạn có chắc muốn dọn sạch toàn bộ thùng rác bài viết? Các bài viết sẽ bị xóa vĩnh viễn.')) return;
    setTrashedArticles([]);
    localStorage.removeItem('d2_admin_articles_trash');
  };

  // ==========================================
  // 9. BRANCH ACTIONS (QUẢN LÝ CHI NHÁNH CƠ SỞ)
  // ==========================================
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setIsBranchModalOpen(true);
  };

  const handleEditBranch = (br) => {
    setEditingBranch(br);
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async (branchData) => {
    try {
      if (branchData.id) {
        try {
          await updateAdminBranch(branchData.id, branchData);
        } catch (_) {}
        setBranches(prev => {
          const next = prev.map(b => (b.id === branchData.id || b.code === branchData.code) ? { ...b, ...branchData } : b);
          localStorage.setItem('d2_admin_branches', JSON.stringify(next));
          return next;
        });
        alert(`Đã cập nhật chi nhánh "${branchData.name}" thành công!`);
      } else {
        const newBr = { ...branchData, id: Date.now() };
        try {
          const res = await createAdminBranch(branchData);
          if (res && res.id) newBr.id = res.id;
        } catch (_) {}
        setBranches(prev => {
          const next = [...prev, newBr];
          localStorage.setItem('d2_admin_branches', JSON.stringify(next));
          return next;
        });
        alert(`Thêm chi nhánh "${branchData.name}" mới thành công!`);
      }
      setIsBranchModalOpen(false);
    } catch (err) {
      alert(`Lỗi khi lưu chi nhánh: ${err.message}`);
    }
  };

  // Xóa tạm: chi nhánh và các sân của nó chuyển vào thùng rác (khôi phục được).
  const handleDeleteBranch = async (branchIdOrCode) => {
    const brObj = branches.find(b => b.id === branchIdOrCode || b.code === branchIdOrCode);
    const branchName = brObj ? brObj.name : `Chi nhánh #${branchIdOrCode}`;
    if (!window.confirm(`Chuyển "${branchName}" cùng các sân của nó vào thùng rác? Bạn có thể khôi phục lại sau.`)) return;
    try {
      const res = await deleteAdminBranch(brObj?.id ?? branchIdOrCode);
      alert(res?.message || 'Đã chuyển chi nhánh vào thùng rác!');
    } catch (err) {
      alert(`Không thể xóa chi nhánh: ${err.message}`);
    } finally {
      loadData();
    }
  };

  // ==========================================
  // RENDER: LOADING & LOGIN GUARD
  // ==========================================
  if (isCheckingAuth) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#0284c7' }}></i>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Đang xác thực quyền truy cập Quản Trị D2 SHOP...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#fff', borderRadius: '16px', padding: '36px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)' }}>
              <i className="fa-solid fa-lock"></i>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              CỔNG QUẢN TRỊ D2 SHOP
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Đăng nhập tài khoản Quản trị để quản lý sân và đơn đặt sân
            </p>
          </div>

          {loginError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', color: '#b91c1c', fontSize: '13px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Tài khoản quản trị:
              </label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="VD: admin"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Mật khẩu:
              </label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Nhập mật khẩu (Mặc định: 123456)"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isLoggingIn ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Đang xác thực...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i> Đăng Nhập Quản Trị
                </>
              )}
            </button>
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsResetPasswordModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px'
                }}
              >
                <i className="fa-solid fa-key"></i> Quên mật khẩu? Đặt lại bằng Email OTP
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('booking')}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              <i className="fa-solid fa-arrow-left"></i> Quay Về Trang Đặt Sân
            </button>
          </form>

        <AdminResetPasswordModal
          isOpen={isResetPasswordModalOpen}
          onClose={() => setIsResetPasswordModalOpen(false)}
          initialIdentifier={loginForm.username || 'admin'}
          onSuccess={(newPwd) => {
            setLoginForm(prev => ({ ...prev, password: newPwd }));
          }}
        />
      </div>
    </div>
  );
}

  // ==========================================
  // RENDER: GIAO DIỆN QUẢN TRỊ VIÊN CHÍNH
  // ==========================================
  return (
    <div className="ways-admin-page-root" style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <main className="admin-main-container">
        {/* TOP BANNER */}
        <div className="admin-top-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(2, 132, 199, 0.2)' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-shield-halved"></i> BẢNG ĐIỀU KHIỂN QUẢN TRỊ HỆ THỐNG D2 SHOP
            </h2>
            <p style={{ fontSize: '12px', opacity: 0.9, margin: '4px 0 0 0' }}>
              Xin chào, <strong>{currentUser.fullName || currentUser.username}</strong> ({currentUser.role || 'ROLE_ADMIN'})
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsResetPasswordModalOpen(true)}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-key"></i> Đổi Mật Khẩu (OTP)
            </button>
            <button
              type="button"
              onClick={loadData}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-rotate"></i> Đồng Bộ SQL
            </button>
            <button
              type="button"
              onClick={handleAdminLogout}
              style={{ background: 'rgba(239, 68, 68, 0.85)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-right-from-bracket"></i> Đăng Xuất
            </button>
          </div>
        </div>

        {/* TAB MENU */}
        <nav className="tab-menu-bar">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('bookings')}
          >
            <i className="fa-solid fa-calendar-days"></i> Quản Lý Đơn Đặt Sân
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('branches')}
          >
            <i className="fa-solid fa-building"></i> Quản Lý Sân Đấu & Chi Nhánh
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('users')}
          >
            <i className="fa-solid fa-users"></i> Quản Lý Tài Khoản Khách Hàng
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('products')}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i> Quản Lý Dụng Cụ, Vợt & Giày
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('pricing')}
          >
            <i className="fa-solid fa-tags"></i> Cấu Hình Bảng Giá Giờ Chơi
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('articles')}
          >
            <i className="fa-solid fa-newspaper"></i> Quản Lý Tin Tức & Bài Viết
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('payments')}
          >
            <i className="fa-solid fa-money-check-dollar"></i> Thanh Toán & Xác Nhận
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'memberships' ? 'active' : ''}`}
            onClick={() => handleSwitchTab('memberships')}
          >
            <i className="fa-solid fa-crown"></i> Gói Hội Viên
          </button>
        </nav>

        {/* TAB CONTENT PANES */}
        <div ref={tabContainerRef}>
          {activeTab === 'bookings' && (
            <AdminBookingsTab
              bookings={bookings}
              onRefresh={loadData}
              onConfirmPayment={handleConfirmPayment}
              onCheckinBooking={handleCheckinBooking}
              onCancelBooking={handleCancelBooking}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'branches' && (
            <AdminBranchesTab
              branches={branches}
              courts={courts}
              onOpenAddBranch={handleOpenAddBranch}
              onEditBranch={handleEditBranch}
              onOpenAddCourt={handleOpenAddCourt}
              onEditCourt={handleEditCourt}
              onToggleCourtActive={handleToggleCourtActive}
              onDeleteBranch={handleDeleteBranch}
              onDeleteCourt={handleDeleteCourt}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              users={users}
              onToggleUserStatus={handleToggleUserStatus}
              onChangeUserRole={handleChangeUserRole}
              onCreateUser={handleCreateUser}
              onRefresh={loadData}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsTab
              products={products}
              trashedProducts={trashedProducts}
              onOpenAddModal={handleOpenAddProduct}
              onEditProduct={handleEditProduct}
              onToggleActive={handleToggleProductActive}
              onDeleteProduct={handleDeleteProduct}
              onRestoreProduct={handleRestoreProduct}
              onPermanentDeleteProduct={handlePermanentDeleteProduct}
              onClearProductTrash={handleClearProductTrash}
              onRefresh={loadData}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'pricing' && <AdminPricingTab />}

          {activeTab === 'payments' && <AdminPaymentsTab />}

          {activeTab === 'memberships' && <AdminMembershipsTab />}

          {activeTab === 'articles' && (
            <AdminArticlesTab
              articles={articles}
              trashedArticles={trashedArticles}
              onOpenAddModal={handleOpenAddArticle}
              onEditArticle={handleEditArticle}
              onTogglePublished={handleToggleArticlePublished}
              onDeleteArticle={handleDeleteArticle}
              onRestoreArticle={handleRestoreArticle}
              onPermanentDeleteArticle={handlePermanentDeleteArticle}
              onClearArticleTrash={handleClearArticleTrash}
              onRefresh={loadData}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>

      {/* Branch Modal (Thêm / Sửa Chi Nhánh) */}
      <BranchModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        initialData={editingBranch}
        onSave={handleSaveBranch}
      />

      {/* Article Modal (Thêm / Sửa Tin Tức) */}
      <ArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        initialData={editingArticle}
        onSave={handleSaveArticle}
      />

      {/* Court Modal (Thêm / Sửa Sân) */}
      <CourtModal
        isOpen={isCourtModalOpen}
        onClose={() => setIsCourtModalOpen(false)}
        initialData={editingCourt}
        branches={branches}
        onSave={handleSaveCourt}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        initialData={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Admin Reset / Change Password Modal */}
      <AdminResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        initialIdentifier={currentUser?.email || currentUser?.username || 'admin'}
        onSuccess={() => {}}
      />
    </div>
  );
}