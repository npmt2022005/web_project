package com.thuc_kien.freelance_marketplace.Service;

import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.DTO.EducationRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.ExperienceRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.ReviewsDTO;
import com.thuc_kien.freelance_marketplace.DTO.SellerDetailDTO;
import com.thuc_kien.freelance_marketplace.DTO.SellerProfileResponse;
import com.thuc_kien.freelance_marketplace.Entity.Skill;
import com.thuc_kien.freelance_marketplace.Entity.Education;
import com.thuc_kien.freelance_marketplace.Entity.Experience;
import com.thuc_kien.freelance_marketplace.Entity.Review;
import com.thuc_kien.freelance_marketplace.Entity.Seller;
import com.thuc_kien.freelance_marketplace.Repository.ReviewRepository;
import com.thuc_kien.freelance_marketplace.Repository.SellerRepository;


import java.util.*;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SellerService {
    private final SellerRepository sellerRepo;
    private final ReviewRepository reviewRepo;
    public List<String> getAllLanguage(){
        return sellerRepo.findAllLanguages();
    }

    public List<SellerProfileResponse> getAllPublicSellers() {
        List<Seller> profiles = sellerRepo.findAll();
        return profiles.stream()
                .map(this::mapToSellerProfileResponse)
                .collect(Collectors.toList());
    }

    // Helper method để chuyển đổi từ Seller Entity sang SellerProfileResponse DTO
    private SellerProfileResponse mapToSellerProfileResponse(Seller profile) {
        // Lấy danh sách tên kỹ năng từ Set<Skill>
        List<String> skillNames = profile.getSkills().stream()
                .map(Skill::getName)
                .collect(Collectors.toList());

        return SellerProfileResponse.builder()
                .id(profile.getId())
                .fullname(profile.getUser().getFullname())
                .country(profile.getUser().getCountry())
                .bio(profile.getBio())
                .rating(profile.getRatingAvg())
                .skills(skillNames)
                .build();
    }
    public SellerDetailDTO getSellerById(Long id){
        var seller = sellerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên gia với ID: " + id));
        List<Review> reviews = reviewRepo.findReviewsBySellerId(id);

        SellerDetailDTO dto = new SellerDetailDTO();
        dto.setId(seller.getId());
        dto.setFullname(seller.getUser().getFullname());
        dto.setCountry(seller.getUser().getCountry());
        dto.setCity(seller.getUser().getCity());
        dto.setBio(seller.getBio());
        dto.setRating(seller.getRatingAvg());
        // dto.setSkills(seller.getSkills()); // Giả sử skills là List<String>
        dto.setEmail(seller.getUser().getEmail());
        dto.setJoinedDate(seller.getUser().getCreatedAt());
        dto.setLinkedBank(true);
    
        dto.setEducations(seller.getEducations().stream()
        .map((Education edu) -> new EducationRequestDTO(
                edu.getSchool(), 
                edu.getDegree(), 
                edu.getDuration(), 
                edu.getDescription()
        )) 
        .collect(Collectors.toList()));

        dto.setExperiences(seller.getExperiences().stream()
        .map((Experience ex) -> new ExperienceRequestDTO(
                ex.getCompany(), 
                ex.getRole(), 
                ex.getDuration(), 
                ex.getDescription()
        )) 
        .collect(Collectors.toList()));

        dto.setReviews(reviews.stream()
            .map(rev -> new ReviewsDTO(
                rev.getOrder().getBuyer().getFullname(), 
                rev.getRating(), 
                rev.getComment(),
                rev.getCreatedAt().toString()
            ))
            .collect(Collectors.toList()));
        return dto;
    }
}