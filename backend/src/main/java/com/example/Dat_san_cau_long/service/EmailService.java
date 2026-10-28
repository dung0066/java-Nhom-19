package com.example.Dat_san_cau_long.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:waysstation.badminton@gmail.com}")
    private String fromEmail;

    @Autowired(required = false)
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Gửi Email chứa mã xác thực OTP 6 số để đổi / đặt lại mật khẩu
     */
    public boolean sendOtpEmail(String toEmail, String recipientName, String otpCode) {
        String subject = "[Ways Station Badminton] Mã xác thực OTP đặt lại mật khẩu: " + otpCode;
        String htmlContent = buildOtpHtmlContent(recipientName, otpCode);

        log.info("=================================================================");
        log.info(">>> [OTP EMAIL SERVICE] Đang gửi mã OTP [{}] tới email: {}", otpCode, toEmail);
        log.info("=================================================================");

        if (mailSender == null) {
            log.warn("JavaMailSender chưa được cấu hình. Mã OTP [{}] được ghi nhận vào hệ thống.", otpCode);
            return true;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Ways Station Badminton");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info(" Đã gửi thành công email chứa mã OTP [{}] tới: {}", otpCode, toEmail);
            return true;
        } catch (Exception ex) {
            log.warn("⚠️ Không thể gửi mail qua SMTP Server ({}) - Mã OTP hiển thị tại log: [{}]", ex.getMessage(), otpCode);
            return true;
        }
    }

    /**
     * Kiểm tra trực tiếp kết nối và gửi mail qua Google SMTP Server
     */
    public Map<String, Object> testSmtpConnection(String targetEmail) {
        String testEmail = (targetEmail != null && !targetEmail.isBlank()) ? targetEmail : fromEmail;
        try {
            if (mailSender == null) {
                return Map.of("success", false, "error", "JavaMailSender chưa được khởi tạo!");
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "Ways Station Badminton");
            helper.setTo(testEmail);
            helper.setSubject("[Ways Station] Kiểm tra cấu hình Gmail SMTP thành công!");
            
            String html = """
                <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 500px;">
                    <h2 style="color: #0284c7; margin-top: 0;">🎉 Kết Nối Gmail SMTP Thành Công!</h2>
                    <p>Hệ thống Đặt sân cầu lông <b>Ways Station</b> đã kết nối thành công tới máy chủ <b>smtp.gmail.com:587</b>.</p>
                    <p>Địa chỉ người gửi: <code>{{FROM}}</code></p>
                    <p>Địa chỉ nhận thử nghiệm: <code>{{TO}}</code></p>
                    <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 16px 0;" />
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Các mã xác thực OTP 6 số sẽ được gửi tự động và an toàn tới email người dùng.</p>
                </div>
            """.replace("{{FROM}}", fromEmail).replace("{{TO}}", testEmail);

            helper.setText(html, true);
            mailSender.send(message);
            log.info(" Đã gửi thành công email test SMTP tới: {}", testEmail);
            return Map.of("success", true, "message", "Đã gửi email test thành công tới: " + testEmail);
        } catch (Exception ex) {
            log.error("❌ Lỗi khi gửi test qua Gmail SMTP: {}", ex.getMessage());
            return Map.of("success", false, "error", ex.getMessage() != null ? ex.getMessage() : ex.toString());
        }
    }

    private String buildOtpHtmlContent(String name, String otpCode) {
        String safeName = (name != null && !name.isBlank()) ? name : "Quý khách";
        String html = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }
                    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
                    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
                    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
                    .body { padding: 32px 28px; color: #334155; line-height: 1.6; }
                    .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
                    .otp-box { background: #f8fafc; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
                    .otp-label { font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
                    .otp-code { font-size: 36px; font-weight: 900; color: #0284c7; letter-spacing: 8px; margin: 10px 0; font-family: monospace; }
                    .note { font-size: 13px; color: #ef4444; font-weight: 600; margin-top: 6px; }
                    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <h1>WAYS STATION BADMINTON</h1>
                        <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">Hệ Thống Đặt Sân Cầu Lông Tiêu Chuẩn Quốc Tế BWF</p>
                    </div>
                    <div class="body">
                        <div class="greeting">Xin chào {{NAME}},</div>
                        <p>Hệ thống nhận được yêu cầu <strong>đặt lại mật khẩu tài khoản</strong> của bạn trên Cổng Quản Trị Ways Station Badminton.</p>
                        <p>Dưới đây là mã xác thực OTP 6 chữ số của bạn:</p>
                        <div class="otp-box">
                            <div class="otp-label">Mã Xác Thực OTP (Hiệu lực 10 phút)</div>
                            <div class="otp-code">{{OTP}}</div>
                            <div class="note">⚠️ Tuyệt đối không chia sẻ mã này cho bất kỳ ai!</div>
                        </div>
                        <p style="font-size: 13px; color: #64748b;">Sau khi nhập đúng mã OTP trên màn hình xác thực, hệ thống sẽ tự động chuyển tiếp bạn tới trang nhập mật khẩu mới.</p>
                        <p style="font-size: 13px; color: #64748b;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với bộ phận kỹ thuật để bảo vệ tài khoản.</p>
                    </div>
                    <div class="footer">
                        &copy; 2026 Ways Station Badminton Club. Hotline hỗ trợ: 0889 555 559
                    </div>
                </div>
            </body>
            </html>
            """;
        return html.replace("{{NAME}}", safeName).replace("{{OTP}}", otpCode);
    }
}
