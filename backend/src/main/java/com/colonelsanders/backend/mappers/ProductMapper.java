package com.colonelsanders.backend.mappers;

import com.colonelsanders.backend.database.models.Product;
import com.colonelsanders.backend.dto.ProductDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    private final ModelMapper modelMapper;

    public ProductMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public ProductDto mapTo(Product entity) {
        return modelMapper.map(entity, ProductDto.class);
    }

    public Product mapFrom(ProductDto dto) {
        return modelMapper.map(dto, Product.class);
    }
}
