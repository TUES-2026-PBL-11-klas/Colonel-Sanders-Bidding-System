package com.colonelsanders.backend.database.models;

import jakarta.persistence.*;

@Entity
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
}
