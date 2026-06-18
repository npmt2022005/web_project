package com.thuc_kien.freelance_marketplace.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "messages")
@Data
public class ChatMessages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long conversationId;
    private Long senderId;
    private Long receiverId;
    
    @Column(columnDefinition = "TEXT") 
    private String text;
    
    private String createdAt;
    private String fileUrl;
    private String fileType;
}
