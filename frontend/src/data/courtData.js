// Dữ liệu mẫu chuẩn đồng bộ với Backend Spring Boot (dat_san_cau_long)

export const BRANCHES = [
  {
    id: 1,
    code: 'NVL',
    name: 'D2 BadmintonShop NVL',
    address: '70 Nguyễn Văn Lượng, P. 10, Q. Gò Vấp, TP.HCM',
    phone: '0889 555 559',
    totalCourts: 7,
    openHours: '05:00 - 00:00 (24/7)',
    facilities: ['Thảm BWF Taraflex 7.5mm', 'Đèn LED 500 Lux', 'Giặt sấy giày UV', 'Tủ Locker mã PIN']
  },
  {
    id: 2,
    code: 'DQII',
    name: 'D2 BadmintonShop DQII',
    address: '262 Dương Quảng Hàm, Q. Gò Vấp, TP.HCM',
    phone: '0889 555 559',
    totalCourts: 4,
    openHours: '05:30 - 23:30',
    facilities: ['Thảm PVC cao cấp', 'Bãi đỗ ô tô', 'Quầy nước & Căng vợt', 'Phòng tắm nóng lạnh']
  },
  {
    id: 3,
    code: 'NQA',
    name: 'D2 BadmintonShop NQA',
    address: '86 Nguyễn Quý Anh, Q. Tân Phú, TP.HCM',
    phone: '0889 555 559',
    totalCourts: 6,
    openHours: '05:30 - 23:30',
    facilities: ['Thảm Taraflex Pháp', 'Đèn chống chói BWF', 'Căng vợt điện tử', 'Khu khán đài & Cafe']
  },
  {
    id: 4,
    code: 'HB',
    name: 'D2 BadmintonShop HB',
    address: '135 Hiệp Bình, TP. Thủ Đức, TP.HCM',
    phone: '0889 555 559',
    totalCourts: 2,
    openHours: '06:00 - 23:00',
    facilities: ['Sân VIP máy lạnh riêng', 'Khăn lạnh miễn phí', 'Tủ Locker riêng']
  }
];

