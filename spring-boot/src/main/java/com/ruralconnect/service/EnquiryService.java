package com.ruralconnect.service;

import com.ruralconnect.dto.EnquiryDTO;
import com.ruralconnect.entity.Enquiry;
import com.ruralconnect.entity.Product;
import com.ruralconnect.entity.User;
import com.ruralconnect.enums.EnquiryStatus;
import com.ruralconnect.repository.EnquiryRepository;
import com.ruralconnect.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;
    private final ProductRepository productRepository;

    public Enquiry createEnquiry(User buyer, EnquiryDTO dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Enquiry enquiry = Enquiry.builder()
                .buyer(buyer)
                .seller(product.getSeller())
                .product(product)
                .message(dto.getMessage())
                .status(EnquiryStatus.PENDING)
                .build();

        return enquiryRepository.save(enquiry);
    }

    public List<Enquiry> getBuyerEnquiries(User buyer) {
        return enquiryRepository.findByBuyerOrderByCreatedAtDesc(buyer);
    }

    public List<Enquiry> getSellerEnquiries(User seller) {
        return enquiryRepository.findBySellerOrderByCreatedAtDesc(seller);
    }

    public Enquiry updateStatus(Long enquiryId, User currentUser, EnquiryStatus newStatus) {
        Enquiry enquiry = enquiryRepository.findById(enquiryId)
                .orElseThrow(() -> new RuntimeException("Enquiry not found"));

        boolean isSeller = enquiry.getSeller().getId().equals(currentUser.getId());
        boolean isBuyer = enquiry.getBuyer().getId().equals(currentUser.getId());

        if (!isSeller && !isBuyer) throw new RuntimeException("Unauthorized");

        if (newStatus == EnquiryStatus.ACCEPTED || newStatus == EnquiryStatus.REJECTED) {
            if (!isSeller) throw new RuntimeException("Only seller can accept/reject");
        }
        if (newStatus == EnquiryStatus.COMPLETED) {
            if (!isSeller) throw new RuntimeException("Only seller can mark as completed");
        }

        enquiry.setStatus(newStatus);
        return enquiryRepository.save(enquiry);
    }
}
