package com.ruralconnect.service;

import com.ruralconnect.dto.ProductDTO;
import com.ruralconnect.entity.Category;
import com.ruralconnect.entity.Product;
import com.ruralconnect.entity.User;
import com.ruralconnect.enums.ProductStatus;
import com.ruralconnect.repository.CategoryRepository;
import com.ruralconnect.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<Product> getApprovedProducts(int page, int size, Long categoryId, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (categoryId != null) {
            return productRepository.findByStatusAndCategoryId(ProductStatus.APPROVED, categoryId, pageable);
        }
        if (search != null && !search.isBlank()) {
            return productRepository.findByStatusAndTitleContaining(ProductStatus.APPROVED, search, pageable);
        }
        return productRepository.findByStatus(ProductStatus.APPROVED, pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> getSellerProducts(User seller) {
        return productRepository.findBySeller(seller);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll(Sort.by("createdAt").descending());
    }

    public Product createProduct(User seller, ProductDTO dto) {
        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        }

        Product product = Product.builder()
                .seller(seller)
                .category(category)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .imageUrl(dto.getImageUrl())
                .status(ProductStatus.PENDING)
                .build();

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, User seller, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        }

        product.setTitle(dto.getTitle());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(category);
        product.setStatus(ProductStatus.PENDING);

        return productRepository.save(product);
    }

    public void deleteProduct(Long id, User seller) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        productRepository.delete(product);
    }

    public Product updateStatus(Long id, ProductStatus status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(status);
        return productRepository.save(product);
    }
}
