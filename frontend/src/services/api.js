/**
 * D2 BadmintonShop - API Client
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
import { toLocalDateString } from '../utils/date';

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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('d2_auth_changed', { detail: user }));
      }
    } else {
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('d2_auth_changed', { detail: null }));
      }
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
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('d2_auth_changed', { detail: null }));
    window.dispatchEvent(new Event('auth:logout'));
  }
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
/** Chuẩn hóa dữ liệu user từ phản hồi đăng nhập/đăng ký, lưu token và user vào localStorage. */
function saveAuthResponse(data) {
  if (!data.token) return data;
  const userObj = data.user || {
    id: data.id,
    username: data.username,
    fullName: data.fullName || data.username,
    email: data.email,
    phone: data.phone,
    role: data.role || 'ROLE_USER',
    walletBalance: data.walletBalance || 0,
    avatar: data.avatar || null,
    isMember: data.isMember,
    membershipPackage: data.membershipPackage,
    discountPercent: data.discountPercent
  };
  data.user = userObj;
  setStoredToken(data.token);
  setStoredUser(userObj);
  isBackendLive = true;
  return data;
}

/** Gửi yêu cầu xác thực; mất kết nối thì báo lỗi rõ ràng, tuyệt đối không tự đăng nhập giả. */
async function postAuth(path, body, defaultError) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau!');
  }

  if (res.ok) {
    return saveAuthResponse(await res.json());
  }
  const err = await res.json().catch(() => ({}));
  throw new Error(err.message || defaultError);
}

export async function loginUser(username, password) {
  return postAuth(
    '/auth/login',
    { identifier: username, username, password },
    'Tài khoản hoặc mật khẩu không chính xác'
  );
}

export async function registerUser(userData) {
  return postAuth('/auth/register', userData, 'Đăng ký tài khoản thất bại');
}

export async function fetchCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const user = await authFetch('/api/auth/me');
    setStoredUser(user);
    return user;
  } catch (err) {
    // Nếu backend chưa bật hoặc lỗi mạng, trả về user đã lưu trong localStorage (Demo Mode)
    const stored = getStoredUser();
    if (stored) return stored;
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
  const targetDate = dateStr || toLocalDateString();
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

/** Danh sách gói hội viên đang mở bán; lỗi mạng hoặc lỗi máy chủ được ném ra để giao diện hiện trạng thái lỗi. */
export async function fetchMembershipPackages() {
  let res;
  try {
    res = await fetch(`${API_BASE}/memberships/packages`, { signal: AbortSignal.timeout(6000) });
  } catch {
    throw new Error('Không thể kết nối đến máy chủ để tải các gói hội viên.');
  }
  if (!res.ok) {
    throw new Error('Không thể tải danh sách gói hội viên. Vui lòng thử lại sau!');
  }
  return await res.json();
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
 * Báo giá trước khi đặt: backend tính giá từng slot, giảm giá hội viên (nếu đã đăng nhập) và tổng tiền.
 * Không lưu đơn nên có thể gọi mỗi lần khách đổi lựa chọn.
 */
export async function quoteBooking(quoteData, signal) {
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  const token = getStoredToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/booking/quote`, {
    method: 'POST',
    headers,
    body: JSON.stringify(quoteData),
    signal
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Không thể tính giá đơn đặt sân');
  }
  return await res.json();
}

/** Danh sách đơn đặt sân của chính người dùng đang đăng nhập (từ cơ sở dữ liệu). */
export async function fetchMyBookings(userId) {
  return await authFetch(`/api/booking/user/${userId}`);
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
 * Tra cứu đơn của khách theo mã đơn (WAY-...) hoặc số điện thoại đầy đủ (khớp chính xác, không cần đăng nhập)
 */
export async function lookupBookings(query) {
  const res = await fetch(`${API_BASE}/booking/lookup?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Không thể tra cứu đơn đặt sân');
  }
  return await res.json();
}

/**
 * Lấy tất cả đơn đặt sân (chỉ admin/nhân viên)
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

/** Lịch sử giao dịch thanh toán của ví (nạp ví, mua gói, thanh toán đơn). */
export async function fetchMyWalletTransactions() {
  return await authFetch('/api/wallet/transactions');
}

export async function buyMembership(packageId, paymentMethod = 'WALLET') {
  return await authFetch('/api/memberships/buy', {
    method: 'POST',
    body: JSON.stringify({ packageId, paymentMethod })
  });
}

/** Hủy yêu cầu đăng ký gói đang chờ thanh toán của chính mình. */
export async function cancelPendingMembership(membershipId) {
  return await authFetch(`/api/memberships/${membershipId}/cancel`, { method: 'POST' });
}

/** Gói hội viên đang có hiệu lực của người dùng (isMember=false nếu chưa có). */
export async function fetchMyActiveMembership(userId) {
  return await authFetch(`/api/memberships/user/${userId}/active`);
}

/** Lịch sử mua gói hội viên của người dùng. */
export async function fetchMyMembershipHistory(userId) {
  return await authFetch(`/api/memberships/user/${userId}/history`);
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

export async function payRemainingBookingAdmin(bookingId, paymentMethod = 'CASH') {
  return await authFetch(`/api/admin/bookings/${bookingId}/pay-remaining`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod })
  });
}

