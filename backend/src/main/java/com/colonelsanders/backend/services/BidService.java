package com.colonelsanders.backend.services;

import com.colonelsanders.backend.database.models.AppUser;
import com.colonelsanders.backend.database.models.Bid;
import com.colonelsanders.backend.database.models.Product;
import com.colonelsanders.backend.database.repositories.AppUserRepository;
import com.colonelsanders.backend.database.repositories.BidRepository;
import com.colonelsanders.backend.database.repositories.ProductRepository;
import com.colonelsanders.backend.dto.BidRequestDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final ProductRepository productRepository;
    private final AppUserRepository appUserRepository;

    public BidService(BidRepository bidRepository,
                      ProductRepository productRepository,
                      AppUserRepository appUserRepository) {
        this.bidRepository = bidRepository;
        this.productRepository = productRepository;
        this.appUserRepository = appUserRepository;
    }

    public Bid createBid(BidRequestDto request, String userEmail) {
        Optional<Product> productOpt = productRepository.findById(request.getProductId());
        if (productOpt.isEmpty()) {
            throw new IllegalArgumentException("Product not found with id: " + request.getProductId());
        }

        if (productOpt.get().getClosed() != null && productOpt.get().getClosed()) {
            throw new IllegalArgumentException("Cannot bid on a closed product");
        }

        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than 0");
        }

        if (productOpt.get().getStartingPrice() != null &&
                request.getPrice().compareTo(productOpt.get().getStartingPrice()) < 0) {
            throw new IllegalArgumentException("Price must be at least the starting price of "
                    + productOpt.get().getStartingPrice());
        }

        Optional<AppUser> userOpt = appUserRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        Bid bid = new Bid();
        bid.setProduct(productOpt.get());
        bid.setAppUser(userOpt.get());
        bid.setPrice(request.getPrice());
        bid.setCreatedAt(Timestamp.from(Instant.now()));

        return bidRepository.save(bid);
    }
}
