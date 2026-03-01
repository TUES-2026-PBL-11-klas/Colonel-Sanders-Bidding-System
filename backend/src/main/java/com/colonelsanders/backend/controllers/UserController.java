package com.colonelsanders.backend.controllers;

import com.colonelsanders.backend.database.repositories.AppUserRepository;
import com.colonelsanders.backend.dto.AppUserDto;
import com.colonelsanders.backend.dto.UserImportResultDto;
import com.colonelsanders.backend.mappers.AppUserMapper;
import com.colonelsanders.backend.services.UserImportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AppUserRepository userRepository;
    private final AppUserMapper appUserMapper;
    private final UserImportService userImportService;

    public UserController(AppUserRepository userRepository, AppUserMapper appUserMapper,
                          UserImportService userImportService) {
        this.userRepository = userRepository;
        this.appUserMapper = appUserMapper;
        this.userImportService = userImportService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AppUserDto> getAllUsers() {
        return StreamSupport.stream(userRepository.findAll().spliterator(), false)
                .map(appUserMapper::mapTo)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppUserDto> getUserById(@PathVariable("id") Long id) {
        return userRepository.findById(id)
                .map(user -> new ResponseEntity<>(appUserMapper.mapTo(user), HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping(path = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserImportResultDto> importUsers(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            UserImportResultDto result = UserImportResultDto.builder()
                    .processed(0).created(0).skipped(0).failed(0)
                    .errors(List.of("CSV file is required"))
                    .build();
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        }

        try {
            UserImportResultDto result = userImportService.importCsv(file);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (IOException ex) {
            UserImportResultDto result = UserImportResultDto.builder()
                    .processed(0).created(0).skipped(0).failed(0)
                    .errors(List.of("Failed to read CSV file"))
                    .build();
            return new ResponseEntity<>(result, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
