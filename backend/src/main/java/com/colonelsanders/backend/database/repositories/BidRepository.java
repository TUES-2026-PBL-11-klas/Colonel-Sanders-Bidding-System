package com.colonelsanders.backend.database.repositories;

import com.colonelsanders.backend.database.models.Bid;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface BidRepository extends CrudRepository<Bid, Long> {
    Optional<Bid> findTopByProductIdOrderByPriceDesc(Long productId);
}
