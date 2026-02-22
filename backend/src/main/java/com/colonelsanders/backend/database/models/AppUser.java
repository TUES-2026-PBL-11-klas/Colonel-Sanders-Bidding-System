package com.colonelsanders.backend.database.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Getter @Setter
    private Long id;

    @Column(nullable = false)
    @Getter @Setter
    private String email;

    @Column(nullable = false)
    @Getter @Setter
    private String password;
}
