package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.model.Article;
import com.example.Dat_san_cau_long.model.Product;
import com.example.Dat_san_cau_long.model.ProductCategory;
import com.example.Dat_san_cau_long.model.enums.ProductType;
import com.example.Dat_san_cau_long.repository.ArticleRepository;
import com.example.Dat_san_cau_long.repository.ProductCategoryRepository;
import com.example.Dat_san_cau_long.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Khởi tạo dữ liệu mẫu thực tế trong SQL Database
 * Tự động chèn Tin tức (Articles) và Sản phẩm/Dịch vụ (Products) khi database chưa có dữ liệu.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ArticleRepository articleRepository;
    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;

    public DataInitializer(ArticleRepository articleRepository,
                           ProductRepository productRepository,
                           ProductCategoryRepository categoryRepository) {
        this.articleRepository = articleRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        seedArticles();
        seedProducts();
    }

    private void seedArticles() {
        if (articleRepository.count() > 0) return;

        List<Article> articles = List.of(
                Article.builder()
                        .title("Khởi Động Cầu Lông Chuẩn Cho Người Mới Tránh Chấn Thương")
                        .summary("Hướng dẫn bài tập khởi động cầu lông chuẩn cho người mới chơi giúp bảo vệ cổ chân, khớp gối và cơ vai khi vận động cường độ cao.")
                        .content("Khởi động kỹ trước khi bước vào sân thi đấu là bước bắt buộc để làm ấm các nhóm cơ, bôi trơn các khớp và phòng ngừa chấn thương đứt dây chằng hay lật sơ mi cổ chân. Các bước gồm: xoay khớp cổ tay cổ chân 3 phút, ép dọc ép ngang 2 phút, bật nhảy nhẹ tại chỗ và vung vợt mô phỏng các động tác smash, phông cầu.")
                        .image("/news/news1.png")
                        .category("KY_THUAT")
                        .categoryLabel("Kỹ Thuật & Sức Khỏe")
                        .author("D2 Coach Team")
                        .readTime("4 phút đọc")
                        .published(true)
                        .build(),

                Article.builder()
                        .title("Sân Cầu Lông Đạt Chuẩn Giúp Tránh Chấn Thương Cho Lông Thủ")
                        .summary("Tìm hiểu 5 tiêu chuẩn chọn sân cầu lông đạt chuẩn giúp bảo vệ khớp, độ nảy thảm Taraflex BWF 7.5mm và hệ thống đèn chống chói.")
                        .content("Hệ thống sân tại D2 BadmintonShop sử dụng thảm thi đấu Taraflex BWF 5 lớp giảm chấn cao cấp giúp triệt tiêu 40% lực phản hồi lên khớp gối khi bật nhảy đập cầu. Đồng thời, độ rọi sáng 600 Lux đạt chuẩn châu Âu bố trí dọc theo hai biên hông sân giúp các lông thủ không bị lóa mắt khi ngước nhìn đón cầu bổng.")
                        .image("/news/news2.png")
                        .category("TIEU_CHUAN")
                        .categoryLabel("Tiêu Chuẩn Sân")
                        .author("Ban Quản Lý D2")
                        .readTime("5 phút đọc")
                        .published(true)
                        .build(),

                Article.builder()
                        .title("Giải Cầu Lông New Academy Lần 2 – Chào Mừng 30/4 Tại D2 BadmintonShop")
                        .summary("Tham gia Giải Cầu Lông New Academy Lần 2 tại Sân D2 BadmintonShop với cơ cấu giải thưởng hấp dẫn lên tới 30 triệu đồng.")
                        .content("Nhân dịp chào mừng đại lễ 30/4 và 1/5, CLB Cầu Lông D2 BadmintonShop phối hợp cùng New Academy tổ chức giải đấu phong trào mở rộng dành cho tất cả các tay vợt nghiệp dư tại TP. Hồ Chí Minh. Các nội dung thi đấu: Đôi Nam, Đôi Nữ và Đôi Nam Nữ phối hợp với cúp vô địch và các phần thưởng vợt, giày Yonex chính hãng.")
                        .image("/news/news3.png")
                        .category("GIAI_DAU")
                        .categoryLabel("Giải Đấu Mở Rộng")
                        .author("BTC Giải Đấu")
                        .readTime("3 phút đọc")
                        .published(true)
                        .build(),

                Article.builder()
                        .title("CLB Cầu Lông D2 BadmintonShop – Sân Chơi Chuyên Nghiệp & Đặt Lịch Giao Lưu")
                        .summary("Bài viết giới thiệu chi tiết về CLB Cầu Lông D2 BadmintonShop, một địa điểm tập luyện và giao lưu cầu lông phong trào sôi nổi hàng tuần.")
                        .content("CLB Cầu Lông D2 BadmintonShop sinh hoạt định kỳ vào các buổi tối thứ 3, 5, 7 và sáng Chủ Nhật tại cụm sân Gò Vấp và Tân Phú. Tại đây, các thành viên được chia nhóm trình độ từ cơ bản đến nâng cao, có huấn luyện viên hướng dẫn kỹ thuật bộ chân và các trận đấu giao lưu gắn kết tinh thần thể thao năng động.")
                        .image("/news/news4.png")
                        .category("SU_KIEN")
                        .categoryLabel("Câu Lạc Bộ")
                        .author("D2 Club Leader")
                        .readTime("5 phút đọc")
                        .published(true)
                        .build()
        );

        articleRepository.saveAll(articles);
        log.info("Đã khởi tạo thành công 4 bài viết tin tức mẫu vào SQL Database!");
    }

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        // Tạo 5 danh mục chuẩn hệ thống
        ProductCategory catRacket = getOrCreateCategory("RACKET", "Vợt Cầu Lông", 1);
        ProductCategory catShoes = getOrCreateCategory("SHOES", "Giày Cầu Lông", 2);
        ProductCategory catDrinks = getOrCreateCategory("REFRESHMENTS", "Nước & Khăn Lạnh", 3);
        ProductCategory catServices = getOrCreateCategory("SERVICES", "Dịch Vụ Căng Cước & Tiện Ích", 4);
        ProductCategory catAccessory = getOrCreateCategory("ACCESSORY", "Phụ Kiện Thể Thao", 5);

        List<Product> products = List.of(
                Product.builder()
                        .name("Vợt Yonex Astrox 88D Pro")
                        .category(catRacket)
                        .brand("Yonex")
                        .productType(ProductType.RENTAL)
                        .price(BigDecimal.valueOf(50000))
                        .priceUnit("/ ca chơi")
                        .badge("Bán chạy nhất")
                        .imageUrl("https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=600&auto=format&fit=crop")
                        .description("Dòng vợt tấn công chuyên nghiệp, smash cắm sân và trợ lực tốt, căng sẵn cước BG65Ti 10.5kg")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Vợt Lining Axforce 90 Max")
                        .category(catRacket)
                        .brand("Lining")
                        .productType(ProductType.RENTAL)
                        .price(BigDecimal.valueOf(45000))
                        .priceUnit("/ ca chơi")
                        .badge("Cao cấp")
                        .imageUrl("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop")
                        .description("Thích hợp cho người chơi công thủ toàn diện, đũa vợt dẻo phản tạt cực nhanh")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Giày Yonex Power Cushion 65Z3")
                        .category(catShoes)
                        .brand("Yonex")
                        .productType(ProductType.RENTAL)
                        .price(BigDecimal.valueOf(35000))
                        .priceUnit("/ ca chơi")
                        .badge("Đủ size 39-44")
                        .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop")
                        .description("Đế cao su bám sân thảm BWF, đệm Power Cushion giảm chấn gót chân và sấy khử khuẩn UV")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Pocari Sweat 500ml")
                        .category(catDrinks)
                        .brand("Pocari")
                        .productType(ProductType.RETAIL)
                        .price(BigDecimal.valueOf(20000))
                        .priceUnit("/ chai")
                        .badge("Bù điện giải")
                        .imageUrl("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop")
                        .description("Bù nước và 5 ion khoáng thiết yếu, chống chuột rút tức thì khi thi đấu")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Revive Chanh Muối 500ml")
                        .category(catDrinks)
                        .brand("Revive")
                        .productType(ProductType.RETAIL)
                        .price(BigDecimal.valueOf(18000))
                        .priceUnit("/ chai")
                        .badge("Ướp lạnh")
                        .imageUrl("https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop")
                        .description("Ướp lạnh sâu, bổ sung muối khoáng và năng lượng cho cơ thể")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Nước khoáng thiên nhiên LaVie 500ml")
                        .category(catDrinks)
                        .brand("LaVie")
                        .productType(ProductType.RETAIL)
                        .price(BigDecimal.valueOf(10000))
                        .priceUnit("/ chai")
                        .badge("Khoáng tự nhiên")
                        .imageUrl("https://images.unsplash.com/photo-1560023907-5f339617ea30?q=80&w=600&auto=format&fit=crop")
                        .description("Nước khoáng thiên nhiên thanh khiết, giải tỏa cơn khát sảng khoái")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Bò Húc Red Bull Thái")
                        .category(catDrinks)
                        .brand("Red Bull")
                        .productType(ProductType.RETAIL)
                        .price(BigDecimal.valueOf(22000))
                        .priceUnit("/ lon")
                        .badge("Tăng lực")
                        .imageUrl("https://images.unsplash.com/photo-1622543925917-763c34d1a86e?q=80&w=600&auto=format&fit=crop")
                        .description("Tỉnh táo, bùng nổ sức mạnh cho set đấu quyết định")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Khăn Lạnh Kháng Khuẩn Bạc Hà")
                        .category(catDrinks)
                        .brand("D2 BadmintonShop")
                        .productType(ProductType.RETAIL)
                        .price(BigDecimal.valueOf(5000))
                        .priceUnit("/ cái")
                        .badge("Mát lạnh")
                        .imageUrl("https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=600&auto=format&fit=crop")
                        .description("Khăn ướt tiệt trùng cao cấp, lau mồ hôi và hạ nhiệt tức thì")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Thuê Khăn Bông Yonex Cotton")
                        .category(catAccessory)
                        .brand("Yonex")
                        .productType(ProductType.RENTAL)
                        .price(BigDecimal.valueOf(25000))
                        .priceUnit("/ buổi")
                        .badge("Cotton 100%")
                        .imageUrl("https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=600&auto=format&fit=crop")
                        .description("Khăn bông 100% cotton Yonex chuyên dụng thể thao, giặt sấy UV thơm tho")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Ký Gửi Tủ Locker Mã PIN")
                        .category(catServices)
                        .brand("D2 Locker")
                        .productType(ProductType.RENTAL)
                        .price(BigDecimal.valueOf(20000))
                        .priceUnit("/ buổi")
                        .badge("Bảo mật")
                        .imageUrl("https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop")
                        .description("Tủ riêng biệt bảo quản đồ an toàn tuyệt đối suốt buổi tập luyện")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Giặt Sấy & Khử Khuẩn Giày UV")
                        .category(catServices)
                        .brand("D2 Care")
                        .productType(ProductType.RENTAL)
                        .price(BigDecimal.valueOf(60000))
                        .priceUnit("/ đôi")
                        .badge("Khử khuẩn UV")
                        .imageUrl("https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop")
                        .description("Vệ sinh sạch sâu đế giày cao su, sấy khô tiệt trùng bằng đèn UV thơm tho 15 phút")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Cước Yonex BG65 (Độ bền cao)")
                        .category(catServices)
                        .brand("Yonex")
                        .productType(ProductType.RETAIL)
                        .price(BigDecimal.valueOf(140000))
                        .priceUnit("/ cây")
                        .badge("Độ bền cao")
                        .imageUrl("https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=600&auto=format&fit=crop")
                        .description("Dây cước phổ biến nhất thế giới, chịu lực bền bỉ và giữ độ căng cực tốt")
                        .active(true)
                        .build(),

                Product.builder()
                        .name("Cước Yonex BG65 Titanium")
                        .category(catServices)
                        .brand("Yonex")
                        .productType(ProductType.RETAIL)
                        .price(BigDecimal.valueOf(160000))
                        .priceUnit("/ cây")
                        .badge("Nổ đanh")
                        .imageUrl("https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=600&auto=format&fit=crop")
                        .description("Âm thanh nổ đanh vang dội, bề mặt trợ lực smash cực cắm và hiểm hóc")
                        .active(true)
                        .build()
        );

        productRepository.saveAll(products);
        log.info("Đã khởi tạo thành công 13 danh mục & sản phẩm D2 BadmintonShop vào SQL Database!");
    }

    private ProductCategory getOrCreateCategory(String code, String name, int sortOrder) {
        return categoryRepository.findByCode(code).orElseGet(() -> {
            ProductCategory cat = ProductCategory.builder()
                    .code(code)
                    .name(name)
                    .build();
            return categoryRepository.save(cat);
        });
    }
}
