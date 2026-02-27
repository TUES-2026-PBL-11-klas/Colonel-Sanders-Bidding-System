package com.colonelsanders.backend.controllers;

import com.colonelsanders.backend.database.models.AppUser;
import com.colonelsanders.backend.database.models.Bid;
import com.colonelsanders.backend.dto.BidRequestDto;
import com.colonelsanders.backend.services.BidService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BidController.class)
public class BidControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private BidService bidService;

    @Autowired
    private ObjectMapper objectMapper;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createBid_unauthenticated_returnsUnauthorized() throws Exception {
        BidRequestDto req = BidRequestDto.builder().productId(1L).price(new BigDecimal("10.00")).build();

        mvc.perform(post("/api/bids").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createBid_authenticated_returnsCreated() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("user@example.com", "x"));

        BidRequestDto req = BidRequestDto.builder().productId(1L).price(new BigDecimal("10.00")).build();
        Bid out = new Bid();
        out.setId(11L);
        out.setPrice(new BigDecimal("10.00"));
        out.setCreatedAt(Timestamp.from(Instant.now()));

        when(bidService.createBid(req, "user@example.com")).thenReturn(out);

        mvc.perform(post("/api/bids").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(11));
    }
}
