package com.colonelsanders.backend.database.models;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
public class Bid {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(targetEntity = Product.class, cascade = CascadeType.DETACH, fetch = FetchType.LAZY, optional = false)
    private Product product;
    //user id

    @Column(precision = 10, scale = 2)
    private BigDecimal value;

    private Timestamp createdAt;
}
