package com.example.Dat_san_cau_long.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI badmintonOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Hệ Thống Đặt Sân Cầu Lông")
                        .description("Tài liệu API Swagger / OpenAPI cho dự án Đặt sân cầu lông (Nhóm 19)")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Nhóm 19")
                                .email("support@datsancaulong.vn")));
    }
}
