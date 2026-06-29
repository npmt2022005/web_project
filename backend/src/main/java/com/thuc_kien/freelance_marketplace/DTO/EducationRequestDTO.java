package com.thuc_kien.freelance_marketplace.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EducationRequestDTO {
    private String school;
    private String degree;
    private String duration; // Ví dụ: "2020 - 2024"
    private String description;
}
