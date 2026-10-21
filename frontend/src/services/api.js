/**
 * Ways Station Badminton - API Client
 * Kết nối REST API Spring Boot (Database V2)
 * Tự động gắn JWT Authorization header từ localStorage.
 * TUYỆT ĐỐI KHÔNG DÙNG MOCK FALLBACK trên các thao tác ghi dữ liệu (createBooking, cancel, buy, topup, transfer).
 */
import {
  BRANCHES as MOCK_BRANCHES,
  TIME_SLOTS as MOCK_TIME_SLOTS,
  COURTS_NVL as MOCK_COURTS,
  DEFAULT_SLOT_STATUS_MAP,
  SERVICES_CATEGORIES
} from '../data/courtData';

const API_BASE = '/api';

let isBackendLive = false;
export const getBackendStatus = () => isBackendLive;

// ==========================================
// TOKEN & AUTH STORAGE HELPERS
// ==========================================
export function getStoredToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  } catch (e) {
    console.error('Không thể lưu token vào localStorage:', e);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  } catch (e) {
    console.error('Không thể lưu user vào localStorage:', e);
  }
}

export function logoutUser() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (e) {
    console.error('Lỗi khi đăng xuất:', e);
  }
  window.dispatchEvent(new Event('auth:logout'));
}

/**
 * Universal fetch wrapper with Bearer token & error handling
 */
export async function authFetch(url, options = {}) {
  const fullUrl = url.startsWith('/') ? url : `${API_BASE}/${url}`;
  const headers = { ...(options.headers || {}) };

  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (!headers['Accept']) {
    headers['Accept'] = 'application/json';
  }

  const res = await fetch(fullUrl, {
    ...options,
    headers
  });

  if (res.status === 401) {
    // Phiên đăng nhập hết hạn hoặc không hợp lệ
    logoutUser();
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!');
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message = errData.message || res.statusText || `Lỗi yêu cầu (mã ${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = errData;
    throw error;
  }

  // Handle empty responses (204 No Content, etc.)
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  return null;
}

// ==========================================
// 1. AUTHENTICATION APIS
// ==========================================
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Tài khoản hoặc mật khẩu không chính xác');
  }

  const data = await res.json();
  if (data.token) {
    setStoredToken(data.token);
    setStoredUser(data.user);
    isBackendLive = true;
  }
  return data;
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(userData)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Đăng ký tài khoản thất bại');
  }

  const data = await res.json();
  if (data.token) {
    setStoredToken(data.token);
    setStoredUser(data.user);
  }
  return data;
}

export async function fetchCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const user = await authFetch('/api/auth/me');
    setStoredUser(user);
    return user;
  } catch (err) {
    return null;
  }
}

// ==========================================
// 2. HEALTH & CATALOG APIS (READ-ONLY WITH DEV FALLBACK)
// ==========================================
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
    isBackendLive = false;
  }
  return false;
}

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
    // Fallback to mock branches when backend offline
  }
  return MOCK_BRANCHES;
}

export async function fetchMatrixData(branchCode = 'NVL', dateStr) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  try {
    const res = await fetch(
      `${API_BASE}/booking/matrix?branch=${encodeURIComponent(branchCode)}&date=${encodeURIComponent(targetDate)}`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (res.ok) {
      const data = await res.json();
      isBackendLive = true;
      return {
        ...data,
        isLiveBackend: true
      };
    }
  } catch (err) {
    // Fallback to mock data when backend offline
  }

  const currentBranch = MOCK_BRANCHES.find((b) => b.code === branchCode) || MOCK_BRANCHES[0];
  return {
    currentBranch,
    allBranches: MOCK_BRANCHES,
    selectedDate: targetDate,
    courts: MOCK_COURTS,
    timeSlots: MOCK_TIME_SLOTS,
    slotStatusMap: { ...DEFAULT_SLOT_STATUS_MAP },
    isLiveBackend: false
  };
}

export async function fetchProducts(branchId) {
  try {
    const query = branchId ? `?branchId=${branchId}` : '';
    const res = await fetch(`${API_BASE}/products${query}`, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    // Fallback
  }
  return null;
}

export async function fetchMembershipPackages() {
  try {
    const res = await fetch(`${API_BASE}/memberships/packages`, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Fallback
  }
  return [];
}

// ==========================================
// 3. BOOKING WRITE APIS (ZERO MOCK FALLBACK)
// ==========================================
/**
 * Tạo đơn đặt sân (bắt buộc gọi Backend thật, ném lỗi rõ ràng nếu thất bại)
 */
export async function createBooking(bookingData) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/booking/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify(bookingData),
    signal: AbortSignal.timeout(8000)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message = errData.message || (res.status === 409 ? 'Khung giờ này đã có người đặt trước!' : 'Không thể tạo đơn đặt sân');
    const err = new Error(message);
    err.status = res.status;
    err.data = errData;
    throw err;
  }

  const result = await res.json();
  isBackendLive = true;
  return result;
}

/**
 * Tra cứu đơn đặt sân theo mã bookingCode
 */
export async function lookupBookingByCode(bookingCode) {
  const res = await fetch(`${API_BASE}/booking/code/${encodeURIComponent(bookingCode)}`);
  if (!res.ok) {
    throw new Error('Không tìm thấy đơn đặt sân với mã này');
  }
  return await res.json();
}

/**
 * Lấy tất cả đơn đặt sân (cho lookup/admin)
 */
export async function fetchAllBookings() {
  try {
    const token = getStoredToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/booking/all`, { headers, signal: AbortSignal.timeout(4500) });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
  }
  return [];
}

/**
 * Hủy đơn đặt sân (ZERO MOCK FALLBACK)
 */
