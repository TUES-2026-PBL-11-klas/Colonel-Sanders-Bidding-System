package com.colonelsanders.backend.services;

import com.colonelsanders.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {

    private JwtService service;

    @BeforeEach
    void setup() {
        service = new JwtService();
        // manually set values using reflection since fields are private
        try {
            java.lang.reflect.Field secret = JwtService.class.getDeclaredField("secretKey");
            secret.setAccessible(true);
            secret.set(service, io.jsonwebtoken.io.Encoders.BASE64.encode("mysecretmysecretmysecretmysecret".getBytes()));
            java.lang.reflect.Field expiration = JwtService.class.getDeclaredField("expiration");
            expiration.setAccessible(true);
            expiration.set(service, 1000L * 60); // one minute
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void generateAndValidateToken() {
        UserDetails user = User.withUsername("bob").password("x").roles("USER").build();
        String token = service.generateToken(user);
        assertNotNull(token);
        assertEquals("bob", service.extractUsername(token));
        assertTrue(service.isTokenValid(token, user));
    }

    @Test
    void expiredToken_isInvalid() throws Exception {
        UserDetails user = User.withUsername("bob").password("x").roles("USER").build();
        String token = service.generateToken(user);
        // artificially set expiration in past via reflection modifications on returned token
        // easier to wait a bit longer than expiration
        Thread.sleep(1100);
        assertFalse(service.isTokenValid(token, user));
    }
}
