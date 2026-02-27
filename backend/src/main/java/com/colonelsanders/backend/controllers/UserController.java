package com.colonelsanders.backend.controllers;

import com.colonelsanders.backend.database.repositories.AppUserRepository;
import com.colonelsanders.backend.dto.AppUserDto;
import com.colonelsanders.backend.mappers.AppUserMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AppUserRepository userRepository;
    private final AppUserMapper appUserMapper;

    public UserController(AppUserRepository userRepository, AppUserMapper appUserMapper) {
        this.userRepository = userRepository;
        this.appUserMapper = appUserMapper;
    }

    @GetMapping
    public List<AppUserDto> getAllUsers() {
        return StreamSupport.stream(userRepository.findAll().spliterator(), false)
                .map(appUserMapper::mapTo)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppUserDto> getUserById(@PathVariable("id") Long id) {
        return userRepository.findById(id)
                .map(user -> new ResponseEntity<>(appUserMapper.mapTo(user), HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
