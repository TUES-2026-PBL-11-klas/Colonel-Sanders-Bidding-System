package com.colonelsanders.backend.database.repositories;

import com.colonelsanders.backend.database.models.ProductType;
import org.springframework.data.repository.CrudRepository;

public interface ProductTypeRepository extends CrudRepository<ProductType, Long> {
}
