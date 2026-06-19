package com.thuc_kien.freelance_marketplace.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProfileResponse {
    private Long id;
    private String fullname;
    private String title;
    private String country;
    private String bio;
    private Double rating;
    private List<String> skills;
}
