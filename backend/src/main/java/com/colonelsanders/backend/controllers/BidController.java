package com.colonelsanders.backend.controllers;

import com.colonelsanders.backend.database.models.Bid;
import com.colonelsanders.backend.dto.BidDto;
import com.colonelsanders.backend.dto.BidRequestDto;
import com.colonelsanders.backend.mappers.BidMapper;
import com.colonelsanders.backend.services.BidService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BidController {

    private final BidService bidService;
    private final BidMapper bidMapper;

    public BidController(BidService bidService, BidMapper bidMapper) {
        this.bidService = bidService;
        this.bidMapper = bidMapper;
    }

    @PostMapping(path = "/api/bids")
    public ResponseEntity<?> createBid(@RequestBody BidRequestDto request) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return new ResponseEntity<>(
                        java.util.Map.of("error", "User must be authenticated to create a bid"),
                        HttpStatus.UNAUTHORIZED);
            }

            String userEmail = authentication.getName();
            Bid createdBid = bidService.createBid(request, userEmail);
            BidDto bidDto = bidMapper.mapTo(createdBid);
            return new ResponseEntity<>(bidDto, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            return new ResponseEntity<>(
                    java.util.Map.of("error", ex.getMessage()),
                    HttpStatus.BAD_REQUEST);
        } catch (Exception ex) {
            return new ResponseEntity<>(
                    java.util.Map.of("error", "Failed to create bid: " + ex.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
