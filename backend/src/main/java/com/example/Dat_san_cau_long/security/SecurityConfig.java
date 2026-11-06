package com.example.Dat_san_cau_long.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Cấu hình bảo mật: JWT không lưu phiên (stateless), phân quyền theo vai trò, CORS giới hạn origin,
 * security headers và chống brute force (xem RateLimitFilter).
 * Nguyên tắc: mặc định mọi đường dẫn đều phải đăng nhập, chỉ những endpoint nêu rõ mới công khai.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;

    public SecurityConfig(JwtAuthenticationEntryPoint authenticationEntryPoint,
                          CustomAccessDeniedHandler accessDeniedHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          RateLimitFilter rateLimitFilter) {
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.rateLimitFilter = rateLimitFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000",
                "https://dungmmo.io.vn",
                "http://dungmmo.io.vn",
                "http://160.191.243.196"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .headers(headers -> headers
                        .contentTypeOptions(Customizer.withDefaults())
                        .frameOptions(frame -> frame.deny())
                        .referrerPolicy(ref -> ref.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        // script-src 'self': chỉ chạy script cùng nguồn (không chạy script nhúng hay từ nguồn lạ); object-src 'none': cấm plugin/flash
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "script-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"))
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ---- Xác thực: chỉ đăng nhập, đăng ký và quên mật khẩu (OTP) là công khai ----
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register", "/api/auth/forgot-password/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/forgot-password/**").permitAll()
                        .requestMatchers("/api/auth/test-mail", "/api/auth/users").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/auth/me", "/api/auth/profile", "/api/auth/change-password", "/api/auth/otp/**").authenticated()

                        // ---- Ví và hội viên ----
                        .requestMatchers("/api/wallet/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/memberships/packages/**").permitAll()
                        .requestMatchers("/api/memberships/admin/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/memberships/**").authenticated()

                        // ---- Danh mục công khai (chỉ đọc) ----
                        .requestMatchers(HttpMethod.GET, "/api/booking/branches", "/api/booking/matrix/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/branches/**", "/api/courts/**", "/api/products/**", "/api/articles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/slot-transfers/market").permitAll()

                        // ---- Đặt sân: khách vãng lai được tạo đơn và tra cứu theo mã; xem tất cả đơn chỉ dành cho nhân viên ----
                        .requestMatchers(HttpMethod.POST, "/api/booking/create", "/api/booking/quote", "/api/payment/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/booking/code/**", "/api/booking/lookup").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/booking/all").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers("/api/booking/**").authenticated()
                        .requestMatchers("/api/slot-transfers/**").authenticated()

                        // ---- Ghi dữ liệu danh mục: chỉ quản trị ----
                        .requestMatchers("/api/branches/**", "/api/courts/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/products/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")

                        // ---- Khu quản trị ----
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")

                        // ---- Trang tĩnh ----
                        .requestMatchers("/", "/home", "/dat-san", "/booking", "/san", "/admin", "/index.html", "/favicon.ico",
                                "/error", "/static/**", "/assets/**", "/css/**", "/js/**").permitAll()

                        // Mọi đường dẫn chưa khai báo ở trên đều bắt buộc đăng nhập
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
