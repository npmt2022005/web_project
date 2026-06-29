package com.thuc_kien.freelance_marketplace.Repository;

import com.thuc_kien.freelance_marketplace.DTO.ChatMessageDTO;
import com.thuc_kien.freelance_marketplace.Entity.ChatMessages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessages, Long> {
    List<ChatMessages> findByConversationIdOrderByIdAsc(Long conversationId);
}