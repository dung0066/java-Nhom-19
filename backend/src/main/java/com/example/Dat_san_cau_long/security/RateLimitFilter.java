package com.example.Dat_san_cau_long.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Chống brute force và spam bằng giới hạn số lần gọi theo địa chỉ IP (cửa sổ trượt, lưu trong bộ nhớ):
 *  - Đăng nhập: sau N lần sai liên tiếp thì khóa IP trong thời gian cửa sổ, đăng nhập đúng thì xóa bộ đếm.
 *  - Quên mật khẩu / OTP: tối đa N yêu cầu mỗi cửa sổ (chặn dò mã OTP và spam gửi mail).
 *  - Đăng ký: tối đa N lượt mỗi cửa sổ.
 *  - Tra cứu đơn theo SĐT hoặc mã: tối đa N lượt mỗi cửa sổ (chặn dò thông tin khách).
 * Vượt giới hạn thì trả 429 Too Many Requests.
 * Chỉ đọc địa chỉ kết nối thật (getRemoteAddr), không tin header X-Forwarded-For vì client có thể giả mạo.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final int loginMaxFailures;
    private final long loginWindowMs;
    private final int otpMaxRequests;
    private final long otpWindowMs;
    private final int registerMaxRequests;
    private final long registerWindowMs;
    private final int lookupMaxRequests;
    private final long lookupWindowMs;

    /** key = loại giới hạn + IP, value = các mốc thời gian (ms) trong cửa sổ hiện tại */
    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    public RateLimitFilter(
            @Value("${app.security.login-max-failures:5}") int loginMaxFailures,
            @Value("${app.security.login-window-minutes:15}") int loginWindowMinutes,
            @Value("${app.security.otp-max-requests:5}") int otpMaxRequests,
            @Value("${app.security.otp-window-minutes:10}") int otpWindowMinutes,
            @Value("${app.security.register-max-requests:10}") int registerMaxRequests,
            @Value("${app.security.register-window-minutes:60}") int registerWindowMinutes,
            @Value("${app.security.lookup-max-requests:30}") int lookupMaxRequests,
            @Value("${app.security.lookup-window-minutes:1}") int lookupWindowMinutes) {
        this.loginMaxFailures = loginMaxFailures;
        this.loginWindowMs = loginWindowMinutes * 60_000L;
        this.otpMaxRequests = otpMaxRequests;
        this.otpWindowMs = otpWindowMinutes * 60_000L;
        this.registerMaxRequests = registerMaxRequests;
        this.registerWindowMs = registerWindowMinutes * 60_000L;
        this.lookupMaxRequests = lookupMaxRequests;
        this.lookupWindowMs = lookupWindowMinutes * 60_000L;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        String ip = request.getRemoteAddr();

        if ("POST".equals(method) && path.equals("/api/auth/login")) {
            String key = "login:" + ip;
            if (count(key, loginWindowMs) >= loginMaxFailures) {
                reject(response, "Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau " + (loginWindowMs / 60_000) + " phút!");
                return;
            }
            chain.doFilter(request, response);
            if (response.getStatus() == HttpServletResponse.SC_UNAUTHORIZED) {
                record(key);
            } else if (response.getStatus() == HttpServletResponse.SC_OK) {
                hits.remove(key);
            }
            return;
        }

        if (path.startsWith("/api/auth/forgot-password") || path.startsWith("/api/auth/otp")) {
            if (tooMany("otp:" + ip, otpMaxRequests, otpWindowMs)) {
                reject(response, "Bạn gửi yêu cầu quá nhiều lần. Vui lòng thử lại sau " + (otpWindowMs / 60_000) + " phút!");
                return;
            }
        } else if ("POST".equals(method) && path.equals("/api/auth/register")) {
            if (tooMany("register:" + ip, registerMaxRequests, registerWindowMs)) {
                reject(response, "Bạn đăng ký quá nhiều lần. Vui lòng thử lại sau!");
                return;
            }
        } else if ("GET".equals(method) && path.equals("/api/booking/lookup")) {
            if (tooMany("lookup:" + ip, lookupMaxRequests, lookupWindowMs)) {
                reject(response, "Bạn tra cứu quá nhanh. Vui lòng thử lại sau ít phút!");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    /** Ghi nhận một lượt và cho biết đã vượt giới hạn chưa. */
    private boolean tooMany(String key, int max, long windowMs) {
        if (count(key, windowMs) >= max) {
            return true;
        }
        record(key);
        return false;
    }

    private int count(String key, long windowMs) {
        Deque<Long> deque = hits.get(key);
        if (deque == null) {
            return 0;
        }
        synchronized (deque) {
            long cutoff = System.currentTimeMillis() - windowMs;
            while (!deque.isEmpty() && deque.peekFirst() < cutoff) {
                deque.pollFirst();
            }
            return deque.size();
        }
    }

    private void record(String key) {
        Deque<Long> deque = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (deque) {
            deque.addLast(System.currentTimeMillis());
        }
    }

    private void reject(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"" + message + "\"}");
    }
}
