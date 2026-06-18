package com.thuc_kien.freelance_marketplace.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.thuc_kien.freelance_marketplace.Entity.Conversation;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // Tìm tất cả cuộc hội thoại mà userId hiện tại tham gia, sắp xếp phòng có tin
    // nhắn mới nhất lên đầu
    @Query("SELECT c FROM Conversation c WHERE c.userOneId = :userId OR c.userTwoId = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE " +
            "(c.userOneId = :userA AND c.userTwoId = :userB) OR " +
            "(c.userOneId = :userB AND c.userTwoId = :userA)")
    Optional<Conversation> findExistingConversation(@Param("userA") Long userA, @Param("userB") Long userB);
}
