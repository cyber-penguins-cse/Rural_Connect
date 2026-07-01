package com.ruralconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnquiryDTO {
    @NotNull
    private Long productId;
    @NotBlank
    private String message;
}
