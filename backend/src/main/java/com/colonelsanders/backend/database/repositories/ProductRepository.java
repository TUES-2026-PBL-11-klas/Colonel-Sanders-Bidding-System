package com.colonelsanders.backend.database.repositories;

import com.colonelsanders.backend.database.models.Product;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface ProductRepository extends CrudRepository<Product, Long> {
	Optional<Product> findBySerial(String serial);
}
