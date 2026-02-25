package com.colonelsanders.backend.database.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

@Entity
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Getter @Setter
    private Long id;

    @ManyToOne(targetEntity = ProductType.class)
    @Getter @Setter
    private ProductType productType;

    @Column(nullable = false)
    @Getter @Setter
    private String model;

    @Getter @Setter
    private String description;

    @Column(nullable = false)
    @Getter @Setter
    private String serial;

    @Column(nullable = false)
    @Getter @Setter
    private Boolean closed;

    @Getter @Setter
    private String imageObjectKey;

    //buyer_id?
    @Getter @Setter
    private Timestamp createdAt;
    @Getter @Setter
    private Timestamp updatedAt;
    @Getter @Setter
    private Timestamp actionEndDate;
}