export async function fetchBranchInventory(branchId) {
  return await authFetch(`/api/admin/products/inventory/branch/${branchId}`);
}

export async function updateProductStock(productId, branchId, stockQuantity) {
  return await authFetch(`/api/admin/products/${productId}/inventory`, {
    method: 'PUT',
    body: JSON.stringify({ branchId, stockQuantity: parseInt(stockQuantity, 10) })
  });
}

export async function updateAdminInventory(branchId, productId, quantity) {
  return updateProductStock(productId, branchId, quantity);
}

export async function fetchBranchDelegations() {
  return await authFetch('/api/admin/branches/delegations');
}

export async function assignBranchManager(branchId, userId) {
  return await authFetch(`/api/admin/branches/${branchId}/assign-manager`, {
    method: 'POST',
    body: JSON.stringify({ userId: parseInt(userId, 10) })
  });
}

export async function revokeBranchManager(branchId, userId) {
  return await authFetch(`/api/admin/branches/${branchId}/revoke-manager/${userId}`, {
    method: 'DELETE'
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

export async function updateAdminBranch(id, branchData) {
  return await authFetch(`/api/admin/branches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(branchData)
  });
}

export async function deleteAdminBranch(id) {
  return await authFetch(`/api/admin/branches/${id}`, {
    method: 'DELETE'
  });
}

// ----- Thùng rác chi nhánh và sân (xóa tạm) -----
export async function fetchBranchTrash() {
  return await authFetch('/api/admin/branches/trash');
}

export async function restoreAdminBranch(id) {
  return await authFetch(`/api/admin/branches/${id}/restore`, { method: 'POST' });
}

export async function permanentDeleteAdminBranch(id) {
  return await authFetch(`/api/admin/branches/${id}/permanent`, { method: 'DELETE' });
}

export async function fetchCourtTrash() {
  return await authFetch('/api/admin/courts/trash');
}

export async function restoreAdminCourt(id) {
  return await authFetch(`/api/admin/courts/${id}/restore`, { method: 'POST' });
}

export async function permanentDeleteAdminCourt(id) {
  return await authFetch(`/api/admin/courts/${id}/permanent`, { method: 'DELETE' });
}

export async function fetchAdminCourts(branchId) {
  const query = branchId ? `?branchId=${branchId}` : '';
  return await authFetch(`/api/admin/courts${query}`);
}

export async function createAdminCourt(courtData) {
  return await authFetch('/api/admin/courts', {
    method: 'POST',
    body: JSON.stringify(courtData)
  });
}

export async function updateAdminCourt(courtId, courtData) {
  return await authFetch(`/api/admin/courts/${courtId}`, {
    method: 'PUT',
    body: JSON.stringify(courtData)
  });
}

export async function toggleAdminCourtActive(courtId) {
  return await authFetch(`/api/admin/courts/${courtId}/toggle`, {
    method: 'PATCH'
  });
}

export async function deleteAdminCourt(courtId) {
  return await authFetch(`/api/admin/courts/${courtId}`, {
    method: 'DELETE'
  });
}

export async function fetchAdminUsers() {
  return await authFetch('/api/admin/users');
}

/** Thông tin đầy đủ của một tài khoản: hồ sơ, ví, hội viên và thống kê đơn đặt sân (chỉ admin). */
export async function fetchAdminUserDetail(userId) {
  return await authFetch(`/api/admin/users/${userId}/detail`);
}

export async function toggleAdminUserStatus(userId) {
  return await authFetch(`/api/admin/users/${userId}/toggle-status`, {
    method: 'PATCH'
  });
}

export async function deleteAdminUser(userId) {
  return await authFetch(`/api/admin/users/${userId}`, {
    method: 'DELETE'
  });
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

// ==========================================
// ARTICLE / NEWS API (KẾT NỐI SQL DATABASE)
// ==========================================
export async function fetchArticles(category) {
  const query = category && category !== 'all' ? `?category=${category}` : '';
  return await authFetch(`/api/articles${query}`);
}

export async function fetchArticleById(id) {
  return await authFetch(`/api/articles/${id}`);
}

export async function fetchAdminArticles() {
  return await authFetch('/api/admin/articles');
}

export async function createAdminArticle(articleData) {
  return await authFetch('/api/admin/articles', {
    method: 'POST',
    body: JSON.stringify(articleData)
  });
}

export async function updateAdminArticle(id, articleData) {
  return await authFetch(`/api/admin/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(articleData)
  });
}

export async function toggleAdminArticle(id) {
  return await authFetch(`/api/admin/articles/${id}/toggle`, {
    method: 'PATCH'
  });
}

export async function deleteAdminArticle(id) {
  return await authFetch(`/api/admin/articles/${id}`, {
    method: 'DELETE'
  });
}

// ==========================================
// EXPANDED ADMIN APIs (FULL MODULE SUITE)
// ==========================================
export async function fetchAdminDashboardStats() {
  return await authFetch('/api/admin/dashboard/stats');
}

export async function fetchAdminTimeSlots() {
  return await authFetch('/api/admin/price-rules/time-slots');
}

export async function updateAdminPriceRule(ruleId, ruleData) {
  return await authFetch('/api/admin/price-rules/' + ruleId, {
    method: 'PUT',
    body: JSON.stringify(ruleData)
  });
}

export async function fetchAdminMembershipPackages() {
  return await authFetch('/api/admin/memberships/packages');
}

export async function createAdminMembershipPackage(packageData) {
  return await authFetch('/api/admin/memberships/packages', {
    method: 'POST',
    body: JSON.stringify(packageData)
  });
}

export async function updateAdminMembershipPackage(packageId, packageData) {
  return await authFetch('/api/admin/memberships/packages/' + packageId, {
    method: 'PUT',
    body: JSON.stringify(packageData)
  });
}

export async function deleteAdminMembershipPackage(packageId) {
  return await authFetch('/api/admin/memberships/packages/' + packageId, {
    method: 'DELETE'
  });
}

export async function fetchAdminMembershipHistory() {
  return await authFetch('/api/admin/memberships/history');
}

export async function changeAdminUserRole(userId, role) {
  return await authFetch('/api/admin/users/' + userId + '/role', {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
}

export async function createAdminUser(userData) {
  return await authFetch('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

export async function updateAdminUser(userId, userData) {
  return await authFetch('/api/admin/users/' + userId, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
}

export async function fetchAdminProductInventory(productId) {
  return await authFetch('/api/admin/products/' + productId + '/inventory');
}

export async function updateAdminProductStock(productId, branchId, stockQuantity) {
  return await authFetch('/api/admin/products/' + productId + '/inventory', {
    method: 'PUT',
    body: JSON.stringify({ branchId, stockQuantity })
  });
}

// ==========================================
// PASSWORD RESET & OTP EMAIL APIS
// ==========================================
export async function sendForgotPasswordOtp(identifier) {
  return await authFetch('/api/auth/forgot-password/send-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier })
  });
}

export async function verifyForgotPasswordOtp(identifier, otp) {
  return await authFetch('/api/auth/forgot-password/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier, otp })
  });
}

export async function resetPasswordWithToken(resetToken, newPassword) {
  return await authFetch('/api/auth/forgot-password/reset-password', {
    method: 'POST',
    body: JSON.stringify({ resetToken, newPassword })
  });
}

export async function sendAdminChangePasswordOtp() {
  return await authFetch('/api/auth/otp/send-change-password-otp', {
    method: 'POST'
  });
}

export async function verifyAndChangePassword(otp, newPassword) {
  return await authFetch('/api/auth/otp/verify-and-change-password', {
    method: 'POST',
    body: JSON.stringify({ otp, newPassword })
  });
}