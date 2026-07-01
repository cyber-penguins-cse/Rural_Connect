package com.ruralconnect.controller;

import com.ruralconnect.dto.EnquiryDTO;
import com.ruralconnect.entity.Enquiry;
import com.ruralconnect.entity.User;
import com.ruralconnect.enums.EnquiryStatus;
import com.ruralconnect.service.EnquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enquiries")
@RequiredArgsConstructor
public class EnquiryController {

    private final EnquiryService enquiryService;

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Enquiry> createEnquiry(@Valid @RequestBody EnquiryDTO dto,
                                                  @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(enquiryService.createEnquiry(currentUser, dto));
    }

    @GetMapping("/buyer")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<Enquiry>> getBuyerEnquiries(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(enquiryService.getBuyerEnquiries(currentUser));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<Enquiry>> getSellerEnquiries(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(enquiryService.getSellerEnquiries(currentUser));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('SELLER') or hasRole('BUYER')")
    public ResponseEntity<Enquiry> updateStatus(@PathVariable Long id,
                                                 @RequestParam EnquiryStatus status,
                                                 @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(enquiryService.updateStatus(id, currentUser, status));
    }
}
