/**
 * Ways Station Badminton - API Client
 * Kết nối REST API Spring Boot (cổng 8080) với chế độ Fallback thông minh
 */
import {
  BRANCHES as MOCK_BRANCHES,
  TIME_SLOTS as MOCK_TIME_SLOTS,
  COURTS_NVL as MOCK_COURTS,
  DEFAULT_SLOT_STATUS_MAP,
  SERVICES_CATEGORIES
} from '../data/courtData';

const API_BASE = '/api';

// Biến theo dõi trạng thái kết nối Backend
let isBackendLive = false;

export const getBackendStatus = () => isBackendLive;

/**
 * Kiểm tra kết nối tới Spring Boot backend
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/booking/branches`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      isBackendLive = true;
      return true;
    }
  } catch (err) {
    // Backend chưa chạy
    isBackendLive = false;
  }
  return false;
}

/**
 * Lấy danh sách chi nhánh
 */
export async function fetchBranches() {
  try {
    const res = await fetch(`${API_BASE}/booking/branches`, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        isBackendLive = true;
        return data;
      }
    }
  } catch (err) {
    // Fallback mock data
  }
  return MOCK_BRANCHES;
}

/**
 * Lấy dữ liệu ma trận lịch đặt sân theo chi nhánh & ngày
 */
export async function fetchMatrixData(branchCode = 'NVL', dateStr) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  try {
    const res = await fetch(`${API_BASE}/booking/matrix?branch=${encodeURIComponent(branchCode)}&date=${encodeURIComponent(targetDate)}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      isBackendLive = true;
      return {
        ...data,
        isLiveBackend: true
      };
    }
  } catch (err) {
    // Fallback to local matrix data
  }

  // Tạo cấu trúc dữ liệu tương thích hoàn toàn với MatrixResponseDto của backend
  const currentBranch = MOCK_BRANCHES.find((b) => b.code === branchCode) || MOCK_BRANCHES[0];
  const numCourts = currentBranch?.totalCourts || (branchCode === 'NQA' ? 6 : branchCode === 'HB' ? 2 : branchCode === 'DQII' || branchCode === 'DQH' ? 4 : 7);
  
  const dynamicCourts = Array.from({ length: numCourts }, (_, i) => ({
    id: i + 1,
    courtNumber: i + 1,
    name: `Sân ${i + 1}`,
    courtGroup: `Cụm ${Math.floor(i / 2) + 1}`,
    type: 'Tiêu chuẩn BWF',
    surface: 'Thảm Taraflex',
    isVip: i === numCourts - 1 && numCourts > 4,
    active: true
  }));

  // Tạo một số slot đã đặt mẫu đẹp mắt theo sơ đồ chi nhánh
  const dynamicStatusMap = { ...DEFAULT_SLOT_STATUS_MAP };
  if (branchCode === 'NQA') {
    // Sân 1: các slot trưa chiều đã đặt
    [8, 9, 13, 14, 15, 16, 17].forEach(sId => {
      dynamicStatusMap[`1_${sId}`] = { status: 'BOOKED', price: 70000 };
    });
    // Sân 2: các slot sáng
    [8, 9, 10].forEach(sId => {
      dynamicStatusMap[`2_${sId}`] = { status: 'BOOKED', price: 70000 };
    });
    // Sân 4: slot trưa
    [9, 10, 13, 14].forEach(sId => {
      dynamicStatusMap[`4_${sId}`] = { status: 'BOOKED', price: 70000 };
    });
  }

  return {
    currentBranch,
    allBranches: MOCK_BRANCHES,
    selectedDate: targetDate,
    courts: dynamicCourts,
    timeSlots: MOCK_TIME_SLOTS,
    slotStatusMap: dynamicStatusMap,
    isLiveBackend: false
  };
}

/**
 * Tạo đơn đặt sân
 */
export async function createBooking(bookingData) {
  try {
    const stored = getStoredUser();
    const payload = {
      ...bookingData,
      userId: bookingData.userId || (stored ? stored.id : null)
    };

    const res = await fetch(`${API_BASE}/booking/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const result = await res.json();
      isBackendLive = true;
      return result;
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Không thể tạo đơn đặt sân');
    }
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    // Giả lập lưu đơn khi ở chế độ offline
    const randomCode = 'WAY-' + bookingData.bookingDate.replace(/-/g, '') + '-' + (Math.floor(1000 + Math.random() * 9000));
    return {
      success: true,
      message: 'Đặt sân thành công (Chế độ mô phỏng chuẩn Backend)',
      bookingCode: randomCode,
      customerName: bookingData.customerName,
      bookingDate: bookingData.bookingDate,
      isMock: true
    };
  }
}

