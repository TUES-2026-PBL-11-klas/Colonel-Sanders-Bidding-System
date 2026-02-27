package com.colonelsanders.backend.services;

import com.colonelsanders.backend.database.models.Product;
import com.colonelsanders.backend.database.models.ProductType;
import com.colonelsanders.backend.database.repositories.ProductRepository;
import com.colonelsanders.backend.database.repositories.ProductTypeRepository;
import com.colonelsanders.backend.dto.ProductImportResultDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProductImportServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductTypeRepository productTypeRepository;

    @InjectMocks
    private ProductImportService importService;

    private String goodCsv;
    private String badHeaderCsv;

    @BeforeEach
    void setUp() {
        goodCsv = "Type,model,sn,desc,st_price\n" +
                "Widget,A,123,,5.00\n";
        badHeaderCsv = "wrong,header\n";
    }

    @Test
    void importCsv_validFile_createsProduct() throws Exception {
        ProductType type = new ProductType();
        type.setName("Widget");
        when(productTypeRepository.findByNameIgnoreCase("Widget")).thenReturn(Optional.of(type));

        when(productRepository.findBySerial("123")).thenReturn(Optional.empty());
        when(productRepository.save(org.mockito.ArgumentMatchers.any(Product.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        MockMultipartFile file = new MockMultipartFile("file", "products.csv",
                "text/csv", goodCsv.getBytes(StandardCharsets.UTF_8));

        ProductImportResultDto result = importService.importCsv(file);
        assertEquals(1, result.getProcessed());
        assertEquals(1, result.getCreated());
        assertEquals(0, result.getFailed());
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    void importCsv_missingHeader_throws() {
        MockMultipartFile file = new MockMultipartFile("file", "bad.csv",
                "text/csv", badHeaderCsv.getBytes(StandardCharsets.UTF_8));

        assertThrows(IllegalArgumentException.class, () -> importService.importCsv(file));
    }
}
