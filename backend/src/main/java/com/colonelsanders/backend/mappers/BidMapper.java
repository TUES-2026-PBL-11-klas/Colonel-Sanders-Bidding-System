package com.colonelsanders.backend.mappers;

import com.colonelsanders.backend.database.models.Bid;
import com.colonelsanders.backend.dto.BidDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class BidMapper {

    private final ModelMapper modelMapper;

    public BidMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public BidDto mapTo(Bid entity) {
        return modelMapper.map(entity, BidDto.class);
    }

    public Bid mapFrom(BidDto dto) {
        return modelMapper.map(dto, Bid.class);
    }
}
