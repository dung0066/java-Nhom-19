package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.Product;
import com.example.Dat_san_cau_long.model.ProductInventory;
import com.example.Dat_san_cau_long.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.saveOrUpdate(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
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
        Long branchId = ((Number) body.get("branchId")).longValue();
        int stockQuantity = ((Number) body.get("stockQuantity")).intValue();
        ProductInventory updated = productService.updateStock(branchId, id, stockQuantity);
        return ResponseEntity.ok(updated);
    }
}
