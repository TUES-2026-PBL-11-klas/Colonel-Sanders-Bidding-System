package com.colonelsanders.backend.database.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import jakarta.persistence.*;

import java.lang.reflect.Field;
import java.sql.Timestamp;
import java.time.Instant;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Product Entity Tests")
class ProductTest {

    private Product product;
    private ProductType productType;

    @BeforeEach
    void setUp() {
        productType = new ProductType();

        product = new Product();
        product.setProductType(productType);
        product.setModel("Model X");
        product.setDescription("A great product");
        product.setSerial("SN-001");
        product.setClosed(false);
        product.setCreatedAt(Timestamp.from(Instant.now()));
        product.setUpdatedAt(Timestamp.from(Instant.now()));
        product.setActionEndDate(Timestamp.from(Instant.now()));
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
            product.setId(1L);
            assertThat(product.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("setProductType and getProductType round-trip")
        void productType_roundTrip() {
            ProductType pt = new ProductType();
            product.setProductType(pt);
            assertThat(product.getProductType()).isSameAs(pt);
        }

        @Test
        @DisplayName("setModel and getModel round-trip")
        void model_roundTrip() {
            product.setModel("Tesla Model S");
            assertThat(product.getModel()).isEqualTo("Tesla Model S");
        }

        @Test
        @DisplayName("setDescription and getDescription round-trip")
        void description_roundTrip() {
            product.setDescription("Updated description");
            assertThat(product.getDescription()).isEqualTo("Updated description");
        }

        @Test
        @DisplayName("setSerial and getSerial round-trip")
        void serial_roundTrip() {
            product.setSerial("SN-XYZ-999");
            assertThat(product.getSerial()).isEqualTo("SN-XYZ-999");
        }

        @Test
        @DisplayName("setClosed and getClosed round-trip — false")
        void closed_false() {
            product.setClosed(false);
            assertThat(product.getClosed()).isFalse();
        }

        @Test
        @DisplayName("setClosed and getClosed round-trip — true")
        void closed_true() {
            product.setClosed(true);
            assertThat(product.getClosed()).isTrue();
        }

        @Test
        @DisplayName("setCreatedAt and getCreatedAt round-trip")
        void createdAt_roundTrip() {
            Timestamp ts = Timestamp.from(Instant.parse("2024-01-01T00:00:00Z"));
            product.setCreatedAt(ts);
            assertThat(product.getCreatedAt()).isEqualTo(ts);
        }

        @Test
        @DisplayName("setUpdatedAt and getUpdatedAt round-trip")
        void updatedAt_roundTrip() {
            Timestamp ts = Timestamp.from(Instant.parse("2024-06-15T10:30:00Z"));
            product.setUpdatedAt(ts);
            assertThat(product.getUpdatedAt()).isEqualTo(ts);
        }

        @Test
        @DisplayName("setActionEndDate and getActionEndDate round-trip")
        void actionEndDate_roundTrip() {
            Timestamp ts = Timestamp.from(Instant.parse("2025-12-31T23:59:59Z"));
            product.setActionEndDate(ts);
            assertThat(product.getActionEndDate()).isEqualTo(ts);
        }

        @Test
        @DisplayName("id defaults to null before persistence")
        void id_defaultsToNull() {
            assertThat(new Product().getId()).isNull();
        }

        @Test
        @DisplayName("nullable fields accept null without exception")
        void nullableFields_acceptNull() {
            assertThatNoException().isThrownBy(() -> {
                product.setId(null);
                product.setProductType(null);
                product.setDescription(null);
                product.setCreatedAt(null);
                product.setUpdatedAt(null);
                product.setActionEndDate(null);
            });
        }

        @Test
        @DisplayName("non-nullable fields accept null at entity level (DB constraint enforced by JPA, not Java)")
        void nonNullableFields_acceptNullAtJavaLevel() {
            assertThatNoException().isThrownBy(() -> {
                product.setModel(null);
                product.setSerial(null);
                product.setClosed(null);
            });
        }
    }

    // ─────────────────────────────────────────────
    // JPA Annotations
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("JPA Annotations")
    class JpaAnnotations {

        @Test
        @DisplayName("class is annotated with @Entity")
        void class_hasEntityAnnotation() {
            assertThat(Product.class).hasAnnotation(Entity.class);
        }

        @Test
        @DisplayName("id field has @Id annotation")
        void idField_hasIdAnnotation() throws NoSuchFieldException {
            Field idField = Product.class.getDeclaredField("id");
            assertThat(idField.isAnnotationPresent(Id.class)).isTrue();
        }

        @Test
        @DisplayName("id field has @GeneratedValue with AUTO strategy")
        void idField_hasGeneratedValueAuto() throws NoSuchFieldException {
            Field idField = Product.class.getDeclaredField("id");
            GeneratedValue gv = idField.getAnnotation(GeneratedValue.class);
            assertThat(gv).isNotNull();
            assertThat(gv.strategy()).isEqualTo(GenerationType.AUTO);
        }

        @Test
        @DisplayName("productType field has @ManyToOne targeting ProductType")
        void productTypeField_hasManyToOne() throws NoSuchFieldException {
            Field field = Product.class.getDeclaredField("productType");
            ManyToOne mto = field.getAnnotation(ManyToOne.class);
            assertThat(mto).isNotNull();
            assertThat(mto.targetEntity()).isEqualTo(ProductType.class);
        }

        @Test
        @DisplayName("model field has @Column with nullable=false")
        void modelField_hasNonNullableColumn() throws NoSuchFieldException {
            Field field = Product.class.getDeclaredField("model");
            Column col = field.getAnnotation(Column.class);
            assertThat(col).isNotNull();
            assertThat(col.nullable()).isFalse();
        }

        @Test
        @DisplayName("serial field has @Column with nullable=false")
        void serialField_hasNonNullableColumn() throws NoSuchFieldException {
            Field field = Product.class.getDeclaredField("serial");
            Column col = field.getAnnotation(Column.class);
            assertThat(col).isNotNull();
            assertThat(col.nullable()).isFalse();
        }

        @Test
        @DisplayName("closed field has @Column with nullable=false")
        void closedField_hasNonNullableColumn() throws NoSuchFieldException {
            Field field = Product.class.getDeclaredField("closed");
            Column col = field.getAnnotation(Column.class);
            assertThat(col).isNotNull();
            assertThat(col.nullable()).isFalse();
        }

        @Test
        @DisplayName("description field has no @Column annotation")
        void descriptionField_hasNoColumnAnnotation() throws NoSuchFieldException {
            Field field = Product.class.getDeclaredField("description");
            assertThat(field.isAnnotationPresent(Column.class)).isFalse();
        }

        @Test
        @DisplayName("createdAt field has no @Column annotation")
        void createdAtField_hasNoColumnAnnotation() throws NoSuchFieldException {
            Field field = Product.class.getDeclaredField("createdAt");
            assertThat(field.isAnnotationPresent(Column.class)).isFalse();
        }
    }

    // ─────────────────────────────────────────────
    // Timestamp handling
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("Timestamp fields")
    class TimestampFields {

        @Test
        @DisplayName("createdAt stores exact millisecond value")
        void createdAt_exactMillis() {
            long millis = 1_700_000_000_000L;
            product.setCreatedAt(new Timestamp(millis));
            assertThat(product.getCreatedAt().getTime()).isEqualTo(millis);
        }

        @Test
        @DisplayName("updatedAt stores exact millisecond value")
        void updatedAt_exactMillis() {
            long millis = 1_710_000_000_000L;
            product.setUpdatedAt(new Timestamp(millis));
            assertThat(product.getUpdatedAt().getTime()).isEqualTo(millis);
        }

        @Test
        @DisplayName("actionEndDate stores exact millisecond value")
        void actionEndDate_exactMillis() {
            long millis = 1_720_000_000_000L;
            product.setActionEndDate(new Timestamp(millis));
            assertThat(product.getActionEndDate().getTime()).isEqualTo(millis);
        }

        @Test
        @DisplayName("actionEndDate can be set in the future")
        void actionEndDate_futureDate() {
            Timestamp future = Timestamp.from(Instant.parse("2099-01-01T00:00:00Z"));
            product.setActionEndDate(future);
            assertThat(product.getActionEndDate()).isEqualTo(future);
        }

        @Test
        @DisplayName("all three timestamps can be set independently")
        void timestamps_independent() {
            Timestamp t1 = new Timestamp(1_000L);
            Timestamp t2 = new Timestamp(2_000L);
            Timestamp t3 = new Timestamp(3_000L);

            product.setCreatedAt(t1);
            product.setUpdatedAt(t2);
            product.setActionEndDate(t3);

            assertThat(product.getCreatedAt()).isEqualTo(t1);
            assertThat(product.getUpdatedAt()).isEqualTo(t2);
            assertThat(product.getActionEndDate()).isEqualTo(t3);
        }
    }

    // ─────────────────────────────────────────────
    // Object identity
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("Object identity")
    class ObjectIdentity {

        @Test
        @DisplayName("two Product instances are distinct objects")
        void twoInstances_distinct() {
            assertThat(product).isNotSameAs(new Product());
        }

        @Test
        @DisplayName("same instance is equal to itself")
        void sameInstance_equalToItself() {
            assertThat(product).isEqualTo(product);
        }
    }
}