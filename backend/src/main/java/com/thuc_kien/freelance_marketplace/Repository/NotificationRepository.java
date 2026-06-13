package com.thuc_kien.freelance_marketplace.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thuc_kien.freelance_marketplace.Entity.Notification;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Lấy danh sách thông báo chưa đọc của 1 User
    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(Long recipientId);
}
