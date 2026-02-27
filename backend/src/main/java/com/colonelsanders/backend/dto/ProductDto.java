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
public class ProductDto {
    private Long id;
    private ProductTypeDto productType;
    private String model;
    private String description;
    private String serial;
    private Boolean closed;
    private String imageObjectKey;
    private BigDecimal startingPrice;
}
