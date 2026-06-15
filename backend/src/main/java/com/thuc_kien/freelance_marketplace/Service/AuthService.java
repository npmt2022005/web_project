package com.thuc_kien.freelance_marketplace.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;


import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.DTO.ChangePasswordRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.LoginRequest;
import com.thuc_kien.freelance_marketplace.DTO.LoginResponse;
import com.thuc_kien.freelance_marketplace.DTO.RegisterRequest;
import com.thuc_kien.freelance_marketplace.DTO.ResetPasswordRequest;
import com.thuc_kien.freelance_marketplace.Exception.AppException;
import com.thuc_kien.freelance_marketplace.Exception.ConflictException;
import com.thuc_kien.freelance_marketplace.Repository.SellerRepository;
import com.thuc_kien.freelance_marketplace.Repository.UserRepository;
import com.thuc_kien.freelance_marketplace.Repository.WalletRepository;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;
import com.thuc_kien.freelance_marketplace.security.JwtService;
import com.thuc_kien.freelance_marketplace.Entity.*;

import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final SellerRepository sellerRepo;
    private final SmsService smsService;
    private final AuthenticationManager authenticationManager;
    private final WalletRepository walletRepo;

    @Transactional
    public void register(RegisterRequest rq){
        String email = rq.getEmail().trim().toLowerCase();
        String phone = rq.getPhone().trim();
        // kiem tra email, sdt da ton tai hay chua 
        if (userRepo.existsByEmail(email)){
            throw new ConflictException("Email đã được sử dụng bởi tài khoản khác");
        }
        if (userRepo.existsByPhone(phone)){
            throw new ConflictException("Số điện thoại đã được sử dụng bởi tài khoản khác.");
        }
        if (userRepo.existsByUsername(rq.getUsername())){
            throw new ConflictException("Tên đăng nhập đã được sử dụng.");
        }
        if (!rq.getPassword().equals(rq.getConfirmPassword())){
            throw new ValidationException("Mật khẩu xác nhận không trùng khớp");
        }
        
        
        User newUser = new User();
        newUser.setFullname(rq.getFullname());
        newUser.setEmail(email);
        newUser.setPhone(phone);
        newUser.getRoles().add(UserRole.ROLE_BUYER);

        newUser.setUsername(rq.getUsername());
        newUser.setPasswordHash(passwordEncoder.encode(rq.getPassword()));
        newUser.setCreatedAt(LocalDateTime.now());
        boolean isSeller = (rq.getRole() == UserRole.ROLE_SELLER);
        if (isSeller){
            newUser.getRoles().add(UserRole.ROLE_SELLER);
            newUser.setCurrentRole(UserRole.ROLE_SELLER);
        } else {
            newUser.setCurrentRole(UserRole.ROLE_BUYER);
        }
        User savedUser = userRepo.save(newUser);
        if (isSeller) {
            Seller newSeller = new Seller();
            newSeller.setUser(savedUser); // Liên kết khóa ngoại user_id
            
            
            newSeller.setBio(""); // Mới đăng ký nên để trống tiểu sử
            newSeller.setRatingAvg(Double.valueOf(0.0)); // Điểm đánh giá ban đầu = 0.0
            newSeller.setTotalReviews(0); // Khớp với cột total_reviews trong DB
            newSeller.setResponseTime("N/A"); // Khớp với cột reponse_time, ban đầu chưa có dữ liệu
            newSeller.setIsActive(true); // Khớp với cột is_active
            
            sellerRepo.save(newSeller); 
        }
        Wallet wallet = new Wallet();
        wallet.setUser(savedUser); // 
        wallet.setBalance(BigDecimal.ZERO); // Số dư ban đầu bằng 0
        wallet.setCurrency("USD");
        wallet.setStatus("ACTIVE");
        wallet.setStripeAccountId(null); 
        wallet.setVerified(false);
        
        walletRepo.save(wallet);
    }

    public LoginResponse login(LoginRequest lr){
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(lr.getIdentifier(), lr.getPassword())
        );
        User user = userRepo.findByUsernameOrEmailOrPhone(lr.getIdentifier(), lr.getIdentifier() , lr.getIdentifier()
                                                            ).orElseThrow(() -> new AppException("\"Tên đăng nhập hoặc mật khẩu không chính xác\""));
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails);
                                                            
        long expiresIn = jwtService.getExpirationTimeInSeconds(); // 

        // Chuyển đổi Set Enum thành Set String
        Set<String> roles = user.getRoles().stream()
                                .map(Enum::name)
                                .collect(Collectors.toSet());
        return LoginResponse.builder()
        .token(token)
        .username(user.getUsername())
        .fullname(user.getFullname())
        .roles(roles)
        .currentRole(user.getCurrentRole().name())
        .expiresIn(expiresIn)
        .type("Bearer")
        .build();
    }

    public void forgotPassword(String identifier){
        String itf = identifier.trim();
        User user = userRepo.findByUsernameOrEmailOrPhone(itf, itf, itf)
            .orElseThrow(() -> new AppException("Email hoặc Số điện thoại không tồn tại"));

        String otp = String.format("%06d", new Random().nextInt(1000000));

        otpService.saveOtp(itf, otp);

        
        if (itf.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            // Nếu là Email
            if (user.getEmail() != null) {
                emailService.sendOtpEmail(user.getEmail(), otp);
            } else {
                throw new AppException("Tài khoản này chưa có thông tin Email");
            }
        } 
        else if (itf.matches("^0\\d{9}$")) {
            // Nếu là Số điện thoại (bắt đầu bằng 0 và có 10 chữ số)
            if (user.getPhone() != null) {
                smsService.sendOtpSms(user.getPhone(), otp);
            } else {
                throw new AppException("Tài khoản này chưa có thông tin Số điện thoại");
            }
        }
    }

    public void verifyOtp(String loginId, String otp){
        // 1. Lấy mã từ Redis
        String savedOtp = otpService.getOtp(loginId);
        // 2. Kiểm tra
        if (savedOtp == null) {
            throw new AppException("Mã OTP đã hết hạn, vui lòng gửi lại");
        }
        if (!savedOtp.equals(otp)) {
            throw new AppException("Mã OTP không chính xác");
        }
    }
    public void resetPassword(ResetPasswordRequest request){
        String identifier = request.getIdentifier().trim();
        // 1. Kiểm tra mật khẩu và xác nhận mật khẩu có khớp nhau không
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException("Mật khẩu xác nhận không trùng khớp!");
        }
        
        this.verifyOtp(identifier, request.getOtp());
        // 3. Tìm User trong DB
        User user = userRepo.findByUsernameOrEmailOrPhone(
                identifier, identifier, identifier
        ).orElseThrow(() -> new AppException("Người dùng không tồn tại"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);

        otpService.deleteOtp(request.getIdentifier());
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequestDTO dto) {
        // 1. Kiểm tra xác nhận mật khẩu
        if (!dto.getNewPassword().equals(dto.getConfirmNewPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp!");
        }

        // 2. Tìm User
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
                
        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }

        // 4. Mã hóa mật khẩu mới và lưu
        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepo.save(user);
    }
}
