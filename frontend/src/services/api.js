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

/**
 * Tạo đơn đặt sân
 */
export async function createBooking(bookingData) {
  try {
    const res = await fetch(`${API_BASE}/booking/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(bookingData),
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
