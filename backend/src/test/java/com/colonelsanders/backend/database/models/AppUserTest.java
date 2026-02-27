package com.colonelsanders.backend.database.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import jakarta.persistence.*;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.*;

@DisplayName("AppUser Entity Tests")
class AppUserTest {

    private AppUser appUser;

    @BeforeEach
    void setUp() {
        appUser = new AppUser();
        appUser.setEmail("user@example.com");
        appUser.setPassword("securepassword123");
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
            appUser.setId(1L);
            assertThat(appUser.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("setEmail and getEmail round-trip")
        void email_roundTrip() {
            appUser.setEmail("new@example.com");
            assertThat(appUser.getEmail()).isEqualTo("new@example.com");
        }

        @Test
        @DisplayName("setPassword and getPassword round-trip")
        void password_roundTrip() {
            appUser.setPassword("newpassword456");
            assertThat(appUser.getPassword()).isEqualTo("newpassword456");
        }

        @Test
        @DisplayName("id defaults to null before persistence")
        void id_defaultsToNull() {
            assertThat(new AppUser().getId()).isNull();
        }

        @Test
        @DisplayName("all fields default to null on fresh instance")
        void freshInstance_allFieldsNull() {
            AppUser fresh = new AppUser();
            assertThat(fresh.getId()).isNull();
            assertThat(fresh.getEmail()).isNull();
            assertThat(fresh.getPassword()).isNull();
        }

        @Test
        @DisplayName("non-nullable fields accept null at Java level (constraint enforced by DB)")
        void nonNullableFields_acceptNullAtJavaLevel() {
            assertThatNoException().isThrownBy(() -> {
                appUser.setEmail(null);
                appUser.setPassword(null);
            });
        }

        @Test
        @DisplayName("email accepts various valid formats")
        void email_variousFormats() {
            assertThatNoException().isThrownBy(() -> {
                appUser.setEmail("user+tag@sub.domain.com");
                appUser.setEmail("简单@例子.广告");
                appUser.setEmail("a@b.co");
            });
        }

        @Test
        @DisplayName("password field stores value as-is without transformation")
        void password_storedAsIs() {
            String raw = "P@ssw0rd!#$%^&*()";
            appUser.setPassword(raw);
            assertThat(appUser.getPassword()).isEqualTo(raw);
        }

        @Test
        @DisplayName("email and password are independent fields")
        void emailAndPassword_independent() {
            appUser.setEmail("a@b.com");
            appUser.setPassword("secret");
            assertThat(appUser.getEmail()).isEqualTo("a@b.com");
            assertThat(appUser.getPassword()).isEqualTo("secret");
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
            assertThat(AppUser.class).hasAnnotation(Entity.class);
        }

        @Test
        @DisplayName("id field has @Id annotation")
        void idField_hasIdAnnotation() throws NoSuchFieldException {
            Field idField = AppUser.class.getDeclaredField("id");
            assertThat(idField.isAnnotationPresent(Id.class)).isTrue();
        }

        @Test
        @DisplayName("id field has @GeneratedValue with AUTO strategy")
        void idField_hasGeneratedValueAuto() throws NoSuchFieldException {
            Field idField = AppUser.class.getDeclaredField("id");
            GeneratedValue gv = idField.getAnnotation(GeneratedValue.class);
            assertThat(gv).isNotNull();
            assertThat(gv.strategy()).isEqualTo(GenerationType.AUTO);
        }

        @Test
        @DisplayName("email field has @Column with nullable=false")
        void emailField_hasNonNullableColumn() throws NoSuchFieldException {
            Field field = AppUser.class.getDeclaredField("email");
            Column col = field.getAnnotation(Column.class);
            assertThat(col).isNotNull();
            assertThat(col.nullable()).isFalse();
        }

        @Test
        @DisplayName("password field has @Column with nullable=false")
        void passwordField_hasNonNullableColumn() throws NoSuchFieldException {
            Field field = AppUser.class.getDeclaredField("password");
            Column col = field.getAnnotation(Column.class);
            assertThat(col).isNotNull();
            assertThat(col.nullable()).isFalse();
        }

        @Test
        @DisplayName("entity has exactly 3 declared fields")
        void entity_hasExactlyThreeDeclaredFields() {
            assertThat(AppUser.class.getDeclaredFields()).hasSize(3);
        }
    }

    // ─────────────────────────────────────────────
    // Object identity
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("Object identity")
    class ObjectIdentity {

        @Test
        @DisplayName("two AppUser instances are distinct objects")
        void twoInstances_distinct() {
            assertThat(appUser).isNotSameAs(new AppUser());
        }

        @Test
        @DisplayName("same instance is equal to itself")
        void sameInstance_equalToItself() {
            assertThat(appUser).isEqualTo(appUser);
        }

        @Test
        @DisplayName("setting same id on two instances does not make them the same reference")
        void sameId_differentReferences() {
            AppUser other = new AppUser();
            appUser.setId(99L);
            other.setId(99L);
            assertThat(appUser).isNotSameAs(other);
        }
    }
}