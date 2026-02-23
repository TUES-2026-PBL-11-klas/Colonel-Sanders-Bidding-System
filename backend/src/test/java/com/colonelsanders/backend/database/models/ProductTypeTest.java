package com.colonelsanders.backend.database.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import jakarta.persistence.*;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.*;

@DisplayName("ProductType Entity Tests")
class ProductTypeTest {

    private ProductType productType;

    @BeforeEach
    void setUp() {
        productType = new ProductType();
        productType.setName("Electronics");
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
            productType.setId(1L);
            assertThat(productType.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("setName and getName round-trip")
        void name_roundTrip() {
            productType.setName("Furniture");
            assertThat(productType.getName()).isEqualTo("Furniture");
        }

        @Test
        @DisplayName("id defaults to null before persistence")
        void id_defaultsToNull() {
            assertThat(new ProductType().getId()).isNull();
        }

        @Test
        @DisplayName("all fields default to null on fresh instance")
        void freshInstance_allFieldsNull() {
            ProductType fresh = new ProductType();
            assertThat(fresh.getId()).isNull();
            assertThat(fresh.getName()).isNull();
        }

        @Test
        @DisplayName("name accepts null at Java level (constraint enforced by DB)")
        void name_acceptsNullAtJavaLevel() {
            assertThatNoException().isThrownBy(() -> productType.setName(null));
        }

        @Test
        @DisplayName("name accepts various string values")
        void name_variousValues() {
            assertThatNoException().isThrownBy(() -> {
                productType.setName("Clothing & Accessories");
                productType.setName("électronique");
                productType.setName("家電");
                productType.setName("A");
            });
        }

        @Test
        @DisplayName("name stores value as-is without transformation")
        void name_storedAsIs() {
            String raw = "  Spaced Name  ";
            productType.setName(raw);
            assertThat(productType.getName()).isEqualTo(raw);
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
            assertThat(ProductType.class).hasAnnotation(Entity.class);
        }

        @Test
        @DisplayName("id field has @Id annotation")
        void idField_hasIdAnnotation() throws NoSuchFieldException {
            Field idField = ProductType.class.getDeclaredField("id");
            assertThat(idField.isAnnotationPresent(Id.class)).isTrue();
        }

        @Test
        @DisplayName("id field has @GeneratedValue with AUTO strategy")
        void idField_hasGeneratedValueAuto() throws NoSuchFieldException {
            Field idField = ProductType.class.getDeclaredField("id");
            GeneratedValue gv = idField.getAnnotation(GeneratedValue.class);
            assertThat(gv).isNotNull();
            assertThat(gv.strategy()).isEqualTo(GenerationType.AUTO);
        }

        @Test
        @DisplayName("name field has @Column with nullable=false")
        void nameField_hasNonNullableColumn() throws NoSuchFieldException {
            Field field = ProductType.class.getDeclaredField("name");
            Column col = field.getAnnotation(Column.class);
            assertThat(col).isNotNull();
            assertThat(col.nullable()).isFalse();
        }

        @Test
        @DisplayName("entity has exactly 2 declared fields")
        void entity_hasExactlyTwoDeclaredFields() {
            assertThat(ProductType.class.getDeclaredFields()).hasSize(2);
        }
    }

    // ─────────────────────────────────────────────
    // Object identity
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("Object identity")
    class ObjectIdentity {

        @Test
        @DisplayName("two ProductType instances are distinct objects")
        void twoInstances_distinct() {
            assertThat(productType).isNotSameAs(new ProductType());
        }

        @Test
        @DisplayName("same instance is equal to itself")
        void sameInstance_equalToItself() {
            assertThat(productType).isEqualTo(productType);
        }

        @Test
        @DisplayName("setting same id on two instances does not make them the same reference")
        void sameId_differentReferences() {
            ProductType other = new ProductType();
            productType.setId(7L);
            other.setId(7L);
            assertThat(productType).isNotSameAs(other);
        }
    }
}