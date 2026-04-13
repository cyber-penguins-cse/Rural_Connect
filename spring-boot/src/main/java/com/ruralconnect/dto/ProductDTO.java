package com.ruralconnect.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductDTO {
    @NotBlank
    private String title;
    @NotBlank
    private String description;
    @NotNull @DecimalMin("0.01")
    private BigDecimal price;
    private Long categoryId;
    private String imageUrl;
}
