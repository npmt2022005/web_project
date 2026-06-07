package com.thuc_kien.freelance_marketplace.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.thuc_kien.freelance_marketplace.Entity.Seller;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long>{
    @Query("SELECT DISTINCT l FROM Seller s JOIN s.languages l")
    List<String> findAllLanguages();

    @Query("SELECT s FROM Seller s WHERE s.user.id = :userId")
    Optional<Seller> findByUserId(Long userId);
}