/**
 * Bật/tắt trạng thái Cần Pass Slot
 */
export async function togglePassSlot(detailId, contactPhone) {
  try {
    const params = new URLSearchParams();
    params.append('detailId', detailId);
    if (contactPhone) params.append('contactPhone', contactPhone);

    const res = await fetch(`${API_BASE}/booking/pass-slot?${params.toString()}`, {
      method: 'POST',
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Giả lập offline
  }
  return { success: true, message: 'Đã cập nhật trạng thái pass sân!' };
}

/**
 * Lấy tất cả đơn đặt sân (dành cho Admin / Tra cứu)
 */
export async function fetchAllBookings() {
  try {
    const res = await fetch(`${API_BASE}/booking/all`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
  }

  // Danh sách mẫu
  return [
    {
      id: 5001,
      bookingCode: 'WAY-20261009-5001',
      customerName: 'Nguyễn Văn Tuấn',
      customerPhone: '0909 123 456',
      customerEmail: 'tuan.badminton@gmail.com',
      bookingDate: '2026-10-09',
      branch: { name: 'Ways Station NVL', code: 'NVL' },
      totalPrice: 840000,
      totalHours: 7,
      status: 'CONFIRMED',
      paymentMethod: 'VIETQR',
      notes: 'Khách đặt ca cố định chiều tối'
    },
    {
      id: 5002,
      bookingCode: 'WAY-20261009-5002',
      customerName: 'Trần Minh Đức',
      customerPhone: '0912 345 678',
      customerEmail: 'duc.tm@gmail.com',
      bookingDate: '2026-10-09',
      branch: { name: 'Ways Station NVL', code: 'NVL' },
      totalPrice: 240000,
      totalHours: 2,
      status: 'CONFIRMED',
      paymentMethod: 'VIETQR',
      notes: 'Giao lưu CLB Cầu Lông'
    }
  ];
}

/**
 * Hủy đơn đặt sân
 */
export async function cancelBooking(bookingId) {
  try {
    const res = await fetch(`${API_BASE}/booking/cancel/${bookingId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
  }
  return { success: true, message: 'Đã hủy đơn đặt sân thành công (Mô phỏng)!' };
}

/**
 * Lấy danh sách sản phẩm / dịch vụ thuê dụng cụ
 */
export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    // Offline
  }
  return null;
}

// ==========================================================
// AUTHENTICATION APIs (ĐĂNG KÝ / ĐĂNG NHẬP / HỒ SƠ)
// ==========================================================

/**
 * Đăng nhập tài khoản (username / phone / email)
 */
export async function loginUser(identifier, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('currentUser', JSON.stringify(data));
      return data;
    }
    throw new Error(data.message || 'Đăng nhập không thành công');
  } catch (err) {
    throw err;
  }
}

/**
 * Đăng ký tài khoản mới
 */
export async function registerUser(userData) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('currentUser', JSON.stringify(data));
      return data;
    }
    throw new Error(data.message || 'Đăng ký không thành công');
  } catch (err) {
    throw err;
  }
}

/**
 * Lấy thông tin tài khoản hiện tại từ Backend
 */
export async function fetchCurrentUserProfile(userId) {
  try {
    const res = await fetch(`${API_BASE}/auth/me?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    // Offline
  }
  return null;
}

/**
 * Đăng xuất
 */
export function logoutUser() {
  localStorage.removeItem('currentUser');
}

/**
 * Lấy user đã lưu trong localStorage
 */
export function getStoredUser() {
  try {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

// ==========================================================
// MEMBERSHIP APIs (GÓI HỘI VIÊN & ĐẶC QUYỀN VIP)
// ==========================================================

/**
 * Lấy danh sách các gói hội viên VIP đang mở bán
 */
export async function fetchMembershipPackages() {
  try {
    const res = await fetch(`${API_BASE}/memberships/packages`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    // Fallback offline mock packages
  }
  return [
    {
      id: 1,
      code: 'SILVER',
      name: 'Hội Viên Bạc (Silver)',
      price: 199000,
      durationDays: 30,
      discountPercent: 5.0,
      badgeColor: '#0284c7',
      icon: 'fa-solid fa-medal',
      description: 'Gói khởi đầu tiết kiệm, đầy đủ tiện ích gửi đồ và khăn lạnh mỗi buổi tập',
      perks: 'Giảm 5% giá giờ chơi; Miễn phí gửi đồ tại quầy lễ tân; Tặng 1 khăn lạnh ướp hương mỗi buổi chơi; Giảm 10% khi mua nước căn tin'
    },
    {
      id: 2,
      code: 'GOLD',
      name: 'Hội Viên Vàng (Gold)',
      price: 499000,
      durationDays: 90,
      discountPercent: 8.0,
      badgeColor: '#f59e0b',
      icon: 'fa-solid fa-crown',
      description: 'Gói phổ biến nhất, tặng kèm dịch vụ tủ locker riêng, sấy khử khuẩn giày và ưu đãi căng vợt',
      perks: 'Giảm 8% giá giờ chơi; Miễn phí tủ locker riêng khi chơi; Tặng khăn tập & sấy khử khuẩn giày bằng UV 2 lần/tháng; Trợ giá 50% công căng vợt; Ưu tiên giữ ca giờ vàng'
    },
    {
      id: 3,
      code: 'DIAMOND',
      name: 'Kim Cương VIP (Diamond)',
      price: 1290000,
      durationDays: 365,
      discountPercent: 10.0,
      badgeColor: '#10b981',
      icon: 'fa-solid fa-gem',
      description: 'Đặc quyền VIP cao nhất, trọn gói gửi đồ qua đêm, căng vợt và chăm sóc giày chuyên nghiệp',
      perks: 'Giảm 10% giá giờ chơi (mức tối đa); Tủ đồ cá nhân riêng để vợt qua đêm; Miễn phí công căng cước vợt 6 lần/năm; Vệ sinh sấy khô khử khuẩn giày không giới hạn; Miễn phí set khăn tập & nước khoáng mỗi buổi'
    },
    {
      id: 4,
      code: 'STUDENT',
      name: 'Gói Sinh Viên Thần Tốc',
      price: 99000,
      durationDays: 30,
      discountPercent: 7.0,
      badgeColor: '#8b5cf6',
      icon: 'fa-solid fa-graduation-cap',
      description: 'Gói tiếp sức thể thao học đường với tiện ích gửi đồ an tâm và mượn vợt miễn phí',
      perks: 'Giảm 7% giá giờ chơi ca sáng & chiều (trước 16:30); Miễn phí gửi balo & tài liệu học tập; Miễn phí mượn vợt tập; Tặng khăn lạnh mỗi buổi'
    }
  ];
}

/**
 * Đăng ký / Mua gói hội viên
 */
export async function buyMembershipPackage(userId, packageId, paymentMethod = 'VIETQR', notes = '') {
  try {
    const res = await fetch(`${API_BASE}/memberships/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, packageId, paymentMethod, notes })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      // Cập nhật lại profile user trong localStorage
      await fetchCurrentUserProfile(userId);
      return data;
    }
    throw new Error(data.message || 'Không thể đăng ký gói hội viên');
  } catch (err) {
    throw err;
  }
}

/**
 * Lấy thông tin gói hội viên hiện tại của User
 */
export async function fetchUserActiveMembership(userId) {
  try {
    const res = await fetch(`${API_BASE}/memberships/user/${userId}/active`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
  }
  return { isMember: false };
}

/**
 * Lấy lịch sử mua gói hội viên của User
 */
export async function fetchUserMembershipHistory(userId) {
  try {
    const res = await fetch(`${API_BASE}/memberships/user/${userId}/history`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
  }
  return [];
}

/**
 * Lấy lịch sử đặt sân của User
 */
export async function fetchUserBookings(userId) {
  try {
    const res = await fetch(`${API_BASE}/booking/user/${userId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
  }
  return [];
}

/**
 * Cập nhật thông tin tài khoản cá nhân
 */
export async function updateUserProfile(userId, profileData) {
  try {
    const res = await fetch(`${API_BASE}/auth/profile?userId=${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('currentUser', JSON.stringify(data));
      return data;
    }
    throw new Error(data.message || 'Không thể cập nhật hồ sơ');
  } catch (err) {
    throw err;
  }
}

/**
 * Đổi mật khẩu
 */
export async function changeUserPassword(userId, passwordData) {
  try {
    const res = await fetch(`${API_BASE}/auth/change-password?userId=${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordData)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return data;
    }
    throw new Error(data.message || 'Không thể đổi mật khẩu');
  } catch (err) {
    throw err;
  }
}

/**
 * Admin: Lấy danh sách toàn bộ người dùng
 */
export async function fetchAllUsers() {
  try {
    const res = await fetch(`${API_BASE}/auth/users`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
  }
  return [];
}

// ==========================================================
// BRANCH & COURT CRUD APIs (CHI NHÁNH & SÂN ĐẤU)
// ==========================================================

export async function createBranch(branchData) {
  try {
    const res = await fetch(`${API_BASE}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData)
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể tạo chi nhánh');
  } catch (err) {
    throw err;
  }
}

export async function updateBranch(id, branchData) {
  try {
    const res = await fetch(`${API_BASE}/branches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData)
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể cập nhật chi nhánh');
  } catch (err) {
    throw err;
  }
}

export async function deleteBranch(id) {
  try {
    const res = await fetch(`${API_BASE}/branches/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function fetchCourts(branchCode, branchId) {
  try {
    let url = `${API_BASE}/courts`;
    if (branchCode) url += `?branchCode=${encodeURIComponent(branchCode)}`;
    else if (branchId) url += `?branchId=${branchId}`;

    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {
    // Offline
  }
  return [];
}

export async function createCourt(courtData) {
  try {
    const res = await fetch(`${API_BASE}/courts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courtData)
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể tạo sân mới');
  } catch (err) {
    throw err;
  }
}

export async function updateCourt(id, courtData) {
  try {
    const res = await fetch(`${API_BASE}/courts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courtData)
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể cập nhật sân');
  } catch (err) {
    throw err;
  }
}

export async function toggleCourtActive(id) {
  try {
    const res = await fetch(`${API_BASE}/courts/${id}/toggle`, { method: 'PATCH' });
    if (res.ok) return await res.json();
  } catch (err) {
    // Offline
  }
}

export async function deleteCourt(id) {
  try {
    const res = await fetch(`${API_BASE}/courts/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (err) {
    throw err;
  }
}

// ==========================================================
// ADMIN MEMBERSHIP APIs (QUẢN TRỊ GÓI HỘI VIÊN)
// ==========================================================

export async function fetchAllMembershipsAdmin() {
  try {
    const res = await fetch(`${API_BASE}/memberships/admin/all`);
    if (res.ok) return await res.json();
  } catch (err) {
    // Offline
  }
  return [];
}

export async function fetchAllPackagesAdmin() {
  try {
    const res = await fetch(`${API_BASE}/memberships/admin/packages`);
    if (res.ok) return await res.json();
  } catch (err) {
    // Offline
  }
  return [];
}

export async function createMembershipPackageAdmin(pkg) {
  try {
    const res = await fetch(`${API_BASE}/memberships/admin/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg)
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể tạo gói hội viên');
  } catch (err) {
    throw err;
  }
}

export async function updateMembershipPackageAdmin(id, pkg) {
  try {
    const res = await fetch(`${API_BASE}/memberships/admin/packages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg)
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể cập nhật gói hội viên');
  } catch (err) {
    throw err;
  }
}

export async function deleteMembershipPackageAdmin(id) {
  try {
    const res = await fetch(`${API_BASE}/memberships/admin/packages/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) return await res.json();
  } catch (err) {
    throw err;
  }
}