// 38 Khung giờ chuẩn 30 phút từ 05:00 sáng đến 24:00 đêm
export const TIME_SLOTS = [
  // Ca Sáng: 05:00 - 12:00 (14 khung)
  { id: 1, startTime: '05:00', endTime: '05:30', displayLabel: '05:00 - 05:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 1, period: 'morning' },
  { id: 2, startTime: '05:30', endTime: '06:00', displayLabel: '05:30 - 06:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 2, period: 'morning' },
  { id: 3, startTime: '06:00', endTime: '06:30', displayLabel: '06:00 - 06:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 3, period: 'morning' },
  { id: 4, startTime: '06:30', endTime: '07:00', displayLabel: '06:30 - 07:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 4, period: 'morning' },
  { id: 5, startTime: '07:00', endTime: '07:30', displayLabel: '07:00 - 07:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 5, period: 'morning' },
  { id: 6, startTime: '07:30', endTime: '08:00', displayLabel: '07:30 - 08:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 6, period: 'morning' },
  { id: 7, startTime: '08:00', endTime: '08:30', displayLabel: '08:00 - 08:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 7, period: 'morning' },
  { id: 8, startTime: '08:30', endTime: '09:00', displayLabel: '08:30 - 09:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 8, period: 'morning' },
  { id: 9, startTime: '09:00', endTime: '09:30', displayLabel: '09:00 - 09:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 9, period: 'morning' },
  { id: 10, startTime: '09:30', endTime: '10:00', displayLabel: '09:30 - 10:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 10, period: 'morning' },
  { id: 11, startTime: '10:00', endTime: '10:30', displayLabel: '10:00 - 10:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 11, period: 'morning' },
  { id: 12, startTime: '10:30', endTime: '11:00', displayLabel: '10:30 - 11:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 12, period: 'morning' },
  { id: 13, startTime: '11:00', endTime: '11:30', displayLabel: '11:00 - 11:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 13, period: 'morning' },
  { id: 14, startTime: '11:30', endTime: '12:00', displayLabel: '11:30 - 12:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 14, period: 'morning' },

  // Ca Chiều: 12:00 - 17:00 (10 khung)
  { id: 15, startTime: '12:00', endTime: '12:30', displayLabel: '12:00 - 12:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 15, period: 'afternoon' },
  { id: 16, startTime: '12:30', endTime: '13:00', displayLabel: '12:30 - 13:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 16, period: 'afternoon' },
  { id: 17, startTime: '13:00', endTime: '13:30', displayLabel: '13:00 - 13:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 17, period: 'afternoon' },
  { id: 18, startTime: '13:30', endTime: '14:00', displayLabel: '13:30 - 14:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 18, period: 'afternoon' },
  { id: 19, startTime: '14:00', endTime: '14:30', displayLabel: '14:00 - 14:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 19, period: 'afternoon' },
  { id: 20, startTime: '14:30', endTime: '15:00', displayLabel: '14:30 - 15:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 20, period: 'afternoon' },
  { id: 21, startTime: '15:00', endTime: '15:30', displayLabel: '15:00 - 15:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 21, period: 'afternoon' },
  { id: 22, startTime: '15:30', endTime: '16:00', displayLabel: '15:30 - 16:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 22, period: 'afternoon' },
  { id: 23, startTime: '16:00', endTime: '16:30', displayLabel: '16:00 - 16:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 23, period: 'afternoon' },
  { id: 24, startTime: '16:30', endTime: '17:00', displayLabel: '16:30 - 17:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 24, period: 'afternoon' },

  // Ca Tối & Giờ Vàng: 17:00 - 24:00 (14 khung)
  { id: 25, startTime: '17:00', endTime: '17:30', displayLabel: '17:00 - 17:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: true, sortOrder: 25, period: 'evening' },
  { id: 26, startTime: '17:30', endTime: '18:00', displayLabel: '17:30 - 18:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: true, sortOrder: 26, period: 'evening' },
  { id: 27, startTime: '18:00', endTime: '18:30', displayLabel: '18:00 - 18:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: true, sortOrder: 27, period: 'evening' },
  { id: 28, startTime: '18:30', endTime: '19:00', displayLabel: '18:30 - 19:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: true, sortOrder: 28, period: 'evening' },
  { id: 29, startTime: '19:00', endTime: '19:30', displayLabel: '19:00 - 19:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: true, sortOrder: 29, period: 'evening' },
  { id: 30, startTime: '19:30', endTime: '20:00', displayLabel: '19:30 - 20:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: true, sortOrder: 30, period: 'evening' },
  { id: 31, startTime: '20:00', endTime: '20:30', displayLabel: '20:00 - 20:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: true, sortOrder: 31, period: 'evening' },
  { id: 32, startTime: '20:30', endTime: '21:00', displayLabel: '20:30 - 21:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: true, sortOrder: 32, period: 'evening' },
  { id: 33, startTime: '21:00', endTime: '21:30', displayLabel: '21:00 - 21:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: true, sortOrder: 33, period: 'evening' },
  { id: 34, startTime: '21:30', endTime: '22:00', displayLabel: '21:30 - 22:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: true, sortOrder: 34, period: 'evening' },
  { id: 35, startTime: '22:00', endTime: '22:30', displayLabel: '22:00 - 22:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 35, period: 'evening' },
  { id: 36, startTime: '22:30', endTime: '23:00', displayLabel: '22:30 - 23:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 36, period: 'evening' },
  { id: 37, startTime: '23:00', endTime: '23:30', displayLabel: '23:00 - 23:30', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 37, period: 'evening' },
  { id: 38, startTime: '23:30', endTime: '24:00', displayLabel: '23:30 - 24:00', standardPrice: 35000, peakPrice: 60000, isPeakHour: false, sortOrder: 38, period: 'evening' }
];

// Danh sách sân cho chi nhánh NVL (mặc định)
export const COURTS_NVL = [
  { id: 1, courtNumber: 1, name: 'Sân 1', courtGroup: 'Cụm 1 (Sân 1+2)', type: 'Tiêu chuẩn BWF', surface: 'Thảm Taraflex 7.5mm', isVip: false, active: true },
  { id: 2, courtNumber: 2, name: 'Sân 2', courtGroup: 'Cụm 1 (Sân 1+2)', type: 'Tiêu chuẩn BWF', surface: 'Thảm Taraflex 7.5mm', isVip: false, active: true },
  { id: 3, courtNumber: 3, name: 'Sân 3', courtGroup: 'Cụm 2 (Sân 3+4)', type: 'Tiêu chuẩn BWF', surface: 'Thảm Taraflex 7.5mm', isVip: false, active: true },
  { id: 4, courtNumber: 4, name: 'Sân 4', courtGroup: 'Cụm 2 (Sân 3+4)', type: 'Tiêu chuẩn BWF', surface: 'Thảm Taraflex 7.5mm', isVip: false, active: true },
  { id: 5, courtNumber: 5, name: 'Sân 5', courtGroup: 'Cụm 3 (Sân 5+6)', type: 'Tiêu chuẩn BWF', surface: 'Thảm PVC Đúc Chống Trượt', isVip: false, active: true },
  { id: 6, courtNumber: 6, name: 'Sân 6', courtGroup: 'Cụm 3 (Sân 5+6)', type: 'Tiêu chuẩn BWF', surface: 'Thảm PVC Đúc Chống Trượt', isVip: false, active: true },
  { id: 7, courtNumber: 7, name: 'Sân 7', courtGroup: 'Cụm 4 (Sân 7)', type: 'Sân VIP Riêng Biệt', surface: 'Thảm Taraflex Cao Cấp', isVip: true, active: true }
];

export const INITIAL_COURTS = COURTS_NVL;

// Dữ liệu slot mặc định nếu backend chưa bật
export const DEFAULT_SLOT_STATUS_MAP = {
  '1_25': { status: 'BOOKED', customerName: 'CLB Gò Vấp', price: 60000, bookingDetailId: 101 },
  '1_26': { status: 'BOOKED', customerName: 'CLB Gò Vấp', price: 60000, bookingDetailId: 102 },
  '1_27': { status: 'BOOKED', customerName: 'CLB Gò Vấp', price: 60000, bookingDetailId: 103 },
  '1_28': { status: 'BOOKED', customerName: 'CLB Gò Vấp', price: 60000, bookingDetailId: 104 },

  '2_27': { status: 'BOOKED', customerName: 'Trần Minh Đức', price: 60000, bookingDetailId: 105 },
  '2_28': { status: 'BOOKED', customerName: 'Trần Minh Đức', price: 60000, bookingDetailId: 106 },
  '2_29': { status: 'PASS_WANTED', customerName: 'Ngô Kiến Huy', passContact: '0908 889 999', price: 60000, bookingDetailId: 107 },

  '3_7': { status: 'BOOKED', customerName: 'Bác Sĩ Quang', price: 35000, bookingDetailId: 108 },
  '3_8': { status: 'BOOKED', customerName: 'Bác Sĩ Quang', price: 35000, bookingDetailId: 109 },
  '3_27': { status: 'BOOKED', customerName: 'Nhóm FPT', price: 60000, bookingDetailId: 110 },
  '3_28': { status: 'BOOKED', customerName: 'Nhóm FPT', price: 60000, bookingDetailId: 111 },

  '4_28': { status: 'BOOKED', customerName: 'Lê Hoàng Nam', price: 60000, bookingDetailId: 112 },
  '4_29': { status: 'BOOKED', customerName: 'Lê Hoàng Nam', price: 60000, bookingDetailId: 113 },

  '5_15': { status: 'PASS_WANTED', customerName: 'Đặng Thu Thảo', passContact: '0933 557 799', price: 35000, bookingDetailId: 114 },
  '5_27': { status: 'BOOKED', customerName: 'Phạm Hải Đăng', price: 60000, bookingDetailId: 115 },
  '5_28': { status: 'BOOKED', customerName: 'Phạm Hải Đăng', price: 60000, bookingDetailId: 116 },

  '7_27': { status: 'BOOKED', customerName: 'Anh Tuấn VIP', price: 60000, bookingDetailId: 117 },
  '7_28': { status: 'BOOKED', customerName: 'Anh Tuấn VIP', price: 60000, bookingDetailId: 118 }
};

// Dịch vụ và dụng cụ (đồng bộ với ProductApiController)
export const SERVICES_CATEGORIES = [
  {
    id: 'refreshments',
    title: 'Nước Giải Khát & Khăn Lạnh Ướp Lạnh',
    subtitle: 'Nạp khoáng điện giải, giải nhiệt phục hồi nhanh chóng',
    badge: 'Phục vụ tận sân',
    items: [
      {
        id: 'r1',
        name: 'Nước Bù Khoáng Pocari Sweat 500ml',
        category: 'Nước giải khát',
        desc: 'Bù nước và 5 ion thiết yếu nhanh gấp 2.2 lần, giảm chuột rút',
        price: 15000,
        unit: 'chai',
        badge: 'Bán chạy'
      },
      {
        id: 'r2',
        name: 'Nước Chanh Muối Revive 500ml',
        category: 'Nước giải khát',
        desc: 'Ướp lạnh sâu, phục hồi năng lượng tức thì',
        price: 12000,
        unit: 'chai'
      },
      {
        id: 'r3',
        name: 'Nước Tăng Lực Red Bull Thái',
        category: 'Nước giải khát',
        desc: 'Tỉnh táo, bùng nổ sức mạnh trong set đấu quyết định',
        price: 18000,
        unit: 'lon'
      },
      {
        id: 'r4',
        name: 'Khăn Lạnh Tiệt Trùng Bạc Hà',
        category: 'Khăn & Làm mát',
        desc: 'Khăn ướt dày dặn, kháng khuẩn, lau mồ hôi mát lạnh',
        price: 5000,
        unit: 'chiếc'
      },
      {
        id: 'r5',
        name: 'Thuê Khăn Bông Yonex Cotton',
        category: 'Khăn & Làm mát',
        desc: 'Khăn bông 100% cotton thấm hút mồ hôi tối đa, giặt sấy thơm tho',
        price: 15000,
        unit: 'buổi'
      }
    ]
  },
  {
    id: 'care_locker',
    title: 'Giặt Sấy Giày UV & Ký Gửi Locker',
    subtitle: 'Chăm sóc thiết bị thi đấu chuyên nghiệp, gửi đồ an toàn tuyệt đối',
    badge: 'Khử khuẩn UV 100%',
    items: [
      {
        id: 'c1',
        name: 'Vệ Sinh & Giặt Khử Khuẩn Giày UV',
        category: 'Vệ sinh giày',
        desc: 'Làm sạch sâu vết bẩn, tẩy ố đế cao su bám sân, sấy khô tiệt trùng bằng đèn UV 15 phút',
        price: 60000,
        unit: 'đôi',
        badge: 'Công nghệ UV'
      },
      {
        id: 'c2',
        name: 'Ký Gửi Tủ Locker Mã PIN',
        category: 'Ký gửi đồ',
        desc: 'Tủ riêng biệt bảo quản balo, vợt, giày và đồ cá nhân an toàn',
        price: 20000,
        unit: 'buổi'
      },
      {
        id: 'c3',
        name: 'Gói Ký Gửi Đồ Cố Định Theo Tháng',
        category: 'Ký gửi đồ',
        desc: 'Giữ tủ cố định 30 ngày, để giày và túi vợt tại sân không cần mang về',
        price: 220000,
        unit: 'tháng',
        badge: 'Tiết kiệm'
      },
      {
        id: 'c4',
        name: 'Quấn Cán Vợt Yonex Super Grap AC102',
        category: 'Bảo dưỡng vợt',
        desc: 'Được nhân viên quấn chuẩn tay vợt chuyên nghiệp, chống trơn trượt',
        price: 25000,
        unit: 'cây'
      },
      {
        id: 'c5',
        name: 'Căng Vợt Điện Tử Lấy Ngay (BG65 / BG65Ti)',
        category: 'Bảo dưỡng vợt',
        desc: 'Máy căng điện tử Yonex Precision 9.0 chuẩn từng lbs (10kg - 12.5kg)',
        price: 120000,
        unit: 'cây',
        badge: 'Lấy sau 20p'
      }
    ]
  },
  {
    id: 'rental_equipment',
    title: 'Thuê Vợt & Mua Cầu Thi Đấu',
    subtitle: 'Dụng cụ chính hãng Yonex, Lining, Victor cho trận đấu đỉnh cao',
    badge: 'Chính hãng 100%',
    items: [
      {
        id: 'e1',
        name: 'Thuê Vợt Yonex Astrox 88D Pro / 100ZZ',
        category: 'Thuê vợt',
        desc: 'Dòng vợt tấn công smash cắm sân, thân cứng đầm đầu, căng sẵn cước 11.0kg',
        price: 30000,
        unit: 'cây/buổi',
        badge: 'Vợt cao cấp'
      },
      {
        id: 'e2',
        name: 'Thuê Vợt Victor Thruster Ryuga / Falcon',
        category: 'Thuê vợt',
        desc: 'Vũ khí tấn công uy lực công nghệ HME, thoát tay và đầm đầu, cước 10.8kg',
        price: 25000,
        unit: 'cây/buổi'
      },
      {
        id: 'e3',
        name: 'Thuê Vợt Lining Axforce 80 / Halbertec',
        category: 'Thuê vợt',
        desc: 'Kiểm soát cầu tinh tế, thủ cầu linh hoạt và phản tạt sắc bén',
        price: 25000,
        unit: 'cây/buổi'
      },
      {
        id: 'e4',
        name: 'Thuê Giày Yonex Power Cushion 65Z3',
        category: 'Thuê giày',
        desc: 'Đệm khí Power Cushion chống lật cổ chân, đã khử khuẩn UV 100% sạch sẽ',
        price: 25000,
        unit: 'đôi/buổi',
        badge: 'Đủ size 38-44'
      },
      {
        id: 'e5',
        name: 'Ống Cầu Lông Thi Đấu Victor Gold / Ba Sao (12 Quả)',
        category: 'Dụng cụ',
        desc: 'Lông vũ tự nhiên bay đầm, độ bền vượt trội theo chuẩn thi đấu',
        price: 230000,
        unit: 'ống'
      }
    ]
  }
];

export const ALL_ADDONS = SERVICES_CATEGORIES.flatMap((c) => c.items);

// 13 Sản phẩm & Dịch vụ chuẩn hệ thống D2 BadmintonShop đồng bộ giữa Admin SQL và Giao diện Đặt Sân / Trang Chủ
export const DEFAULT_D2_PRODUCTS = [
  {
    id: 1,
    name: 'Vợt Yonex Astrox 88D Pro',
    brand: 'Yonex',
    category: 'RACKET',
    price: 50000,
    priceUnit: '/ ca chơi',
    badge: 'Bán chạy nhất',
    spec1: 'Căng sẵn cước BG65Ti 10.5kg',
    spec2: 'Trọng lượng 4U-G5',
    description: 'Dòng vợt tấn công chuyên nghiệp, smash cắm sân và trợ lực tốt',
    imageUrl: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 2,
    name: 'Vợt Lining Axforce 90 Max',
    brand: 'Lining',
    category: 'RACKET',
    price: 45000,
    priceUnit: '/ ca chơi',
    badge: 'Cao cấp',
    spec1: 'Công thủ toàn diện',
    spec2: 'Thân đũa mỏng trợ lực tốt',
    description: 'Thích hợp cho người chơi công thủ toàn diện, đũa vợt dẻo phản tạt cực nhanh',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 3,
    name: 'Giày Yonex Power Cushion 65Z3',
    brand: 'Yonex',
    category: 'SHOES',
    price: 35000,
    priceUnit: '/ ca chơi',
    badge: 'Đủ size 39-44',
    spec1: 'Đế đệm khí êm ái chống lật sơ mi',
    spec2: 'Khử khuẩn sấy UV 100%',
    description: 'Đế cao su bám sân thảm BWF, đệm Power Cushion giảm chấn gót chân',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 4,
    name: 'Pocari Sweat 500ml',
    brand: 'Pocari',
    category: 'REFRESHMENTS',
    price: 20000,
    priceUnit: '/ chai',
    badge: 'Bù điện giải',
    spec1: 'Bù 5 ion khoáng thiết yếu',
    spec2: 'Giảm chuột rút khi vận động',
    description: 'Bù nước và 5 ion khoáng thiết yếu, chống chuột rút tức thì',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 5,
    name: 'Revive Chanh Muối 500ml',
    brand: 'Revive',
    category: 'REFRESHMENTS',
    price: 18000,
    priceUnit: '/ chai',
    badge: 'Ướp lạnh',
    spec1: 'Ướp lạnh sâu',
    spec2: 'Giải khát tức thì',
    description: 'Ướp lạnh sâu, bổ sung muối khoáng và năng lượng cho cơ thể',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 6,
    name: 'Nước khoáng thiên nhiên LaVie 500ml',
    brand: 'LaVie',
    category: 'REFRESHMENTS',
    price: 10000,
    priceUnit: '/ chai',
    badge: 'Khoáng tự nhiên',
    spec1: 'Thanh khiết, dịu mát',
    spec2: 'Chai 500ml ướp lạnh',
    description: 'Nước khoáng thiên nhiên thanh khiết, giải tỏa cơn khát sảng khoái',
    imageUrl: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 7,
    name: 'Bò Húc Red Bull Thái',
    brand: 'Red Bull',
    category: 'REFRESHMENTS',
    price: 22000,
    priceUnit: '/ lon',
    badge: 'Tăng lực',
    spec1: 'Tỉnh táo bùng nổ thể lực',
    spec2: 'Red Bull nắp bật Thái',
    description: 'Tỉnh táo, bùng nổ sức mạnh cho set đấu quyết định',
    imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 8,
    name: 'Khăn Lạnh Kháng Khuẩn Bạc Hà',
    brand: 'D2 BadmintonShop',
    category: 'REFRESHMENTS',
    price: 5000,
    priceUnit: '/ cái',
    badge: 'Mát lạnh',
    spec1: 'Mát lạnh tiệt trùng sạch sẽ',
    spec2: 'Hương bạc hà sảng khoái',
    description: 'Khăn ướt tiệt trùng cao cấp, lau mồ hôi và hạ nhiệt tức thì',
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 9,
    name: 'Thuê Khăn Bông Yonex Cotton',
    brand: 'Yonex',
    category: 'ACCESSORY',
    price: 25000,
    priceUnit: '/ buổi',
    badge: 'Cotton 100%',
    spec1: 'Thấm hút mồ hôi tối đa',
    spec2: 'Giặt sấy tiệt trùng thơm tho',
    description: 'Khăn bông 100% cotton Yonex chuyên dụng thể thao, giặt sấy UV thơm tho',
    imageUrl: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 10,
    name: 'Ký Gửi Tủ Locker Mã PIN',
    brand: 'D2 Locker',
    category: 'SERVICES',
    price: 20000,
    priceUnit: '/ buổi',
    badge: 'Bảo mật',
    spec1: 'Mã PIN cá nhân riêng',
    spec2: 'Để trọn bộ balo vợt giày',
    description: 'Tủ riêng biệt bảo quản đồ an toàn tuyệt đối suốt buổi tập luyện',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 11,
    name: 'Giặt Sấy & Khử Khuẩn Giày UV',
    brand: 'D2 Care',
    category: 'SERVICES',
    price: 60000,
    priceUnit: '/ đôi',
    badge: 'Khử khuẩn UV',
    spec1: 'Làm sạch sâu vết bám sân',
    spec2: 'Sấy UV tiệt trùng 15 phút',
    description: 'Vệ sinh sạch sâu đế giày cao su, sấy khô tiệt trùng bằng đèn UV thơm tho',
    imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 12,
    name: 'Cước Yonex BG65 (Độ bền cao)',
    brand: 'Yonex',
    category: 'SERVICES',
    price: 140000,
    priceUnit: '/ cây',
    badge: 'Độ bền cao',
    spec1: 'Cước đan máy điện tử chuẩn kg',
    spec2: 'Bền bỉ, giữ kg lâu dài',
    description: 'Dây cước phổ biến nhất thế giới, chịu lực bền bỉ và giữ độ căng cực tốt',
    imageUrl: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=600&auto=format&fit=crop',
    active: true
  },
  {
    id: 13,
    name: 'Cước Yonex BG65 Titanium',
    brand: 'Yonex',
    category: 'SERVICES',
    price: 160000,
    priceUnit: '/ cây',
    badge: 'Nổ đanh',
    spec1: 'Lớp phủ hợp kim Titanium',
    spec2: 'Âm thanh nổ đanh trợ lực đập',
    description: 'Âm thanh nổ đanh vang dội, bề mặt trợ lực smash cực cắm và hiểm hóc',
    imageUrl: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=600&auto=format&fit=crop',
    active: true
  }
];

export const COURT_PACKAGES = [
  {
    id: 'pkg-flex',
    name: 'Gói Thuê Sân Linh Hoạt',
    badge: 'Phổ biến',
    desc: 'Đặt lẻ theo ca giờ rảnh, tự do đổi sân trước 4 tiếng',
    discount: 'Giảm 10% khi đặt từ 2 ca',
    benefits: ['Không ràng buộc hợp đồng', 'Tích điểm thành viên WaysPoint', 'Áp dụng mọi khung giờ trong ngày']
  },
  {
    id: 'pkg-fixed',
    name: 'Gói Cố Định Tháng (Hội Viên)',
    badge: 'Tiết kiệm 15%',
    desc: 'Cố định 2 - 3 buổi/tuần cùng khung giờ vàng hàng tuần',
    discount: 'Giảm 15% tổng tiền sân cả tháng',
    benefits: ['Giữ cố định sân đẹp yêu thích', 'Miễn phí tủ Locker để đồ 1 tháng', 'Tặng 2 buổi vệ sinh giày UV miễn phí']
  },
  {
    id: 'pkg-tourney',
    name: 'Gói Tổ Chức Giải Đấu Giao Lưu',
    badge: 'Chuyên nghiệp',
    desc: 'Bao trọn 4 - 7 sân trong 4 - 8 tiếng cho công ty, CLB',
    discount: 'Ưu đãi trọn gói sự kiện',
    benefits: ['Cung cấp bảng điểm LED điện tử', 'Hỗ trợ 2 trọng tài quốc gia', 'Nước suối và khăn lạnh không giới hạn']
  }
];
