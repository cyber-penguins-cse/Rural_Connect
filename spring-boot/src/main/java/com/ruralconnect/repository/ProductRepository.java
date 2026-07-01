package com.ruralconnect.repository;

import com.ruralconnect.entity.Product;
import com.ruralconnect.entity.User;
import com.ruralconnect.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findByStatusAndTitleContaining(@Param("status") ProductStatus status,
                                                  @Param("search") String search,
                                                  Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.category.id = :categoryId")
    Page<Product> findByStatusAndCategoryId(@Param("status") ProductStatus status,
                                             @Param("categoryId") Long categoryId,
                                             Pageable pageable);

    List<Product> findBySeller(User seller);

    List<Product> findByStatus(ProductStatus status);
}
