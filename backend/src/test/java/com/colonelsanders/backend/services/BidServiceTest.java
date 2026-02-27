package com.colonelsanders.backend.services;

import com.colonelsanders.backend.database.models.AppUser;
import com.colonelsanders.backend.database.models.Bid;
import com.colonelsanders.backend.database.models.Product;
import com.colonelsanders.backend.database.repositories.AppUserRepository;
import com.colonelsanders.backend.database.repositories.BidRepository;
import com.colonelsanders.backend.database.repositories.ProductRepository;
import com.colonelsanders.backend.dto.BidRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class BidServiceTest {

    @Mock
    private BidRepository bidRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @InjectMocks
    private BidService bidService;

    private BidRequestDto req;

    @BeforeEach
    void setUp() {
        req = BidRequestDto.builder().productId(1L).price(new BigDecimal("10.00")).build();
    }

    @Test
    void createBid_productNotFound_throws() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bidService.createBid(req, "u@e.com"));
        assertTrue(ex.getMessage().contains("Product not found"));
    }

    @Test
    void createBid_userNotFound_throws() {
        Product p = new Product();
        p.setId(1L);
        p.setClosed(false);
        p.setStartingPrice(new BigDecimal("5.00"));
        when(productRepository.findById(1L)).thenReturn(Optional.of(p));
        when(appUserRepository.findByEmail("u@e.com")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bidService.createBid(req, "u@e.com"));
        assertTrue(ex.getMessage().contains("User not found"));
    }

    @Test
    void createBid_existingBid_throws() {
        Product p = new Product();
        p.setId(1L);
        p.setClosed(false);
        p.setStartingPrice(new BigDecimal("5.00"));
        when(productRepository.findById(1L)).thenReturn(Optional.of(p));

        AppUser u = new AppUser();
        u.setId(2L);
        u.setEmail("u@e.com");
        when(appUserRepository.findByEmail("u@e.com")).thenReturn(Optional.of(u));

        when(bidRepository.findByProductIdAndAppUserId(1L, 2L)).thenReturn(Optional.of(new Bid()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bidService.createBid(req, "u@e.com"));
        assertTrue(ex.getMessage().contains("already placed a bid"));
    }

    @Test
    void createBid_success_savesAndReturns() {
        Product p = new Product();
        p.setId(1L);
        p.setClosed(false);
        p.setStartingPrice(new BigDecimal("5.00"));
        when(productRepository.findById(1L)).thenReturn(Optional.of(p));

        AppUser u = new AppUser();
        u.setId(2L);
        u.setEmail("u@e.com");
        when(appUserRepository.findByEmail("u@e.com")).thenReturn(Optional.of(u));

        when(bidRepository.findByProductIdAndAppUserId(1L, 2L)).thenReturn(Optional.empty());

        Bid saved = new Bid();
        saved.setId(99L);
        saved.setPrice(req.getPrice());
        when(bidRepository.save(org.mockito.ArgumentMatchers.any(Bid.class))).thenReturn(saved);

        Bid out = bidService.createBid(req, "u@e.com");
        assertNotNull(out);
        assertEquals(99L, out.getId());
    }
}
