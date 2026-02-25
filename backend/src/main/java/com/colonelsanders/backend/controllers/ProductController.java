package com.colonelsanders.backend.controllers;

import com.colonelsanders.backend.database.models.Product;
import com.colonelsanders.backend.database.repositories.ProductRepository;
import com.colonelsanders.backend.dto.ProductImportResultDto;
import com.colonelsanders.backend.services.ProductImageStorageService;
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
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
public class ProductController {

    private final ProductImportService productImportService;
    private final ProductRepository productRepository;
    private final ProductImageStorageService productImageStorageService;

    public ProductController(ProductImportService productImportService,
                                   ProductRepository productRepository,
                                   ProductImageStorageService productImageStorageService) {
        this.productImportService = productImportService;
        this.productRepository = productRepository;
        this.productImageStorageService = productImageStorageService;
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

    @PostMapping(path = "/api/products/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProductImage(@PathVariable("id") Long id, @RequestParam("file") MultipartFile file) {
        Optional<Product> foundProduct = productRepository.findById(id);
        if (foundProduct.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        if (file == null || file.isEmpty()) {
            return new ResponseEntity<>(Map.of("error", "Image file is required"), HttpStatus.BAD_REQUEST);
        }

        Product product = foundProduct.get();
        String objectKey = productImageStorageService.uploadProductImage(product, file);
        product.setImageObjectKey(objectKey);
        productRepository.save(product);

        String imageUrl = productImageStorageService.getPresignedUrl(objectKey);
        return new ResponseEntity<>(
                Map.of(
                        "productId", String.valueOf(product.getId()),
                        "imageObjectKey", objectKey,
                        "imageUrl", imageUrl
                ),
                HttpStatus.OK
        );
    }

    @GetMapping(path = "/api/products/{id}/image-url")
    public ResponseEntity<?> getProductImageUrl(@PathVariable("id") Long id) {
        Optional<Product> foundProduct = productRepository.findById(id);
        if (foundProduct.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Product product = foundProduct.get();
        if (product.getImageObjectKey() == null || product.getImageObjectKey().isBlank()) {
            return new ResponseEntity<>(Map.of("error", "Product does not have an image"), HttpStatus.NOT_FOUND);
        }

        String imageUrl = productImageStorageService.getPresignedUrl(product.getImageObjectKey());
        return new ResponseEntity<>(
                Map.of(
                        "productId", String.valueOf(product.getId()),
                        "imageObjectKey", product.getImageObjectKey(),
                        "imageUrl", imageUrl
                ),
                HttpStatus.OK
        );
    }
}
