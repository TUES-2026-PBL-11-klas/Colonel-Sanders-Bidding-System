package com.colonelsanders.backend.mappers;

import com.colonelsanders.backend.database.models.AppUser;
import com.colonelsanders.backend.dto.AppUserDto;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class AppUserMapper {

    private final ModelMapper modelMapper;

    public AppUserMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public AppUserDto mapTo(AppUser entity) {
        return modelMapper.map(entity, AppUserDto.class);
    }

    public AppUser mapFrom(AppUserDto dto) {
        return modelMapper.map(dto, AppUser.class);
    }
}
