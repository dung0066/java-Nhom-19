package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.model.Product;
import com.example.Dat_san_cau_long.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final com.example.Dat_san_cau_long.repository.ProductInventoryRepository productInventoryRepository;
    private final com.example.Dat_san_cau_long.repository.BranchRepository branchRepository;

    public ProductService(ProductRepository productRepository,
                          com.example.Dat_san_cau_long.repository.ProductInventoryRepository productInventoryRepository,
                          com.example.Dat_san_cau_long.repository.BranchRepository branchRepository) {
        this.productRepository = productRepository;
        this.productInventoryRepository = productInventoryRepository;
        this.branchRepository = branchRepository;
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
                .orElseThrow(() -> new com.example.Dat_san_cau_long.exception.ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id));
    }

    @Transactional
    public Product saveOrUpdate(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @Transactional
    public Product toggleActive(Long id) {
        Product p = getById(id);
        p.setActive(!Boolean.TRUE.equals(p.getActive()));
        return productRepository.save(p);
    }

    public List<com.example.Dat_san_cau_long.model.ProductInventory> getProductInventory(Long productId) {
        return productInventoryRepository.findByIdProductId(productId);
    }

    @Transactional
    public com.example.Dat_san_cau_long.model.ProductInventory updateStock(Long branchId, Long productId, int newStock) {
        if (newStock < 0) {
            throw new IllegalArgumentException("Số lượng tồn kho không được là số âm!");
        }
        com.example.Dat_san_cau_long.model.Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new com.example.Dat_san_cau_long.exception.ResourceNotFoundException("Không tìm thấy chi nhánh ID: " + branchId));
        Product product = getById(productId);

        com.example.Dat_san_cau_long.model.ProductInventory inv = productInventoryRepository.findByBranchIdAndProductId(branchId, productId)
                .orElseGet(() -> com.example.Dat_san_cau_long.model.ProductInventory.builder()
                        .id(new com.example.Dat_san_cau_long.model.ProductInventoryId(branchId, productId))
                        .branch(branch)
                        .product(product)
                        .stockQuantity(0)
                        .build());

        inv.setStockQuantity(newStock);
        return productInventoryRepository.save(inv);
    }
}
