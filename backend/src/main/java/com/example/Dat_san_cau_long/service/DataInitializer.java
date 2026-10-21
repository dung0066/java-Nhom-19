package com.example.Dat_san_cau_long.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Override
    public void run(String... args) {
        log.info("Khởi động hệ thống Đặt sân cầu lông (Ways Station Badminton v2). Dữ liệu mẫu được quản lý qua database_v2_27bang.sql.");
    }
}
