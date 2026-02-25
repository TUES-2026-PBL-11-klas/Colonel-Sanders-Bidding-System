package com.colonelsanders.backend.controllers;

import com.colonelsanders.backend.database.models.Product;
import com.colonelsanders.backend.database.repositories.ProductRepository;
import com.colonelsanders.backend.dto.ProductImportResultDto;
import com.colonelsanders.backend.services.ProductImportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
public class ProductImportController {

    private final ProductImportService productImportService;
    private final ProductRepository productRepository;

    public ProductImportController(ProductImportService productImportService, ProductRepository productRepository) {
        this.productImportService = productImportService;
        this.productRepository = productRepository;
    }

    @GetMapping(path = "/api/products")
    public List<Product> findAll() {
        return StreamSupport.stream(productRepository.findAll().spliterator(), false)
                .collect(Collectors.toList());
    }

    @GetMapping(path = "/api/products/{id}")
    public ResponseEntity<Product> findById(@PathVariable("id") Long id) {
        Optional<Product> foundProduct = productRepository.findById(id);
        return foundProduct.map(product -> new ResponseEntity<>(product, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping(path = "/api/products/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductImportResultDto> importProducts(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            ProductImportResultDto result = ProductImportResultDto.builder()
                    .processed(0)
                    .created(0)
                    .updated(0)
                    .failed(0)
                    .errors(java.util.List.of("CSV file is required"))
                    .build();
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        }

        try {
            ProductImportResultDto result = productImportService.importCsv(file);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            ProductImportResultDto result = ProductImportResultDto.builder()
                    .processed(0)
                    .created(0)
                    .updated(0)
                    .failed(0)
                    .errors(java.util.List.of(ex.getMessage()))
                    .build();
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        } catch (IOException ex) {
            ProductImportResultDto result = ProductImportResultDto.builder()
                    .processed(0)
                    .created(0)
                    .updated(0)
                    .failed(0)
                    .errors(java.util.List.of("Failed to read CSV file"))
                    .build();
            return new ResponseEntity<>(result, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
