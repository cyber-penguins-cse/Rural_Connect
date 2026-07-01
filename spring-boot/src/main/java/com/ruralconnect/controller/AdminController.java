package com.ruralconnect.controller;

import com.ruralconnect.entity.Product;
import com.ruralconnect.entity.User;
import com.ruralconnect.enums.ProductStatus;
import com.ruralconnect.service.AdminService;
import com.ruralconnect.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{userId}/suspend")
    public ResponseEntity<User> suspendUser(@PathVariable Long userId,
                                             @RequestParam boolean suspend) {
        return ResponseEntity.ok(adminService.suspendUser(userId, suspend));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PatchMapping("/products/{id}/status")
    public ResponseEntity<Product> updateProductStatus(@PathVariable Long id,
                                                        @RequestParam ProductStatus status) {
        return ResponseEntity.ok(productService.updateStatus(id, status));
    }

    @GetMapping("/products/pending")
    public ResponseEntity<List<Product>> getPendingProducts() {
        return ResponseEntity.ok(productService.getAllProducts()
                .stream()
                .filter(p -> p.getStatus() == ProductStatus.PENDING)
                .toList());
    }
}
