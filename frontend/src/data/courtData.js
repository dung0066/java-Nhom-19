// Dữ liệu mẫu chuẩn đồng bộ với Backend Spring Boot (dat_san_cau_long)

export const BRANCHES = [
  {
    id: 1,
    code: 'NVL',
    name: 'Ways Station NVL',
    address: '70 Nguyễn Văn Lượng, P. 10, Q. Gò Vấp, TP.HCM',
    phone: '0889 555 559',
    totalCourts: 7,
    openHours: '05:00 - 00:00 (24/7)',
    facilities: ['Thảm BWF Taraflex 7.5mm', 'Đèn LED 500 Lux', 'Giặt sấy giày UV', 'Tủ Locker mã PIN']
  },
  {
    id: 2,
    code: 'DQII',
    name: 'Ways Station DQII',
    address: '262 Dương Quảng Hàm, Q. Gò Vấp, TP.HCM',
    phone: '0889 555 559',
    totalCourts: 4,
    openHours: '05:30 - 23:30',
    facilities: ['Thảm PVC cao cấp', 'Bãi đỗ ô tô', 'Quầy nước & Căng vợt', 'Phòng tắm nóng lạnh']
  },
  {
    id: 3,
    code: 'NQA',
    name: 'Ways Station NQA',
    address: '86 Nguyễn Quý Anh, Q. Tân Phú, TP.HCM',
    phone: '0889 555 559',
    totalCourts: 6,
    openHours: '05:30 - 23:30',
    facilities: ['Thảm Taraflex Pháp', 'Đèn chống chói BWF', 'Căng vợt điện tử', 'Khu khán đài & Cafe']
  },
  {
    id: 4,
    code: 'HB',
    name: 'Ways Station HB',
    address: '135 Hiệp Bình, TP. Thủ Đức, TP.HCM',
    phone: '0889 555 559',
    totalCourts: 2,
    openHours: '06:00 - 23:00',
    facilities: ['Sân VIP máy lạnh riêng', 'Khăn lạnh miễn phí', 'Tủ Locker riêng']
  }
];

