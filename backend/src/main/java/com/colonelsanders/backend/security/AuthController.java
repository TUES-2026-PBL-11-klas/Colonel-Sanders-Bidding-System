package com.colonelsanders.backend.security;

import com.colonelsanders.backend.database.repositories.AppUserRepository;
import com.colonelsanders.backend.dto.UserImportResultDto;
import com.colonelsanders.backend.services.UserImportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import com.colonelsanders.backend.services.UserImportService;
import com.colonelsanders.backend.dto.UserImportResultDto;
import com.colonelsanders.backend.database.models.AppUser;



import com.colonelsanders.backend.security.JwtService;
import com.colonelsanders.backend.database.models.Role;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserImportService userImportService;

    public AuthController(AppUserRepository userRepository, PasswordEncoder passwordEncoder,
                          AuthenticationManager authManager, JwtService jwtService,
                          UserImportService userImportService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.userImportService = userImportService;
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        var user = userRepository.findByEmail(req.email()).orElseThrow();
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.isNeedsPasswordReset()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest req) {
        var user = userRepository.findByEmail(req.email()).orElseThrow();
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        user.setNeedsPasswordReset(false);
        userRepository.save(user);
        return ResponseEntity.ok("Password reset successfully");
    }

    @PostMapping(path = "/import-users", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserImportResultDto> importUsers(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            UserImportResultDto result = UserImportResultDto.builder()
                    .processed(0).created(0).skipped(0).failed(0)
                    .errors(java.util.List.of("CSV file is required"))
                    .build();
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        }

        try {
            UserImportResultDto result = userImportService.importCsv(file);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (IOException ex) {
            UserImportResultDto result = UserImportResultDto.builder()
                    .processed(0).created(0).skipped(0).failed(0)
                    .errors(java.util.List.of("Failed to read CSV file"))
                    .build();
            return new ResponseEntity<>(result, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}

// Records for request/response bodies


record LoginRequest(String email, String password) {}
record AuthResponse(String token, boolean needsPasswordReset) {}
record ResetPasswordRequest(String email, String newPassword) {}