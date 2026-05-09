// package com.thuc_kien.freelance_marketplace.Service;

// import org.springframework.stereotype.Service;

// import com.thuc_kien.freelance_marketplace.DTO.GigRequestDTO;
// import com.thuc_kien.freelance_marketplace.Entity.*;
// import com.thuc_kien.freelance_marketplace.Repository.*;

// import jakarta.transaction.Transactional;
// import lombok.RequiredArgsConstructor;

// @Service
// @RequiredArgsConstructor
// public class GigService {
//     private final GigRepository gigRepo;
//     private final SellerRepository sellerRepo;
//     private final CategoryRepository categoryRepo;

//     @Transactional
//     public GigResponseDTO createGig(GigRequestDTO request, User currentUser) {
//         // 1. Tìm hồ sơ Seller dựa trên User đang đăng nhập
//         Sellers seller = sellerRepo.findByUser(currentUser)
//                 .orElseThrow(() -> new AppException("Bạn phải nâng cấp lên Seller mới được đăng bài"));

//         // 2. Tìm danh mục dịch vụ
//         Category category = categoryRepository.findById(request.getCategoryId())
//                 .orElseThrow(() -> new AppException("Danh mục không tồn tại"));

//         // 3. Chuyển đổi DTO sang Entity
//         Gig gig = Gig.builder()
//                 .title(request.getTitle())
//                 .description(request.getDescription())
//                 .basePrice(request.getBasePrice())
//                 .thumbnailUrl(request.getThumbnailUrl())
//                 .seller(seller)
//                 .category(category)
//                 .rating(0.0)
//                 .reviewCount(0)
//                 .build();

//         Gig savedGig = gigRepo.save(gig);
        
//         return convertToResponseDTO(savedGig);
//     }
// }
