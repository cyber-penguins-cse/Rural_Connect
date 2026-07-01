package com.ruralconnect.controller;

import com.ruralconnect.dto.ReviewDTO;
import com.ruralconnect.entity.Review;
import com.ruralconnect.entity.User;
import com.ruralconnect.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Review> createReview(@Valid @RequestBody ReviewDTO dto,
                                                @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(reviewService.createReview(currentUser, dto));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }
}
