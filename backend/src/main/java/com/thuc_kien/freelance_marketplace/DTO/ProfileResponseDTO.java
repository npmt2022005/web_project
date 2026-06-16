package com.thuc_kien.freelance_marketplace.DTO;

import lombok.*;
import java.util.List;

import org.springframework.security.authentication.AccountStatusException;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponseDTO {
    
    // 1. Nhóm thông tin cơ bản
    private BasicInfoDTO basicInfo;
    private List<TimelineDTO> education;
    private List<TimelineDTO> experience;
    private AccountStatusDTO accountStatus;

    // --- CÁC DTO LỒNG NHAU ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountStatusDTO {
        private boolean isLinkedBank;
        private boolean isVerified;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class BasicInfoDTO {
        private String username;
        private String email;
        private String phone;
        private String country;
        private String city;
        private String description;
        private String avatar;
    }
    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class TimelineDTO {
        private Long id;
        private String duration;
        private String title;     
        private String subtitle; // Changed from institution
        private String description; // Changed from desc
    }
}