// 22 Khung giờ chuẩn theo backend database.sql
export const TIME_SLOTS = [
  { id: 1, startTime: '00:15', endTime: '01:15', displayLabel: '0:15 - 1:15', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 1, period: 'night' },
  { id: 2, startTime: '01:20', endTime: '02:20', displayLabel: '1:20 - 2:20', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 2, period: 'night' },
  { id: 3, startTime: '02:25', endTime: '03:25', displayLabel: '2:25 - 3:25', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 3, period: 'night' },
  { id: 4, startTime: '03:30', endTime: '04:30', displayLabel: '3:30 - 4:30', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 4, period: 'night' },
  { id: 5, startTime: '04:35', endTime: '05:35', displayLabel: '4:35 - 5:35', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 5, period: 'morning' },
  { id: 6, startTime: '05:40', endTime: '06:40', displayLabel: '5:40 - 6:40', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 6, period: 'morning' },
  { id: 7, startTime: '06:45', endTime: '07:45', displayLabel: '6:45 - 7:45', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 7, period: 'morning' },
  { id: 8, startTime: '08:00', endTime: '09:00', displayLabel: '8:00 - 9:00', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 8, period: 'morning' },
  { id: 9, startTime: '09:05', endTime: '10:05', displayLabel: '9:05 - 10:05', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 9, period: 'morning' },
  { id: 10, startTime: '10:10', endTime: '11:10', displayLabel: '10:10 - 11:10', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 10, period: 'morning' },
  { id: 11, startTime: '11:15', endTime: '12:15', displayLabel: '11:15 - 12:15', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 11, period: 'morning' },
  { id: 12, startTime: '12:20', endTime: '13:20', displayLabel: '12:20 - 13:20', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 12, period: 'afternoon' },
  { id: 13, startTime: '13:25', endTime: '14:25', displayLabel: '13:25 - 14:25', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 13, period: 'afternoon' },
  { id: 14, startTime: '14:30', endTime: '15:30', displayLabel: '14:30 - 15:30', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 14, period: 'afternoon' },
  { id: 15, startTime: '15:35', endTime: '16:35', displayLabel: '15:35 - 16:35', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 15, period: 'afternoon' },
  { id: 16, startTime: '16:40', endTime: '17:40', displayLabel: '16:40 - 17:40', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 16, period: 'afternoon' },
  { id: 17, startTime: '17:45', endTime: '18:45', displayLabel: '17:45 - 18:45', standardPrice: 70000, peakPrice: 120000, isPeakHour: true, sortOrder: 17, period: 'evening' },
  { id: 18, startTime: '18:50', endTime: '19:50', displayLabel: '18:50 - 19:50', standardPrice: 70000, peakPrice: 120000, isPeakHour: true, sortOrder: 18, period: 'evening' },
  { id: 19, startTime: '19:55', endTime: '20:55', displayLabel: '19:55 - 20:55', standardPrice: 70000, peakPrice: 120000, isPeakHour: true, sortOrder: 19, period: 'evening' },
  { id: 20, startTime: '21:00', endTime: '22:00', displayLabel: '21:00 - 22:00', standardPrice: 70000, peakPrice: 120000, isPeakHour: true, sortOrder: 20, period: 'evening' },
  { id: 21, startTime: '22:05', endTime: '23:05', displayLabel: '22:05 - 23:05', standardPrice: 70000, peakPrice: 120000, isPeakHour: true, sortOrder: 21, period: 'evening' },
  { id: 22, startTime: '23:10', endTime: '00:10', displayLabel: '23:10 - 0:10', standardPrice: 70000, peakPrice: 120000, isPeakHour: false, sortOrder: 22, period: 'night' }
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
  '1_12': { status: 'PASS_WANTED', customerName: 'Hoàng Long', passContact: '0912 345 678', price: 70000, bookingDetailId: 101 },
  '1_13': { status: 'BOOKED', customerName: 'Nguyễn Văn Tuấn', price: 70000, bookingDetailId: 102 },
  '1_17': { status: 'BOOKED', customerName: 'CLB Cầu Lông Gò Vấp', price: 120000, bookingDetailId: 103 },
  '1_18': { status: 'BOOKED', customerName: 'CLB Cầu Lông Gò Vấp', price: 120000, bookingDetailId: 104 },
  '1_19': { status: 'BOOKED', customerName: 'CLB Cầu Lông Gò Vấp', price: 120000, bookingDetailId: 105 },

  '2_17': { status: 'BOOKED', customerName: 'Trần Minh Đức', price: 120000, bookingDetailId: 106 },
  '2_18': { status: 'BOOKED', customerName: 'Trần Minh Đức', price: 120000, bookingDetailId: 107 },
  '2_19': { status: 'PASS_WANTED', customerName: 'Ngô Kiến Huy', passContact: '0908 889 999', price: 120000, bookingDetailId: 108 },

  '3_7': { status: 'BOOKED', customerName: 'Bác Sĩ Quang', price: 70000, bookingDetailId: 109 },
  '3_8': { status: 'BOOKED', customerName: 'Bác Sĩ Quang', price: 70000, bookingDetailId: 110 },
  '3_17': { status: 'BOOKED', customerName: 'Nhóm Công Ty FPT', price: 120000, bookingDetailId: 111 },
  '3_18': { status: 'BOOKED', customerName: 'Nhóm Công Ty FPT', price: 120000, bookingDetailId: 112 },

  '4_18': { status: 'BOOKED', customerName: 'Lê Hoàng Nam', price: 120000, bookingDetailId: 113 },
  '4_19': { status: 'BOOKED', customerName: 'Lê Hoàng Nam', price: 120000, bookingDetailId: 114 },

  '5_12': { status: 'PASS_WANTED', customerName: 'Đặng Thu Thảo', passContact: '0933 557 799', price: 70000, bookingDetailId: 115 },
  '5_17': { status: 'BOOKED', customerName: 'Phạm Hải Đăng', price: 120000, bookingDetailId: 116 },
  '5_18': { status: 'BOOKED', customerName: 'Phạm Hải Đăng', price: 120000, bookingDetailId: 117 },

  '6_18': { status: 'BOOKED', customerName: 'Vũ Quốc Bảo', price: 120000, bookingDetailId: 118 },
  '6_19': { status: 'BOOKED', customerName: 'Vũ Quốc Bảo', price: 120000, bookingDetailId: 119 },

  '7_17': { status: 'BOOKED', customerName: 'Anh Tuấn VIP', price: 120000, bookingDetailId: 120 },
  '7_18': { status: 'BOOKED', customerName: 'Anh Tuấn VIP', price: 120000, bookingDetailId: 121 },
  '7_19': { status: 'BOOKED', customerName: 'Anh Tuấn VIP', price: 120000, bookingDetailId: 122 }
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
