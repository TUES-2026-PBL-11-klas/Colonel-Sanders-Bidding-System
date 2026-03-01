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
import org.springframework.http.HttpStatus;
import jakarta.servlet.http.HttpServletRequest;
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
    public AuthController(AppUserRepository userRepository, PasswordEncoder passwordEncoder,
                          AuthenticationManager authManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
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

    // simple logout; the request must supply the token in Authorization header
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        jwtService.revokeToken(token);
        return ResponseEntity.ok("Logged out successfully");
    }

}

// Records for request/response bodies


record LoginRequest(String email, String password) {}
record AuthResponse(String token, boolean needsPasswordReset) {}
record ResetPasswordRequest(String email, String newPassword) {}