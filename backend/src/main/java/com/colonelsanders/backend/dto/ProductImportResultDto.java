package com.colonelsanders.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImportResultDto {
    private int processed;
    private int created;
    private int updated;
    private int failed;
    private List<String> errors;
}
