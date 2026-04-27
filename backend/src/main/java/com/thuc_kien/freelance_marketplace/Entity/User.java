package com.thuc_kien.freelance_marketplace.Entity;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import lombok.NoArgsConstructor;
import lombok.Setter;
@Data
@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // int, PRI, auto_increment

    @Column(nullable = false, unique = true, length = 50)
    private String username; // varchar(50), NO NULL, UNI

    @Column(length = 50)
    private String fullname; // varchar(50), YES NULL

    @Column(nullable = false, unique = true, length = 100)
    private String email; // varchar(100), NO NULL, UNI

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl; // varchar(255), YES NULL

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash; // varchar(255), NO NULL

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<UserRole> roles = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "current_role", length = 20)
    private UserRole currentRole;

    @Column(unique = true)
    private String phone;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp // Tự động lấy thời gian hiện tại khi insert
    private LocalDateTime createdAt; // timestamp, Default: CURRENT_TIMESTAMP
}
