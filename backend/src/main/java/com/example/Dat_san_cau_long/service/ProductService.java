package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Product;
import com.example.Dat_san_cau_long.model.ProductCategory;
import com.example.Dat_san_cau_long.model.ProductInventory;
import com.example.Dat_san_cau_long.model.ProductInventoryId;
import com.example.Dat_san_cau_long.repository.BookingItemRepository;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.ProductCategoryRepository;
import com.example.Dat_san_cau_long.repository.ProductInventoryRepository;
import com.example.Dat_san_cau_long.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Quản lý sản phẩm (vợt, giày, nước...) và tồn kho theo từng chi nhánh. */
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final ProductInventoryRepository productInventoryRepository;
    private final BranchRepository branchRepository;
    private final BookingItemRepository bookingItemRepository;

    public ProductService(ProductRepository productRepository,
                          ProductCategoryRepository categoryRepository,
                          ProductInventoryRepository productInventoryRepository,
                          BranchRepository branchRepository,
                          BookingItemRepository bookingItemRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productInventoryRepository = productInventoryRepository;
        this.branchRepository = branchRepository;
        this.bookingItemRepository = bookingItemRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAllWithCategory();
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> getByCategory(String category) {
        return productRepository.findByCategoryCodeAndActiveTrue(category);
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id));
    }

    /** Thêm mới hoặc cập nhật sản phẩm; danh mục được gắn lại từ database trước khi lưu. */
    @Transactional
    public Product saveOrUpdate(Product product) {
        if (product.getCategory() != null) {
            product.setCategory(resolveCategory(product.getCategory()));
        }
        return productRepository.save(product);
    }

    /**
     * Có id thì lấy danh mục trong database; chỉ có mã thì tìm theo mã (viết hoa),
     * chưa có thì tạo mới. Không có cả hai thì giữ nguyên danh mục gửi lên.
     */
    private ProductCategory resolveCategory(ProductCategory category) {
        if (category.getId() != null) {
            return categoryRepository.findById(category.getId()).orElse(category);
        }
        if (category.getCode() != null) {
            String upperCode = category.getCode().toUpperCase();
            return categoryRepository.findByCode(upperCode)
                    .orElseGet(() -> categoryRepository.save(
                            ProductCategory.builder().code(upperCode).name(upperCode).build()));
        }
        return category;
    }

    /** Sản phẩm đã được dùng trong đơn đặt sân thì không xóa (giữ lịch sử đơn), chỉ nên tắt bán. */
    @Transactional
    public void deleteProduct(Long id) {
        getById(id);
        long usedCount = bookingItemRepository.countByProductId(id);
        if (usedCount > 0) {
            throw new IllegalStateException("Sản phẩm đã có trong " + usedCount
                    + " đơn đặt sân nên không thể xóa. Hãy tắt bán sản phẩm thay vì xóa!");
        }
        productRepository.deleteById(id);
    }

    /** Bật/tắt trạng thái bán của sản phẩm. */
    @Transactional
    public Product toggleActive(Long id) {
        Product p = getById(id);
        p.setActive(!Boolean.TRUE.equals(p.getActive()));
        return productRepository.save(p);
    }

    public List<ProductInventory> getProductInventory(Long productId) {
        return productInventoryRepository.findByIdProductId(productId);
    }

    /** Đặt số lượng tồn kho của một sản phẩm tại một chi nhánh (chưa có dòng tồn kho thì tạo mới). */
    @Transactional
    public ProductInventory updateStock(Long branchId, Long productId, int newStock) {
        if (newStock < 0) {
            throw new IllegalArgumentException("Số lượng tồn kho không được là số âm!");
        }
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh ID: " + branchId));
        Product product = getById(productId);

        ProductInventory inv = productInventoryRepository.findByBranchIdAndProductId(branchId, productId)
                .orElseGet(() -> ProductInventory.builder()
                        .id(new ProductInventoryId(branchId, productId))
                        .branch(branch)
                        .product(product)
                        .stockQuantity(0)
                        .build());

        inv.setStockQuantity(newStock);
        return productInventoryRepository.save(inv);
    }
}
