package com.thuc_kien.freelance_marketplace.Repository;

import com.thuc_kien.freelance_marketplace.Entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    List<WalletTransaction> findByWalletUserIdOrderByCreatedAtDesc(Long userId);
}