export async function cancelBooking(bookingId) {
  const token = getStoredToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/booking/cancel/${bookingId}`, {
    method: 'DELETE',
    headers,
    signal: AbortSignal.timeout(5000)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Không thể hủy đơn đặt sân');
  }

  return await res.json();
}

// ==========================================
// 4. SLOT TRANSFERS / PASS SÂN APIS (ZERO MOCK FALLBACK)
// ==========================================
export async function fetchMarketTransfers(branchId, date) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (date) params.append('date', date);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/transfers/market${query}`, { signal: AbortSignal.timeout(4500) });
  if (res.ok) {
    return await res.json();
  }
  return [];
}

export async function listSlotForTransfer({ bookingDetailId, askingPrice, note }) {
  return await authFetch('/api/transfers/list', {
    method: 'POST',
    body: JSON.stringify({ bookingDetailId, askingPrice, note })
  });
}

export async function cancelSlotTransfer(transferId) {
  return await authFetch(`/api/transfers/${transferId}/cancel`, {
    method: 'POST'
  });
}

export async function claimSlotTransfer(transferId) {
  return await authFetch(`/api/transfers/${transferId}/claim`, {
    method: 'POST'
  });
}

export async function togglePassSlot(detailId, contactPhone) {
  const params = new URLSearchParams();
  params.append('detailId', detailId);
  if (contactPhone) params.append('contactPhone', contactPhone);

  const res = await fetch(`${API_BASE}/booking/pass-slot?${params.toString()}`, {
    method: 'POST',
    signal: AbortSignal.timeout(4000)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể cập nhật trạng thái pass sân');
  }
  return await res.json();
}

// ==========================================
// 5. MEMBERSHIP & WALLET APIS (ZERO MOCK FALLBACK)
// ==========================================
export async function fetchMyWalletBalance() {
  return await authFetch('/api/wallet/balance');
}

export async function topupWallet(amount, paymentMethod = 'VIETQR') {
  return await authFetch('/api/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({ amount, paymentMethod })
  });
}

export async function fetchMyWalletTransactions(page = 0, size = 10) {
  return await authFetch(`/api/wallet/transactions?page=${page}&size=${size}`);
}

export async function buyMembership(packageId, paymentMethod = 'VIETQR') {
  return await authFetch('/api/memberships/buy', {
    method: 'POST',
    body: JSON.stringify({ packageId, paymentMethod })
  });
}

export async function fetchMyMemberships() {
  return await authFetch('/api/memberships/my');
}

// ==========================================
// 6. ADMIN PORTAL APIS (ROLE_ADMIN / ROLE_STAFF)
// ==========================================
export async function fetchAdminBookings(page = 0, size = 20, branchId, status, date) {
  const params = new URLSearchParams({ page, size });
  if (branchId) params.append('branchId', branchId);
  if (status) params.append('status', status);
  if (date) params.append('date', date);
  return await authFetch(`/api/admin/bookings?${params.toString()}`);
}

export async function confirmBookingAdmin(bookingId) {
  return await authFetch(`/api/admin/bookings/${bookingId}/confirm`, { method: 'POST' });
}

export async function checkinBookingAdmin(bookingId) {
  return await authFetch(`/api/admin/bookings/${bookingId}/checkin`, { method: 'POST' });
}

export async function cancelBookingAdmin(bookingId, cancelReason = 'Hủy bởi Admin') {
  const params = new URLSearchParams({ cancelReason });
  return await authFetch(`/api/admin/bookings/${bookingId}/cancel?${params.toString()}`, { method: 'POST' });
}

export async function confirmPaymentAdmin(paymentId) {
  return await authFetch(`/api/admin/payments/${paymentId}/confirm`, { method: 'POST' });
}

export async function fetchAdminPayments(page = 0, size = 20, status) {
  const params = new URLSearchParams({ page, size });
  if (status) params.append('status', status);
  return await authFetch(`/api/admin/payments?${params.toString()}`);
}

export async function createAdminProduct(productData) {
  return await authFetch('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
}

export async function updateAdminProduct(productId, productData) {
  return await authFetch(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
}

export async function deleteAdminProduct(productId) {
  return await authFetch(`/api/admin/products/${productId}`, {
    method: 'DELETE'
  });
}

export async function updateAdminInventory(branchId, productId, quantity, lowStockThreshold) {
  const params = new URLSearchParams({ branchId, productId, quantity });
  if (lowStockThreshold !== undefined) params.append('lowStockThreshold', lowStockThreshold);
  return await authFetch(`/api/admin/products/inventory?${params.toString()}`, {
    method: 'PUT'
  });
}

export async function fetchAdminBranches() {
  return await authFetch('/api/admin/branches');
}

export async function createAdminBranch(branchData) {
  return await authFetch('/api/admin/branches', {
    method: 'POST',
    body: JSON.stringify(branchData)
  });
}

export async function fetchAdminCourts(branchId) {
  const query = branchId ? `?branchId=${branchId}` : '';
  return await authFetch(`/api/admin/courts${query}`);
}

export async function fetchAdminPriceRules(branchId, dayType) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (dayType) params.append('dayType', dayType);
  const query = params.toString() ? `?${params.toString()}` : '';
  return await authFetch(`/api/admin/price-rules${query}`);
}

export async function createAdminPriceRule(priceRuleData) {
  return await authFetch('/api/admin/price-rules', {
    method: 'POST',
    body: JSON.stringify(priceRuleData)
  });
}

export async function deleteAdminPriceRule(ruleId) {
  return await authFetch(`/api/admin/price-rules/${ruleId}`, {
    method: 'DELETE'
  });
}
