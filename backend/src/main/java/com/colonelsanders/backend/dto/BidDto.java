package com.colonelsanders.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidDto {
    private Long id;
    private Long productId;
    private Long appUserId;
    private String appUserEmail;
    private BigDecimal price;
}
