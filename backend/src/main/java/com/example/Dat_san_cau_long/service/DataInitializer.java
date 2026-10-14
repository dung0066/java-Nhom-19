package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.model.*;
import com.example.Dat_san_cau_long.repository.*;
import com.example.Dat_san_cau_long.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final BranchRepository branchRepository;
    private final CourtRepository courtRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final ProductRepository productRepository;
    private final MembershipPackageRepository packageRepository;
    private final UserRepository userRepository;
    private final UserMembershipRepository userMembershipRepository;

    @Override
    public void run(String... args) {
        // Khởi tạo sản phẩm nếu chưa có
        if (productRepository.count() == 0) {
            log.info("Khởi tạo danh sách dụng cụ vợt & giày cho thuê...");
            List<Product> defaultProducts = List.of(
                Product.builder()
                    .name("Yonex Astrox 88D Pro / 100ZZ")
                    .category("RACQUET")
                    .brand("YONEX JAPAN")
                    .price(30000.0)
                    .priceUnit("/ buổi chơi")
                    .imageUrl("https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=600&auto=format&fit=crop")
                    .badge("HOT NHẤT")
                    .spec1("Trọng lượng: 4U/G5")
                    .spec2("Lực căng: 11.0 kg")
                    .description("Dòng vợt tấn công đỉnh cao, thân cứng trợ lực smash cực mạnh. Căng sẵn cước BG65Ti (11kg).")
                    .active(true)
                    .build(),
                Product.builder()
                    .name("Victor Thruster Ryuga / Falcon")
                    .category("RACQUET")
                    .brand("VICTOR TAIWAN")
                    .price(25000.0)
                    .priceUnit("/ buổi chơi")
                    .imageUrl("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop")
                    .badge("VIP ATTACK")
                    .spec1("Trọng lượng: 4U/G5")
                    .spec2("Lực căng: 10.8 kg")
                    .description("Vũ khí tấn công uy lực với công nghệ HME, cảm giác cầu thoát tay và đầm đầu. Cước VBS66N.")
                    .active(true)
                    .build(),
                Product.builder()
                    .name("Lining Axforce 80 / Halbertec")
                    .category("RACQUET")
                    .brand("LINING OFFICIAL")
                    .price(25000.0)
                    .priceUnit("/ buổi chơi")
                    .imageUrl("https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop")
                    .badge("TOÀN DIỆN")
                    .spec1("Trọng lượng: 4U/G5")
                    .spec2("Lực căng: 10.5 kg")
                    .description("Kiểm soát cầu tinh tế, thủ cầu linh hoạt và phản tạt sắc bén. Căng cước Lining N65 cao cấp.")
                    .active(true)
                    .build(),
                Product.builder()
                    .name("Kumpoo Power Control 520")
                    .category("RACQUET")
                    .brand("KUMPOO / FELET")
                    .price(15000.0)
                    .priceUnit("/ buổi chơi")
                    .imageUrl("https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=600&auto=format&fit=crop")
                    .badge("CHO NGƯỜI MỚI")
                    .spec1("Trọng lượng: 4U/G5")
                    .spec2("Lực căng: 10.0 kg")
                    .description("Vợt dẻo trợ lực, thân nhẹ êm tay, rất dễ chơi và bền bỉ cho người mới bắt đầu tập luyện.")
                    .active(true)
                    .build(),
                Product.builder()
                    .name("Giày Cầu Lông Yonex 65Z3 / Eclipsion")
                    .category("SHOES")
                    .brand("YONEX POWER CUSHION")
                    .price(25000.0)
                    .priceUnit("/ buổi chơi")
                    .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop")
                    .badge("ĐỆM KHÍ ÊM")
                    .spec1("Size: 37, 38, 39, 40, 41, 42, 43, 44")
                    .spec2("Khử khuẩn UV 100%")
                    .description("Công nghệ đệm Power Cushion hấp thụ chấn động tối đa, chống lật cổ chân và bám sàn cực tốt.")
                    .active(true)
                    .build(),
                Product.builder()
                    .name("Giày Mizuno Wave Claw Pro")
                    .category("SHOES")
                    .brand("MIZUNO JAPAN")
                    .price(20000.0)
                    .priceUnit("/ buổi chơi")
                    .imageUrl("https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop")
                    .badge("BÁM SÀN TỐT")
                    .spec1("Size: 38, 39, 40, 41, 42, 43")
                    .spec2("Khử mùi Nano Bạc")
                    .description("Đế sóng Wave độc quyền phân tán lực tiếp đất, form giày vừa vặn cho bàn chân người châu Á.")
                    .active(true)
                    .build(),
                Product.builder()
                    .name("Ống Cầu Lông Thi Đấu (12 Quả)")
                    .category("ACCESSORY")
                    .brand("HẢI YẾN / BA SAO / VICTOR")
                    .price(230000.0)
                    .priceUnit("/ ống 12 quả")
                    .imageUrl("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop")
                    .badge("BÁN LẺ / HỘP")
                    .spec1("Tốc độ: 76 / 77")
                    .spec2("Quy cách: Hộp 12 quả")
                    .description("Cầu lông chất lượng cao, lông vịt tự nhiên bay đầm, độ bền vượt trội theo chuẩn thi đấu.")
                    .active(true)
                    .build(),
                Product.builder()
                    .name("Pocari, Revive & Quấn Cán Vợt")
                    .category("ACCESSORY")
                    .brand("NƯỚC BÙ KHOÁNG & PHỤ KIỆN")
                    .price(15000.0)
                    .priceUnit("/ món")
                    .imageUrl("https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop")
                    .badge("CĂN TIN TIỆN LỢI")
                    .spec1("Nước giải khát: 10.000đ - 15.000đ")
                    .spec2("Quấn cán: 15.000đ/cái")
                    .description("Nước giải khát ướp lạnh bù điện giải tức thì. Quấn cán chống trượt thấm mồ hôi VS/Yonex.")
                    .active(true)
                    .build()
            );
            productRepository.saveAll(defaultProducts);
        }

        if (branchRepository.count() == 0) {
            log.info("Khởi tạo dữ liệu hệ thống đặt sân Ways Station Badminton...");

        // 1. Khởi tạo 4 Chi nhánh
        Branch nvl = branchRepository.save(Branch.builder()
                .code("NVL")
                .name("Ways Station NVL")
                .address("70 Nguyễn Văn Lượng, P. 10, Gò Vấp")
                .phone("0889555559")
                .totalCourts(7)
                .build());

        Branch dqii = branchRepository.save(Branch.builder()
                .code("DQII")
                .name("Ways Station DQII")
                .address("262 Dương Quảng Hàm, Gò Vấp")
                .phone("0889555559")
                .totalCourts(4)
                .build());

        Branch nqa = branchRepository.save(Branch.builder()
                .code("NQA")
                .name("Ways Station NQA")
                .address("86 Nguyễn Quý Anh, Tân Phú")
                .phone("0889555559")
                .totalCourts(6)
                .build());

        Branch hb = branchRepository.save(Branch.builder()
                .code("HB")
                .name("Ways Station HB")
                .address("135 Hiệp Bình, Thủ Đức")
                .phone("0889555559")
                .totalCourts(2)
                .build());

        // 2. Tạo Sân cho chi nhánh NVL (4 cụm sân như hình)
        List<Court> nvlCourts = new ArrayList<>();
        nvlCourts.add(Court.builder().branch(nvl).name("Sân 1").courtNumber(1).courtGroup("Cụm 1 (Sân 1+2)").active(true).build());
        nvlCourts.add(Court.builder().branch(nvl).name("Sân 2").courtNumber(2).courtGroup("Cụm 1 (Sân 1+2)").active(true).build());
        nvlCourts.add(Court.builder().branch(nvl).name("Sân 3").courtNumber(3).courtGroup("Cụm 2 (Sân 3+4)").active(true).build());
        nvlCourts.add(Court.builder().branch(nvl).name("Sân 4").courtNumber(4).courtGroup("Cụm 2 (Sân 3+4)").active(true).build());
        nvlCourts.add(Court.builder().branch(nvl).name("Sân 5").courtNumber(5).courtGroup("Cụm 3 (Sân 5+6)").active(true).build());
        nvlCourts.add(Court.builder().branch(nvl).name("Sân 6").courtNumber(6).courtGroup("Cụm 3 (Sân 5+6)").active(true).build());
        nvlCourts.add(Court.builder().branch(nvl).name("Sân 7").courtNumber(7).courtGroup("Cụm 4 (Sân 7)").active(true).build());
        courtRepository.saveAll(nvlCourts);

        // Tạo sân cho DQII (Sân 1; Sân 2+3; Sân 4)
        for (int i = 1; i <= 4; i++) {
            courtRepository.save(Court.builder().branch(dqii).name("Sân " + i).courtNumber(i).courtGroup("Sân DQII").active(true).build());
        }
        // Tạo sân cho NQA (Sân 1; Sân 2+3; Sân 4+5+6)
        for (int i = 1; i <= 6; i++) {
            courtRepository.save(Court.builder().branch(nqa).name("Sân " + i).courtNumber(i).courtGroup("Sân NQA").active(true).build());
        }
        // Tạo sân cho HB (Sân 1+2)
        for (int i = 1; i <= 2; i++) {
            courtRepository.save(Court.builder().branch(hb).name("Sân " + i).courtNumber(i).courtGroup("Sân HB").active(true).build());
        }

        // 3. Tạo khung giờ chuẩn
        String[][] slotsData = {
                {"00:15", "01:15", "0:15-1:15", "false"},
                {"01:20", "02:20", "1:20-2:20", "false"},
                {"02:25", "03:25", "2:25-3:25", "false"},
                {"03:30", "04:30", "3:30-4:30", "false"},
                {"04:35", "05:35", "4:35-5:35", "false"},
                {"05:40", "06:40", "5:40-6:40", "false"},
                {"06:45", "07:45", "6:45-7:45", "false"},
                {"08:00", "09:00", "8:00-9:00", "false"},
                {"09:05", "10:05", "9:05-10:05", "false"},
                {"10:10", "11:10", "10:10-11:10", "false"},
                {"11:15", "12:15", "11:15-12:15", "false"},
                {"12:20", "13:20", "12:20-13:20", "false"},
                {"13:25", "14:25", "13:25-14:25", "false"},
                {"14:30", "15:30", "14:30-15:30", "false"},
                {"15:35", "16:35", "15:35-16:35", "false"},
                {"16:40", "17:40", "16:40-17:40", "false"},
                {"17:45", "18:45", "17:45-18:45", "true"},
                {"18:50", "19:50", "18:50-19:50", "true"},
                {"19:55", "20:55", "19:55-20:55", "true"},
                {"21:00", "22:00", "21:00-22:00", "true"},
                {"22:05", "23:05", "22:05-23:05", "true"},
                {"23:10", "00:10", "23:10-0:10", "false"}
        };

        List<TimeSlot> savedSlots = new ArrayList<>();
        for (int i = 0; i < slotsData.length; i++) {
            boolean isPeak = Boolean.parseBoolean(slotsData[i][3]);
            savedSlots.add(timeSlotRepository.save(TimeSlot.builder()
                    .startTime(slotsData[i][0])
                    .endTime(slotsData[i][1])
                    .displayLabel(slotsData[i][2])
                    .standardPrice(70000.0)
                    .peakPrice(120000.0)
                    .isPeakHour(isPeak)
                    .sortOrder(i + 1)
                    .build()));
        }

        // 4. Tạo các lượt đặt sân mẫu trong ngày (gồm đã đặt và cần pass như ảnh mẫu)
        LocalDate today = LocalDate.now();
        List<LocalDate> sampleDates = List.of(today, today.plusDays(1), today.plusDays(2), today.plusDays(3));

        int bookingIdCounter = 5000;
        for (LocalDate d : sampleDates) {
            bookingIdCounter += 1;
            Booking sampleBooking = bookingRepository.save(Booking.builder()
                    .bookingCode("WAY-" + d.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + bookingIdCounter)
                    .customerName("Nguyễn Văn Tuấn")
                    .customerPhone("0909123456")
                    .customerEmail("tuan.badminton@gmail.com")
                    .bookingDate(d)
                    .branch(nvl)
                    .totalPrice(840000.0)
                    .totalHours(7.0)
                    .status("CONFIRMED")
                    .paymentMethod("VIETQR")
                    .notes("Khách đặt cố định giờ chiều tối")
                    .createdAt(LocalDateTime.now())
                    .build());

            List<BookingDetail> details = new ArrayList<>();
            for (Court c : nvlCourts) {
                // Đặt các slot từ 12:20 đến 21:00 (slot indices 11-19)
                for (int slotIdx = 11; slotIdx <= 19; slotIdx++) {
                    if (slotIdx < savedSlots.size()) {
                        TimeSlot slot = savedSlots.get(slotIdx);
                        String status = (c.getCourtNumber() == 1 && slotIdx == 11) ? "PASS_WANTED" : "BOOKED";
                        details.add(BookingDetail.builder()
                                .booking(sampleBooking)
                                .court(c)
                                .timeSlot(slot)
                                .slotDate(d)
                                .price(slot.getIsPeakHour() ? slot.getPeakPrice() : slot.getStandardPrice())
                                .status(status)
                                .passContact(status.equals("PASS_WANTED") ? "0912345678" : null)
                                .build());
                    }
                }
                // Thêm slot sáng 6h-9h (indices 6, 7, 8) cho một số sân
                if (c.getCourtNumber() <= 4) {
                    for (int slotIdx = 6; slotIdx <= 8; slotIdx++) {
                        TimeSlot slot = savedSlots.get(slotIdx);
                        details.add(BookingDetail.builder()
                                .booking(sampleBooking)
                                .court(c)
                                .timeSlot(slot)
                                .slotDate(d)
                                .price(slot.getStandardPrice())
                                .status("BOOKED")
                                .build());
                    }
                }
            }
            bookingDetailRepository.saveAll(details);
        }
        } else {
            log.info("Dữ liệu chi nhánh và sân đã có sẵn.");
        }

        // Khởi tạo các gói hội viên VIP nếu chưa có
        if (packageRepository.count() == 0) {
            log.info("Khởi tạo danh sách các gói hội viên VIP...");
            MembershipPackage silver = MembershipPackage.builder()
                    .code("SILVER")
                    .name("Hội Viên Bạc (Silver)")
                    .price(199000.0)
                    .durationDays(30)
                    .discountPercent(5.0)
                    .perks("Giảm 5% giá giờ chơi mọi khung giờ; Tặng 1 quấn cán vợt cao cấp/tháng; Đặt sân online ưu tiên giữ chỗ 15 phút")
                    .description("Gói khởi đầu tiết kiệm dành cho người chơi thể thao hàng tuần")
                    .badgeColor("#0284c7")
                    .icon("fa-solid fa-medal")
                    .active(true)
                    .build();

            MembershipPackage gold = MembershipPackage.builder()
                    .code("GOLD")
                    .name("Hội Viên Vàng (Gold)")
                    .price(499000.0)
                    .durationDays(90)
                    .discountPercent(12.0)
                    .perks("Giảm 12% giá giờ chơi; Ưu tiên đặt cố định ca giờ vàng 17:30 - 21:50; Miễn phí mượn vợt cao cấp Yonex/Victor 2 lần/tháng; Giảm 10% khi mua nước và phụ kiện")
                    .description("Gói phổ biến nhất, tối ưu chi phí cho các cơ thủ và nhóm bạn chơi thường xuyên")
                    .badgeColor("#f59e0b")
                    .icon("fa-solid fa-crown")
                    .active(true)
                    .build();

            MembershipPackage diamond = MembershipPackage.builder()
                    .code("DIAMOND")
                    .name("Kim Cương VIP (Diamond)")
                    .price(1290000.0)
                    .durationDays(365)
                    .discountPercent(20.0)
                    .perks("Giảm 20% trọn đời toàn bộ dịch vụ; Tặng tủ để đồ riêng tại chi nhánh NVL; Miễn phí căng cước vợt 6 lần/năm; Mời khách giao lưu được áp dụng ưu đãi chung")
                    .description("Đặc quyền đẳng cấp nhất hệ thống Ways Station Badminton")
                    .badgeColor("#10b981")
                    .icon("fa-solid fa-gem")
                    .active(true)
                    .build();

            MembershipPackage student = MembershipPackage.builder()
                    .code("STUDENT")
                    .name("Gói Sinh Viên Thần Tốc")
                    .price(99000.0)
                    .durationDays(30)
                    .discountPercent(10.0)
                    .perks("Giảm 10% khung giờ sáng & chiều trước 16:30; Áp dụng cho học sinh, sinh viên các trường đại học")
                    .description("Gói tiếp sức đam mê thể thao trẻ học đường")
                    .badgeColor("#8b5cf6")
                    .icon("fa-solid fa-graduation-cap")
                    .active(true)
                    .build();

            packageRepository.saveAll(List.of(silver, gold, diamond, student));
        }

        // Khởi tạo tài khoản người dùng mẫu nếu chưa có
        if (userRepository.count() == 0) {
            log.info("Khởi tạo tài khoản người dùng và quản trị viên mẫu (mật khẩu mặc định: 123456)...");
            MembershipPackage goldPackage = packageRepository.findByCode("GOLD").orElse(null);
            MembershipPackage diamondPackage = packageRepository.findByCode("DIAMOND").orElse(null);

            User admin = User.builder()
                    .username("admin")
                    .password(PasswordUtil.hashPassword("123456"))
                    .fullName("Quản Trị Viên Hệ Thống")
                    .email("admin@waysstation.vn")
                    .phone("0889555559")
                    .role("ROLE_ADMIN")
                    .membershipPackage(diamondPackage)
                    .membershipExpiresAt(LocalDateTime.now().plusYears(2))
                    .walletBalance(5000000.0)
                    .status("ACTIVE")
                    .build();

            User memberGold = User.builder()
                    .username("hoivien_gold")
                    .password(PasswordUtil.hashPassword("123456"))
                    .fullName("Nguyễn Văn Tuấn")
                    .email("tuan.badminton@gmail.com")
                    .phone("0909123456")
                    .role("ROLE_USER")
                    .membershipPackage(goldPackage)
                    .membershipExpiresAt(LocalDateTime.now().plusDays(85))
                    .walletBalance(850000.0)
                    .status("ACTIVE")
                    .build();

            User normalUser = User.builder()
                    .username("khachhang1")
                    .password(PasswordUtil.hashPassword("123456"))
                    .fullName("Trần Minh Đức")
                    .email("duc.tm@gmail.com")
                    .phone("0912345678")
                    .role("ROLE_USER")
                    .membershipPackage(null)
                    .membershipExpiresAt(null)
                    .walletBalance(0.0)
                    .status("ACTIVE")
                    .build();

            userRepository.saveAll(List.of(admin, memberGold, normalUser));

            // Tạo bản ghi UserMembership mẫu
            if (goldPackage != null) {
                userMembershipRepository.save(UserMembership.builder()
                        .subscriptionCode("SUB-202610-GOLD-01")
                        .user(memberGold)
                        .membershipPackage(goldPackage)
                        .pricePaid(goldPackage.getPrice())
                        .discountApplied(0.0)
                        .startDate(LocalDateTime.now().minusDays(5))
                        .endDate(LocalDateTime.now().plusDays(85))
                        .paymentMethod("VIETQR")
                        .paymentStatus("PAID")
                        .transactionCode("TXN-QR-889922")
                        .notes("Kích hoạt gói Hội Viên Vàng 3 tháng")
                        .build());
            }
        }

        log.info("Khởi tạo dữ liệu mẫu hoàn tất!");
    }
}
