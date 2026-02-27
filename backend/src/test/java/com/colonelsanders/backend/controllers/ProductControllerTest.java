package com.colonelsanders.backend.controllers;

import com.colonelsanders.backend.database.models.Product;
import com.colonelsanders.backend.database.repositories.BidRepository;
import com.colonelsanders.backend.database.repositories.ProductRepository;
import com.colonelsanders.backend.dto.ProductImportResultDto;
import com.colonelsanders.backend.services.ProductImageStorageService;
import com.colonelsanders.backend.services.ProductImportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
public class ProductControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private ProductImportService productImportService;

    @MockBean
    private ProductRepository productRepository;

    @MockBean
    private ProductImageStorageService productImageStorageService;

    @MockBean
    private BidRepository bidRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void findAll_returnsProducts() throws Exception {
        Product p = new Product();
        p.setId(1L);
        p.setModel("X");
        p.setSerial("S1");
        p.setClosed(false);
        when(productRepository.findAll()).thenReturn(List.of(p));

        mvc.perform(get("/api/products").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void findById_notFound() throws Exception {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        mvc.perform(get("/api/products/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void findById_found() throws Exception {
        Product p = new Product();
        p.setId(2L);
        p.setModel("M");
        p.setSerial("S2");
        p.setClosed(false);
        when(productRepository.findById(2L)).thenReturn(Optional.of(p));

        mvc.perform(get("/api/products/2").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.model").value("M"));
    }

    @Test
    void importProducts_emptyFile_returnsBadRequest() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "", "text/csv", new byte[0]);

        mvc.perform(multipart("/api/products/import").file(emptyFile))
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadProductImage_productNotFound_returnsNotFound() throws Exception {
        when(productRepository.findById(5L)).thenReturn(Optional.empty());
        MockMultipartFile file = new MockMultipartFile("file", "img.jpg", "image/jpeg", "data".getBytes());

        mvc.perform(multipart("/api/products/5/image").file(file))
                .andExpect(status().isNotFound());
    }

    @Test
    void uploadProductImage_success_returnsOk() throws Exception {
        Product p = new Product();
        p.setId(7L);
        p.setModel("m");
        p.setSerial("s");
        p.setClosed(false);
        when(productRepository.findById(7L)).thenReturn(Optional.of(p));
        when(productImageStorageService.uploadProductImage(any(), any())).thenReturn("obj-key");
        when(productImageStorageService.getPresignedUrl("obj-key")).thenReturn("http://url");

        MockMultipartFile file = new MockMultipartFile("file", "img.jpg", "image/jpeg", "data".getBytes());

        mvc.perform(multipart("/api/products/7/image").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageObjectKey").value("obj-key"))
                .andExpect(jsonPath("$.imageUrl").value("http://url"));
    }

    @Test
    void closeAuction_notFound_returnsNotFound() throws Exception {
        when(productRepository.findById(10L)).thenReturn(Optional.empty());
        mvc.perform(post("/api/products/10/close"))
                .andExpect(status().isNotFound());
    }

    @Test
    void closeAuction_alreadyClosed_returnsBadRequest() throws Exception {
        Product p = new Product();
        p.setId(11L);
        p.setClosed(true);
        when(productRepository.findById(11L)).thenReturn(Optional.of(p));
        mvc.perform(post("/api/products/11/close"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Auction is already closed"));
    }

    @Test
    void closeAuction_success_setsClosed() throws Exception {
        Product p = new Product();
        p.setId(12L);
        p.setClosed(false);
        when(productRepository.findById(12L)).thenReturn(Optional.of(p));

        mvc.perform(post("/api/products/12/close"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.closed").value(true));
    }
}
