package com.thuc_kien.freelance_marketplace.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.AccountLink;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.thuc_kien.freelance_marketplace.DTO.ProfileResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.ProfileUpdateRequestDTO;
import com.thuc_kien.freelance_marketplace.Entity.Seller;
import com.thuc_kien.freelance_marketplace.Entity.User;
import com.thuc_kien.freelance_marketplace.Entity.Wallet;
import com.thuc_kien.freelance_marketplace.Repository.EducationRepository;
import com.thuc_kien.freelance_marketplace.Repository.ExperienceRepository;
import com.thuc_kien.freelance_marketplace.Repository.SellerRepository;
import com.thuc_kien.freelance_marketplace.Repository.SkillRepository;
import com.thuc_kien.freelance_marketplace.Repository.UserRepository;
import com.thuc_kien.freelance_marketplace.Repository.WalletRepository;

import jakarta.transaction.Transactional;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final WalletRepository walletRepo;
    @Value("${stripe.api.secretKey}")
    private String stripeSecretkey;
    private final SellerRepository sellerRepo;
    private final WalletRepository walletRepository;
    private final UserRepository userRepo;
    private final FileUploadService fileUploadService;

    public ProfileResponseDTO getFullProfile(Long userId) {
        // 1. Lấy User từ DB
        Seller seller = sellerRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller không tồn tại"));

        // 2. Lấy thông tin Ví (Logic kiểm tra Bank Linked & Verified)
        var wallet = walletRepository.findByUserId(seller.getUser().getId()).orElse(null);
        boolean isLinked = (wallet != null && wallet.getStripeAccountId() != null && !wallet.getStripeAccountId().isEmpty());
        boolean isVerified = (wallet != null && wallet.isVerified());

        var accountStatus = ProfileResponseDTO.AccountStatusDTO.builder()
            .isLinkedBank(isLinked)
            .isVerified(isVerified)
            .build();

        var basicInfo = ProfileResponseDTO.BasicInfoDTO.builder()
                .username(seller.getUser().getFullname())
                .email(seller.getUser().getEmail())
                .phone(seller.getUser().getPhone())
                .country(seller.getUser().getCountry())
                .description(seller.getBio())
                .avatar(seller.getUser().getAvatarUrl())
                .build();

        var educationList = seller.getEducations().stream()
                .map(edu -> new ProfileResponseDTO.TimelineDTO(
                        edu.getId(), edu.getDuration(), edu.getDegree(), edu.getSchool(), edu.getDescription()))
                .collect(Collectors.toList());

        var experienceList = seller.getExperiences().stream()
                .map(exp -> new ProfileResponseDTO.TimelineDTO(
                        exp.getId(), exp.getDuration(), exp.getRole(), exp.getCompany(), exp.getDescription()))
                .collect(Collectors.toList());

        // 6. Trả về đối tượng tổng hợp
        return ProfileResponseDTO.builder()
                .basicInfo(basicInfo)
                .experience(experienceList)
                .education(educationList)
                .accountStatus(accountStatus)
                .build();
    }

    public String createStripeConnectAccount(Long userId) throws Exception {
        Stripe.apiKey = stripeSecretkey;
        Wallet wallet = walletRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Chưa có ví"));

        if (wallet.getStripeAccountId() == null) {
            AccountCreateParams params = AccountCreateParams.builder()
                    .setType(AccountCreateParams.Type.EXPRESS)
                    .setCountry("US")
                    .build();
            Account account = Account.create(params);
            wallet.setStripeAccountId(account.getId());
            walletRepo.save(wallet);
        }

        // 2. Tạo link onboarding
        AccountLinkCreateParams linkParams = AccountLinkCreateParams.builder()
                .setAccount(wallet.getStripeAccountId())
                .setRefreshUrl("http://localhost:5173/api/v1/profile") //
                .setReturnUrl("http://localhost:5173/api/v1/profile") //
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .build();

        AccountLink accountLink = AccountLink.create(linkParams);
        return accountLink.getUrl();
    }

    @Transactional
    public void verifyAndSyncStripeStatus(Long userId) {
        Stripe.apiKey = stripeSecretkey;
        Wallet wallet = walletRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Ví không tồn tại"));
        try {
            Account account = Account.retrieve(wallet.getStripeAccountId());

            // --- ĐẶT LỆNH IN Ở ĐÂY ---
            System.out.println("DEBUG: Trạng thái Stripe của tài khoản " + wallet.getStripeAccountId() +
                    " là: " + account.getDetailsSubmitted());
            // -------------------------
            // Kiểm tra trạng thái
            if (Boolean.TRUE.equals(account.getDetailsSubmitted())) {
                wallet.setVerified(true);
                walletRepo.save(wallet);
            } else {
                throw new RuntimeException("Tài khoản chưa hoàn tất xác thực từ phía Stripe");
            }
        } catch (StripeException e) {
            e.printStackTrace(); // Log lỗi ra console để debug
            throw new RuntimeException("Lỗi kết nối tới Stripe: " + e.getMessage());
        }
    }
    
    @Transactional
    public void updateBasicInfo(Long userId, ProfileUpdateRequestDTO dto) {
        // 1. Tìm User và Seller
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        
        Seller seller = sellerRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Chưa đăng ký làm Seller"));


        if (dto.getAvatarUrl() != null) user.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getCountry() != null) user.setCountry(dto.getCountry());
        if (dto.getCity() != null) user.setCity(dto.getCity());

        // 3. Cập nhật thông tin Seller (Bio/Description)
        if (dto.getDescription() != null) seller.setBio(dto.getDescription());

        // 4. Lưu lại
        userRepo.save(user);
        sellerRepo.save(seller);
    }
    @Transactional
    public String updateAvatar(Long userId, MultipartFile file) {
        // 1. Upload ảnh lên Cloudinary
        String imageUrl = fileUploadService.uploadImage(file, "avatars");

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        user.setAvatarUrl(imageUrl);
        userRepo.save(user);

        return imageUrl; 
    }
}
