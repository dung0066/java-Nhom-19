package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.Product;
import com.example.Dat_san_cau_long.validation.OnCreate;
import com.example.Dat_san_cau_long.model.ProductInventory;
import com.example.Dat_san_cau_long.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@Validated(OnCreate.class) @RequestBody Product product) {
        product.setId(null);
        return ResponseEntity.ok(productService.saveOrUpdate(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                 @Validated(OnCreate.class) @RequestBody Product product) {
        productService.getById(id); // báo 404 nếu sản phẩm không tồn tại
        product.setId(id);
        return ResponseEntity.ok(productService.saveOrUpdate(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa sản phẩm thành công!"));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Product> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(productService.toggleActive(id));
    }

    @GetMapping("/{id}/inventory")
    public ResponseEntity<List<ProductInventory>> getProductInventory(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductInventory(id));
    }

    @PutMapping("/{id}/inventory")
    public ResponseEntity<ProductInventory> updateStock(@PathVariable Long id,
                                                        @RequestBody Map<String, Object> body) {
        if (!(body.get("branchId") instanceof Number) || !(body.get("stockQuantity") instanceof Number)) {
            throw new IllegalArgumentException("Vui lòng chọn chi nhánh và nhập số lượng tồn kho hợp lệ!");
        }
        Long branchId = ((Number) body.get("branchId")).longValue();
        int stockQuantity = ((Number) body.get("stockQuantity")).intValue();
        ProductInventory updated = productService.updateStock(branchId, id, stockQuantity);
        return ResponseEntity.ok(updated);
    }
}
