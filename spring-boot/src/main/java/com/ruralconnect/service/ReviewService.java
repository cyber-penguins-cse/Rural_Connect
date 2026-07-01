package com.ruralconnect.service;

import com.ruralconnect.dto.ReviewDTO;
import com.ruralconnect.entity.Enquiry;
import com.ruralconnect.entity.Review;
import com.ruralconnect.entity.User;
import com.ruralconnect.enums.EnquiryStatus;
import com.ruralconnect.repository.EnquiryRepository;
import com.ruralconnect.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final EnquiryRepository enquiryRepository;

    public Review createReview(User buyer, ReviewDTO dto) {
        Enquiry enquiry = enquiryRepository.findById(dto.getEnquiryId())
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));

        if (!enquiry.getBuyer().getId().equals(buyer.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        if (enquiry.getStatus() != EnquiryStatus.COMPLETED) {
            throw new RuntimeException("Can only review completed enquiries");
        }
        if (reviewRepository.existsByEnquiryId(dto.getEnquiryId())) {
            throw new RuntimeException("Review already submitted");
        }

        Review review = Review.builder()
                .buyer(buyer)
                .seller(enquiry.getSeller())
                .product(enquiry.getProduct())
                .enquiry(enquiry)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        return reviewRepository.save(review);
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId);
    }
}
