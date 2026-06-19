package com.thuc_kien.freelance_marketplace.DTO;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SellerDetailDTO {
    private Long id;
    private String fullname;
    private String title;
    private String country;
    private String city;
    private String bio;
    private Double rating;
    private List<String> skills;
    private String email;
    private LocalDateTime joinedDate;
    private Boolean linkedBank;
    private List<EducationRequestDTO> educations;
    private List<ExperienceRequestDTO> experiences;
    private List<ReviewsDTO> reviews;
    
}
