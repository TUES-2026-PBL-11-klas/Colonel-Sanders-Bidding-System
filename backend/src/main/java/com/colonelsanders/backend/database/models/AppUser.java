package com.colonelsanders.backend.database.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Collection;

@Entity
public class AppUser implements UserDetails {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Getter @Setter
    private Long id;

    @Column(nullable = false)
    @Getter @Setter
    private String email;

    @Column(nullable = false)
    @Getter @Setter
    private String password;

    @Column(nullable = false)
    @Getter @Setter
    private Role role;

    @Override public String getUsername() { return email; }
    @Override public String getPassword() { return password; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
