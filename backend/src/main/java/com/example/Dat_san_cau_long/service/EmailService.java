
package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.BookingDetail;
import com.example.Dat_san_cau_long.model.BookingItem;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.Locale;
import java.util.Map;


@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:d2shop.badminton@gmail.com}")
    private String fromEmail;

    @Autowired(required = false)
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Gửi Email chứa mã xác thực OTP 6 số để đổi / đặt lại mật khẩu
     */
    public boolean sendOtpEmail(String toEmail, String recipientName, String otpCode) {
        String subject = "[D2 SHOP] Mã xác thực OTP: " + otpCode;
        String htmlContent = buildOtpHtmlContent(recipientName, otpCode);

        log.info(">>> [D2 SHOP EMAIL] Đang gửi mã OTP [{}] tới: {}", otpCode, toEmail);

        if (mailSender == null) {
            log.warn("JavaMailSender chưa được cấu hình. Mã OTP [{}] được ghi nhận vào hệ thống.", otpCode);
            return true;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "D2 SHOP");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi thành công email OTP [{}] tới: {}", otpCode, toEmail);
            return true;
        } catch (Exception ex) {
            log.warn("Không thể gửi mail qua SMTP Server ({}) - Mã OTP hiển thị tại log: [{}]", ex.getMessage(), otpCode);
            return true;
        }
    }

    /**
     * Kiểm tra trực tiếp kết nối và gửi mail thử nghiệm qua Google SMTP Server
     */
    public Map<String, Object> testSmtpConnection(String targetEmail) {
        String testEmail = (targetEmail != null && !targetEmail.isBlank()) ? targetEmail : fromEmail;
        try {
            if (mailSender == null) {
                return Map.of("success", false, "error", "JavaMailSender chưa được khởi tạo!");
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "D2 SHOP");
            helper.setTo(testEmail);
            helper.setSubject("[D2 SHOP] Kiểm tra cấu hình Gmail SMTP thành công!");

            String html = """
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 480px; margin: 0 auto;">
                    <div style="background-color: #0284c7; color: #ffffff; padding: 14px; border-radius: 6px; text-align: center; margin-bottom: 14px;">
                        <h2 style="margin: 0; font-size: 18px;">D2 SHOP</h2>
                        <p style="margin: 2px 0 0; font-size: 13px; opacity: 0.9;">Kết Nối Google SMTP Thành Công</p>
                    </div>
                    <p>Hệ thống đã kết nối thành công tới máy chủ <b>smtp.gmail.com:587</b>.</p>
                    <p>Người gửi: <code>{{FROM}}</code></p>
                    <p>Người nhận: <code>{{TO}}</code></p>
                </div>
            """.replace("{{FROM}}", fromEmail).replace("{{TO}}", testEmail);

            helper.setText(html, true);
            mailSender.send(message);
            return Map.of("success", true, "message", "Đã gửi email test thành công tới: " + testEmail);
        } catch (Exception ex) {
            log.error("Lỗi khi gửi test qua Gmail SMTP: {}", ex.getMessage());
            return Map.of("success", false, "error", ex.getMessage() != null ? ex.getMessage() : ex.toString());
        }
    }

    /**
     * Mẫu Email tự động ngắn gọn, ít icon, mã OTP được bôi đậm nổi bật
     */
    /**
     * Gửi email xác nhận đặt sân thành công (CHỈ GỬI KHI ĐÃ THANH TOÁN XONG)
     */
    public boolean sendBookingSuccessEmail(Booking booking) {
        if (booking == null) return false;
        String toEmail = booking.getCustomerEmail();
        if (toEmail == null || toEmail.isBlank() || !toEmail.contains("@")) {
            log.info("[EMAIL ĐẶT SÂN] Khách không cung cấp email hoặc email không hợp lệ ({}), bỏ qua gửi mail.", toEmail);
            return false;
        }

        String subject = "[WAYS STATION] Xác nhận thanh toán & đặt sân thành công - " + booking.getBookingCode();
        String htmlContent = buildBookingSuccessHtmlContent(booking);

        log.info(">>> [EMAIL ĐẶT SÂN] Đang gửi xác nhận đơn [{}] tới: {}", booking.getBookingCode(), toEmail);

        if (mailSender == null) {
            log.warn("JavaMailSender chưa được cấu hình. Bỏ qua gửi email xác nhận đặt sân.");
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Ways Station Badminton");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi thành công email xác nhận đặt sân [{}] tới: {}", booking.getBookingCode(), toEmail);
            return true;
        } catch (Exception ex) {
            log.error("Lỗi khi gửi email xác nhận đặt sân qua Gmail SMTP: {}", ex.getMessage());
            return false;
        }
    }

    private String buildBookingSuccessHtmlContent(Booking booking) {
        String customerName = booking.getCustomerName() != null ? booking.getCustomerName() : "Quý khách";
        String customerPhone = booking.getCustomerPhone() != null ? booking.getCustomerPhone() : "Chưa cập nhật";
        String bookingCode = booking.getBookingCode() != null ? booking.getBookingCode() : "N/A";
        String branchName = booking.getBranch() != null ? booking.getBranch().getName() : "Ways Station Badminton";
        String branchAddress = (booking.getBranch() != null && booking.getBranch().getAddress() != null)
                ? booking.getBranch().getAddress() : "";

        NumberFormat currencyFormat = NumberFormat.getInstance(new Locale("vi", "VN"));
        String totalPrice = (booking.getTotalPrice() != null) ? currencyFormat.format(booking.getTotalPrice()) + " đ" : "0 đ";

        // Tạo bảng danh sách ca sân
        StringBuilder slotsHtml = new StringBuilder();
        if (booking.getDetails() != null && !booking.getDetails().isEmpty()) {
            for (BookingDetail d : booking.getDetails()) {
                String courtName = d.getCourt() != null ? "Sân " + d.getCourt().getCourtNumber() : "Sân đấu";
                String timeSlotStr = d.getTimeSlot() != null
                        ? d.getTimeSlot().getStartTime() + " - " + d.getTimeSlot().getEndTime() : "";
                String dateStr = d.getSlotDate() != null ? d.getSlotDate().toString() : "";
                String priceStr = d.getPrice() != null ? currencyFormat.format(d.getPrice()) + " đ" : "";

                slotsHtml.append(String.format("""
                    <tr>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13.5px; color: #1e293b;"><b>%s</b></td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13.5px; color: #1e293b;">%s</td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13.5px; color: #0284c7; font-weight: 600;">%s</td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13.5px; color: #16a34a; text-align: right; font-weight: 700;">%s</td>
                    </tr>
                """, courtName, dateStr, timeSlotStr, priceStr));
            }
        } else {
            slotsHtml.append("<tr><td colspan='4' style='padding: 12px; text-align: center; color: #64748b;'>Không có ca sân</td></tr>");
        }

        // Tạo dịch vụ kèm theo (nếu có)
        StringBuilder itemsHtml = new StringBuilder();
        if (booking.getItems() != null && !booking.getItems().isEmpty()) {
            itemsHtml.append("<div style='margin-top: 14px;'><div style='font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px;'>Dịch vụ & Đồ uống đi kèm:</div>");
            for (BookingItem item : booking.getItems()) {
                String pName = item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm";
                int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                String itemPrice = item.getUnitPrice() != null ? currencyFormat.format(item.getUnitPrice()) + " đ" : "";
                itemsHtml.append(String.format("<div style='font-size: 13px; color: #334155;'>&bull; %s (x%d) - %s</div>", pName, qty, itemPrice));
            }
            itemsHtml.append("</div>");
        }

        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>Xác nhận đặt sân</title>
            </head>
            <body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); margin: 0 auto;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 22px 24px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">WAYS STATION BADMINTON</h1>
                            <p style="margin: 6px 0 0; color: #dcfce7; font-size: 14px; font-weight: 600;">✓ ĐÃ THANH TOÁN & ĐẶT SÂN THÀNH CÔNG</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 24px;">
                            <p style="margin: 0 0 14px; font-size: 15px; color: #0f172a;">Xin chào <b>%s</b>,</p>
                            <p style="margin: 0 0 18px; font-size: 14px; color: #475569; line-height: 1.5;">
                                Hệ thống xác nhận bạn đã thanh toán thành công cho đơn đặt sân tại <b>%s</b>. Dưới đây là thông tin chi tiết:
                            </p>

                            <!-- Khối Mã Đơn Hàng -->
                            <div style="background-color: #f0fdf4; border: 1.5px dashed #22c55e; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
                                <div style="font-size: 12px; color: #15803d; font-weight: 700; text-transform: uppercase;">MÃ ĐẶT SÂN CỦA BẠN:</div>
                                <div style="font-size: 22px; font-weight: 900; color: #166534; font-family: 'Courier New', Courier, monospace; margin: 4px 0;">%s</div>
                                <div style="font-size: 12.5px; color: #475569;">Người đặt: <b>%s</b> - SĐT: <b>%s</b></div>
                                <div style="font-size: 12.5px; color: #475569;">Địa chỉ: %s</div>
                            </div>

                            <!-- Bảng chi tiết ca sân -->
                            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Danh sách ca sân đã đặt:</div>
                            <table width="100%%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
                                <thead>
                                    <tr style="background-color: #f8fafc; text-align: left;">
                                        <th style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; font-size: 12.5px; color: #64748b;">SÂN</th>
                                        <th style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; font-size: 12.5px; color: #64748b;">NGÀY</th>
                                        <th style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; font-size: 12.5px; color: #64748b;">GIỜ CHƠI</th>
                                        <th style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; font-size: 12.5px; color: #64748b; text-align: right;">GIÁ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    %s
                                </tbody>
                            </table>

                            %s

                            <!-- Tổng tiền -->
                            <div style="background-color: #f8fafc; border-radius: 8px; padding: 14px 18px; margin-top: 18px; text-align: right; border: 1px solid #e2e8f0;">
                                <span style="font-size: 14px; color: #475569; font-weight: 600;">Tổng tiền đã thanh toán: </span>
                                <span style="font-size: 20px; color: #16a34a; font-weight: 900; margin-left: 8px;">%s</span>
                                <div style="font-size: 12px; color: #16a34a; font-weight: 600; margin-top: 4px;">✓ Đã xác nhận thanh toán tự động</div>
                            </div>

                            <p style="margin: 20px 0 0; font-size: 13.5px; color: #475569; line-height: 1.5;">
                                Quý khách vui lòng đến trước 10 phút để nhận sân. Xuất trình <b>mã đặt sân (%s)</b> tại quầy lễ tân nếu cần hỗ trợ.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
                            <b>WAYS STATION BADMINTON</b><br/>
                            Chúc quý khách có những trận cầu thật sảng khoái và vui vẻ!
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        """, customerName, branchName, bookingCode, customerName, customerPhone, branchAddress,
            slotsHtml.toString(), itemsHtml.toString(), totalPrice, bookingCode);
    }

    private String buildOtpHtmlContent(String name, String otpCode) {
        String safeName = (name != null && !name.isBlank()) ? name : "Quý khách";

        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Mã OTP - D2 SHOP</title>
            </head>
            <body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); margin: 0 auto;">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #0284c7; padding: 18px 24px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">D2 SHOP</h1>
                            <p style="margin: 3px 0 0; color: #e0f2fe; font-size: 12.5px;">Xác thực tài khoản</p>
                        </td>
                    </tr>

                    <!-- Nội dung chính -->
                    <tr>
                        <td style="padding: 26px 24px 20px;">
                            <p style="margin: 0 0 12px; font-size: 15px; color: #0f172a;">Xin chào <b>{{NAME}}</b>,</p>
                            <p style="margin: 0 0 18px; font-size: 14px; color: #475569; line-height: 1.5;">
                                Bạn vừa yêu cầu mã xác thực để đặt lại mật khẩu tại <b>D2 SHOP</b>. Mã OTP của bạn là:
                            </p>

                            <!-- Khối Mã OTP Bôi Đậm Nổi Bật -->
                            <div style="background-color: #f8fafc; border: 2px dashed #0284c7; border-radius: 10px; padding: 18px 12px; text-align: center; margin: 18px 0;">
                                <div style="font-size: 11.5px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                                    MÃ XÁC THỰC OTP
                                </div>
                                <div style="font-size: 38px; font-weight: 900; color: #0f172a; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; line-height: 1.2;">
                                    <strong>{{OTP}}</strong>
                                </div>
                                <div style="font-size: 12px; color: #dc2626; font-weight: 700; margin-top: 6px;">
                                    Hiệu lực trong 10 phút
                                </div>
                            </div>

                            <p style="margin: 0 0 8px; font-size: 13px; color: #475569; line-height: 1.5;">
                                &bull; <b>Lưu ý:</b> Tuyệt đối không chia sẻ mã này cho bất kỳ ai.<br/>
                                &bull; Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
                            <b>D2 SHOP</b> &bull; Hotline: <b>0914 977 030</b><br/>
                            <span style="color: #94a3b8; font-size: 11px;">Email tự động, vui lòng không phản hồi thư này.</span>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
            .replace("{{NAME}}", safeName)
            .replace("{{OTP}}", otpCode);
    }
}
