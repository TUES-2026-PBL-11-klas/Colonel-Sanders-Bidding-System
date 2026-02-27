package com.colonelsanders.backend.services;

import com.colonelsanders.backend.database.models.AppUser;
import com.colonelsanders.backend.database.models.Role;
import com.colonelsanders.backend.database.repositories.AppUserRepository;
import com.colonelsanders.backend.dto.UserImportResultDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserImportService {

    private static final String PASSWORD_CHARS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
    private static final int PASSWORD_LENGTH = 12;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserImportService(AppUserRepository userRepository, PasswordEncoder passwordEncoder,
                             EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public UserImportResultDto importCsv(MultipartFile file) throws IOException {
        int processed = 0;
        int created = 0;
        int skipped = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                String email = line.trim();

                if (email.isEmpty() || email.startsWith("#")) {
                    continue;
                }

                // skip header row if present
                if (lineNumber == 1 && email.equalsIgnoreCase("email")) {
                    continue;
                }

                processed++;
                try {
                    if (!isValidEmail(email)) {
                        failed++;
                        errors.add("Row " + lineNumber + ": invalid email format '" + email + "'");
                        continue;
                    }

                    if (userRepository.findByEmail(email).isPresent()) {
                        skipped++;
                        errors.add("Row " + lineNumber + ": email already exists '" + email + "'");
                        continue;
                    }

                    String rawPassword = generatePassword();

                    AppUser user = new AppUser();
                    user.setEmail(email);
                    user.setPassword(passwordEncoder.encode(rawPassword));
                    user.setRole(Role.USER);
                    userRepository.save(user);

                    created++;

                    emailService.sendCredentials(email, rawPassword);
                } catch (Exception ex) {
                    failed++;
                    errors.add("Row " + lineNumber + ": " + ex.getMessage());
                }
            }
        }

        return UserImportResultDto.builder()
                .processed(processed)
                .created(created)
                .skipped(skipped)
                .failed(failed)
                .errors(errors)
                .build();
    }

    private String generatePassword() {
        StringBuilder sb = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            sb.append(PASSWORD_CHARS.charAt(RANDOM.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }
}
