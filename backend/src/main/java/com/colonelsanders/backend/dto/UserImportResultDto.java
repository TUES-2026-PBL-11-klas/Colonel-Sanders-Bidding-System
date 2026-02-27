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
public class UserImportResultDto {
    private int processed;
    private int created;
    private int skipped;
    private int failed;
    private List<String> errors;
}
