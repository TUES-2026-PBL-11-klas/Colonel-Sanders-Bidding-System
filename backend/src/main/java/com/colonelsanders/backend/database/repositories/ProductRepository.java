package com.colonelsanders.backend.database.repositories;

import com.colonelsanders.backend.database.models.Product;
import org.springframework.data.repository.CrudRepository;

public interface ProductRepository extends CrudRepository<Product, Long> {
}
