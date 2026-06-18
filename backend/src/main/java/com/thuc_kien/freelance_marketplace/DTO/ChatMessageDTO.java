package com.thuc_kien.freelance_marketplace.DTO;

import lombok.Data;

@Data
public class ChatMessageDTO {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private Long receiverId; // ID của đối tác nhận tin nhắn
    private String text;
    private String createdAt;
    private String fileUrl;
    private String fileType;
}
