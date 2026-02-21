package com.colonelsanders.backend.database.models;

import jakarta.persistence.*;

@Entity
public class ProductType {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String name;
}
