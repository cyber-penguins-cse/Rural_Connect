package com.ruralconnect.controller;

import com.ruralconnect.dto.ProductDTO;
import com.ruralconnect.entity.Product;
import com.ruralconnect.entity.User;
import com.ruralconnect.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<Product>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.getApprovedProducts(page, size, categoryId, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<Product>> getMyProducts(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(productService.getSellerProducts(currentUser));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductDTO dto,
                                                  @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(productService.createProduct(currentUser, dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                  @Valid @RequestBody ProductDTO dto,
                                                  @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(productService.updateProduct(id, currentUser, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id,
                                                              @AuthenticationPrincipal User currentUser) {
        productService.deleteProduct(id, currentUser);
        return ResponseEntity.ok(Map.of("message", "Product deleted"));
    }
}
