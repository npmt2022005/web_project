package com.thuc_kien.freelance_marketplace.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thuc_kien.freelance_marketplace.Entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{
    Optional<User> findByPhone(String phone);

    // kiem tra su ton tai cua email 
    boolean existsByPhone (String phone);

    boolean existsByEmail (String email);

    boolean existsByUsername (String username);

    Optional<User> findByUsernameOrEmailOrPhone(String username, String email, String phone);
}
