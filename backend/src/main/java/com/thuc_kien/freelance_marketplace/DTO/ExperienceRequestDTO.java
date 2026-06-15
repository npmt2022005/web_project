package com.thuc_kien.freelance_marketplace.DTO;

import lombok.Data;

@Data
public class ExperienceRequestDTO {
    private String company;
    private String role;
    private String duration; // Ví dụ: "01/2023 - 12/2024"
    private String description;
}
