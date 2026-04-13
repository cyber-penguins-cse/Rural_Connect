package com.ruralconnect.repository;

import com.ruralconnect.entity.Enquiry;
import com.ruralconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {
    List<Enquiry> findByBuyerOrderByCreatedAtDesc(User buyer);
    List<Enquiry> findBySellerOrderByCreatedAtDesc(User seller);
}
