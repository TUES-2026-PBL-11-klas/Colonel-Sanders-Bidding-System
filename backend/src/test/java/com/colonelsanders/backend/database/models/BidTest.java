package com.colonelsanders.backend.database.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import jakarta.persistence.*;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

//ppc maj e pozwoleno da polzwame ai za unit testowe maj nz taka pishe

@DisplayName("Bid Entity Tests")
class BidTest {

    private Bid bid;
    private Product product;
    private AppUser appUser;
    private Validator validator;

    @BeforeEach
    void setUp() {
        product = new Product();
        appUser = new AppUser();

        bid = new Bid();
        bid.setProduct(product);
        bid.setAppUser(appUser);
        bid.setPrice(new BigDecimal("99.99"));
        bid.setCreatedAt(Timestamp.from(Instant.now()));

        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    // ─────────────────────────────────────────────
    // Getters & Setters
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("Getters and Setters")
    class GettersAndSetters {

        @Test
        @DisplayName("setId and getId round-trip")
        void id_roundTrip() {
            bid.setId(42L);
            assertThat(bid.getId()).isEqualTo(42L);
        }

        @Test
        @DisplayName("setProduct and getProduct round-trip")
        void product_roundTrip() {
            Product p = new Product();
            bid.setProduct(p);
            assertThat(bid.getProduct()).isSameAs(p);
        }

        @Test
        @DisplayName("setAppUser and getAppUser round-trip")
        void appUser_roundTrip() {
            AppUser u = new AppUser();
            bid.setAppUser(u);
            assertThat(bid.getAppUser()).isSameAs(u);
        }

        @Test
        @DisplayName("setPrice and getPrice round-trip")
        void price_roundTrip() {
            BigDecimal price = new BigDecimal("123.45");
            bid.setPrice(price);
            assertThat(bid.getPrice()).isEqualByComparingTo(price);
        }

        @Test
        @DisplayName("setCreatedAt and getCreatedAt round-trip")
        void createdAt_roundTrip() {
            Timestamp ts = Timestamp.from(Instant.parse("2024-06-01T12:00:00Z"));
            bid.setCreatedAt(ts);
            assertThat(bid.getCreatedAt()).isEqualTo(ts);
        }

        @Test
        @DisplayName("id defaults to null before persistence")
        void id_defaultsToNull() {
            assertThat(new Bid().getId()).isNull();
        }

        @Test
        @DisplayName("all fields accept null")
        void allFields_acceptNull() {
            assertThatNoException().isThrownBy(() -> {
                bid.setId(null);
                bid.setProduct(null);
                bid.setAppUser(null);
                bid.setPrice(null);
                bid.setCreatedAt(null);
            });
        }
    }

    // ─────────────────────────────────────────────
    // Price precision / scale
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("Price precision and scale")
    class PricePrecisionAndScale {

        @Test
        @DisplayName("accepts value within precision 10, scale 2")
        void price_withinBounds() {
            bid.setPrice(new BigDecimal("12345678.99"));
            assertThat(bid.getPrice()).isEqualByComparingTo("12345678.99");
        }

        @Test
        @DisplayName("accepts zero price")
        void price_zero() {
            bid.setPrice(BigDecimal.ZERO);
            assertThat(bid.getPrice()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("accepts null price")
        void price_null() {
            bid.setPrice(null);
            assertThat(bid.getPrice()).isNull();
        }

        @Test
        @DisplayName("price retains scale of 2")
        void price_retainsScale() {
            bid.setPrice(new BigDecimal("10.50"));
            assertThat(bid.getPrice().scale()).isEqualTo(2);
        }
    }

    // ─────────────────────────────────────────────
    // JPA Annotation checks (reflection)
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("JPA Annotations")
    class JpaAnnotations {

        @Test
        @DisplayName("class is annotated with @Entity")
        void class_hasEntityAnnotation() {
            assertThat(Bid.class).hasAnnotation(Entity.class);
        }

        @Test
        @DisplayName("id field has @Id annotation")
        void idField_hasIdAnnotation() throws NoSuchFieldException {
            Field idField = Bid.class.getDeclaredField("id");
            assertThat(idField.isAnnotationPresent(Id.class)).isTrue();
        }

        @Test
        @DisplayName("id field has @GeneratedValue with AUTO strategy")
        void idField_hasGeneratedValueAuto() throws NoSuchFieldException {
            Field idField = Bid.class.getDeclaredField("id");
            GeneratedValue gv = idField.getAnnotation(GeneratedValue.class);
            assertThat(gv).isNotNull();
            assertThat(gv.strategy()).isEqualTo(GenerationType.AUTO);
        }

        @Test
        @DisplayName("product field has @ManyToOne with correct settings")
        void productField_hasManyToOne() throws NoSuchFieldException {
            Field productField = Bid.class.getDeclaredField("product");
            ManyToOne mto = productField.getAnnotation(ManyToOne.class);
            assertThat(mto).isNotNull();
            assertThat(mto.optional()).isFalse();
            assertThat(mto.fetch()).isEqualTo(FetchType.LAZY);
            assertThat(mto.cascade()).contains(CascadeType.DETACH);
        }

        @Test
        @DisplayName("appUser field has @ManyToOne with optional=false")
        void appUserField_hasManyToOneNotOptional() throws NoSuchFieldException {
            Field appUserField = Bid.class.getDeclaredField("appUser");
            ManyToOne mto = appUserField.getAnnotation(ManyToOne.class);
            assertThat(mto).isNotNull();
            assertThat(mto.optional()).isFalse();
        }

        @Test
        @DisplayName("price field has @Column with precision=10 and scale=2")
        void priceField_hasColumnAnnotation() throws NoSuchFieldException {
            Field priceField = Bid.class.getDeclaredField("price");
            Column col = priceField.getAnnotation(Column.class);
            assertThat(col).isNotNull();
            assertThat(col.precision()).isEqualTo(10);
            assertThat(col.scale()).isEqualTo(2);
        }
    }

    // ─────────────────────────────────────────────
    // Object identity / equality
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("Object identity")
    class ObjectIdentity {

        @Test
        @DisplayName("two Bid instances are not the same reference")
        void twoInstances_notSameReference() {
            Bid other = new Bid();
            assertThat(bid).isNotSameAs(other);
        }

        @Test
        @DisplayName("same instance is equal to itself")
        void sameInstance_equalToItself() {
            assertThat(bid).isEqualTo(bid);
        }
    }

    // ─────────────────────────────────────────────
    // Timestamp handling
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("CreatedAt timestamp")
    class CreatedAtTimestamp {

        @Test
        @DisplayName("stores and retrieves exact timestamp")
        void createdAt_exactValue() {
            long epochMilli = 1_700_000_000_000L;
            Timestamp ts = new Timestamp(epochMilli);
            bid.setCreatedAt(ts);
            assertThat(bid.getCreatedAt().getTime()).isEqualTo(epochMilli);
        }

        @Test
        @DisplayName("accepts timestamp at epoch zero")
        void createdAt_epochZero() {
            Timestamp ts = new Timestamp(0L);
            bid.setCreatedAt(ts);
            assertThat(bid.getCreatedAt()).isEqualTo(ts);
        }
    }
}