package com.colonelsanders.backend.services;

import com.colonelsanders.backend.database.models.Product;
import com.colonelsanders.backend.database.models.ProductType;
import com.colonelsanders.backend.database.repositories.ProductRepository;
import com.colonelsanders.backend.database.repositories.ProductTypeRepository;
import com.colonelsanders.backend.dto.ProductImportResultDto;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductImportService {

    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;

    public ProductImportService(ProductRepository productRepository, ProductTypeRepository productTypeRepository) {
        this.productRepository = productRepository;
        this.productTypeRepository = productTypeRepository;
    }

    @Transactional
    public ProductImportResultDto importCsv(MultipartFile file) throws IOException {
        int processed = 0;
        int created = 0;
        int updated = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setIgnoreHeaderCase(true)
                 .setIgnoreSurroundingSpaces(true)
                     .setSkipHeaderRecord(true)
                     .setTrim(true)
                     .build()
                     .parse(reader)) {

            Map<String, Integer> headerMap = parser.getHeaderMap();
            validateRequiredHeaders(headerMap);

            for (CSVRecord record : parser) {
                processed++;
                try {
                    String serial = required(record, "sn");
                    String model = required(record, "model");
                    String productTypeName = required(record, "Type");
                    String description = optional(record, "desc");
                    BigDecimal startingPrice = parseStartingPrice(required(record, "st_price"));

                    ProductType productType = resolveProductType(productTypeName);

                    Optional<Product> existing = productRepository.findBySerial(serial);
                    Product product = existing.orElseGet(Product::new);
                    boolean isNew = existing.isEmpty();

                    product.setSerial(serial);
                    product.setModel(model);
                    product.setDescription(description);
                    product.setClosed(false);
                    product.setProductType(productType);
                    product.setStartingPrice(startingPrice);

                    Timestamp now = Timestamp.from(Instant.now());
                    if (isNew) {
                        product.setCreatedAt(now);
                    }
                    product.setUpdatedAt(now);

                    productRepository.save(product);
                    if (isNew) {
                        created++;
                    } else {
                        updated++;
                    }
                } catch (Exception rowException) {
                    failed++;
                    errors.add("Row " + record.getRecordNumber() + ": " + rowException.getMessage());
                }
            }
        }

        return ProductImportResultDto.builder()
                .processed(processed)
                .created(created)
                .updated(updated)
                .failed(failed)
                .errors(errors)
                .build();
    }

    private void validateRequiredHeaders(Map<String, Integer> headers) {
        List<String> requiredHeaders = List.of("Type", "model", "sn", "desc", "st_price");
        for (String header : requiredHeaders) {
            if (!headers.containsKey(header)) {
                throw new IllegalArgumentException("Missing required CSV header: " + header);
            }
        }
    }

    private ProductType resolveProductType(String name) {
        return productTypeRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    ProductType productType = new ProductType();
                    productType.setName(name);
                    return productTypeRepository.save(productType);
                });
    }

    private String required(CSVRecord record, String field) {
        String value = record.get(field);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Field '" + field + "' is required");
        }
        return value.trim();
    }

    private String optional(CSVRecord record, String field) {
        if (!record.isMapped(field)) {
            return null;
        }
        String value = record.get(field);
        return value == null || value.isBlank() ? null : value.trim();
    }

    private BigDecimal parseStartingPrice(String value) {
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Field 'st_price' must be a valid decimal number");
        }
    }
}
