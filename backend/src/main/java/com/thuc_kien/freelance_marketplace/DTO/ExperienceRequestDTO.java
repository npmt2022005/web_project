package com.thuc_kien.freelance_marketplace.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
public class ExperienceRequestDTO {
    private String company;
    private String role;
    private String duration; // Ví dụ: "01/2023 - 12/2024"
    private String description;
}
