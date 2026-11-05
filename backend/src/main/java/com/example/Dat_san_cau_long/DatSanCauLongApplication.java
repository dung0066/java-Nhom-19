package com.example.Dat_san_cau_long;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

// Hệ thống Đặt sân cầu lông Ways Station Badminton Backend
@SpringBootApplication
@EnableScheduling
public class DatSanCauLongApplication {

	public static void main(String[] args) {
		loadDotenv();
		SpringApplication.run(DatSanCauLongApplication.class, args);
	}

	/**
	 * Nạp biến môi trường từ file .env (nếu có) vào System properties
	 */
	private static void loadDotenv() {
		File[] candidates = new File[] {
			new File(".env"),
			new File("backend/.env"),
			new File("../.env")
		};
		for (File file : candidates) {
			if (file.exists() && file.isFile()) {
				try {
					List<String> lines = Files.readAllLines(file.toPath());
					for (String line : lines) {
						String trimmed = line.trim();
						if (trimmed.isEmpty() || trimmed.startsWith("#") || !trimmed.contains("=")) {
							continue;
						}
						int eqIdx = trimmed.indexOf('=');
						String key = trimmed.substring(0, eqIdx).trim();
						String value = trimmed.substring(eqIdx + 1).trim();
						if ((value.startsWith("\"") && value.endsWith("\"")) ||
							(value.startsWith("'") && value.endsWith("'"))) {
							value = value.substring(1, value.length() - 1);
						}
						if (System.getProperty(key) == null && System.getenv(key) == null) {
							System.setProperty(key, value);
						}
					}
					System.out.println(">>> Đã nạp cấu hình môi trường từ file: " + file.getAbsolutePath());
					break;
				} catch (Exception e) {
					System.err.println("Không thể đọc file .env: " + e.getMessage());
				}
			}
		}
	}

}
