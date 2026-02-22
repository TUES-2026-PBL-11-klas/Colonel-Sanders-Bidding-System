package com.colonelsanders.backend.database.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
public class Bid {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Getter @Setter
    private Long id;

    @ManyToOne(targetEntity = Product.class, cascade = CascadeType.DETACH, fetch = FetchType.LAZY, optional = false)
    @Getter @Setter
    private Product product;

    @ManyToOne(targetEntity = AppUser.class, optional = false)
    @Getter @Setter
    private AppUser appUser;

    @Column(precision = 10, scale = 2)
    @Getter @Setter
    private BigDecimal price;

    @Getter @Setter
    private Timestamp createdAt;
}
