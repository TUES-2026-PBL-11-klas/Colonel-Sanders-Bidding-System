package com.colonelsanders.backend.database.models;

import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(targetEntity = ProductType.class)
    private ProductType productType;

    @Column(nullable = false)
    private String model;

    private String description;

    @Column(nullable = false)
    private String serial;

    @Column(nullable = false)
    private Boolean closed;

    //buyer_id?

    private Timestamp createdAt;
    private Timestamp updatedAt;
    private Timestamp actionEndDate;
}
