package com.thuc_kien.freelance_marketplace.DTO;

import lombok.Data;

@Data
public class EducationRequestDTO {
    private String school;
    private String degree;
    private String duration; // Ví dụ: "2020 - 2024"
    private String description;
}
