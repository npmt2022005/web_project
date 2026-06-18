package com.thuc_kien.freelance_marketplace.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "conversations")
@Data
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userOneId;
    private Long userTwoId;
    
    private String userOneName;
    private String userTwoName;
    
    private String userOneAvatar;
    private String userTwoAvatar;

    // Các trường lưu vết thông tin hiển thị nhanh ra Sidebar
    private String lastMessage;
    private LocalDateTime updatedAt;
}
