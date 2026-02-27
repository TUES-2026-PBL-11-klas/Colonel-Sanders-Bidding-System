package com.colonelsanders.backend.services;

import com.colonelsanders.backend.database.models.AppUser;
import com.colonelsanders.backend.database.models.Role;
import com.colonelsanders.backend.database.repositories.AppUserRepository;
import com.colonelsanders.backend.dto.UserImportResultDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserImportServiceTest {

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserImportService importService;

    private String csvData;

    @BeforeEach
    void setup() {
        csvData = "email\n" +
                "foo@example.com\n" +
                "bad-email\n" +
                "foo@example.com\n"; // duplicate
    }

    @Test
    void importCsv_processesRows() throws Exception {
        when(userRepository.findByEmail("foo@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(org.mockito.ArgumentMatchers.anyString())).thenReturn("encrypted");

        MockMultipartFile file = new MockMultipartFile("file", "users.csv",
                "text/csv", csvData.getBytes(StandardCharsets.UTF_8));

        UserImportResultDto result = importService.importCsv(file);
        assertEquals(2, result.getProcessed()); // header skipped, duplicate skipped
        assertEquals(1, result.getCreated());
        assertEquals(1, result.getSkipped());
        assertEquals(1, result.getFailed());

        verify(userRepository).save(org.mockito.ArgumentMatchers.any(AppUser.class));
        verify(emailService).sendCredentials("foo@example.com", org.mockito.ArgumentMatchers.anyString());
    }
}
