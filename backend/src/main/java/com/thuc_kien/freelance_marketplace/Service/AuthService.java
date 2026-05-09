package com.thuc_kien.freelance_marketplace.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;


import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.DTO.LoginRequest;
import com.thuc_kien.freelance_marketplace.DTO.LoginResponse;
import com.thuc_kien.freelance_marketplace.DTO.RegisterRequest;
import com.thuc_kien.freelance_marketplace.DTO.ResetPasswordRequest;
import com.thuc_kien.freelance_marketplace.Exception.AppException;
import com.thuc_kien.freelance_marketplace.Exception.ConflictException;
import com.thuc_kien.freelance_marketplace.Repository.UserRepository;
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
    
    private final SmsService smsService;
    private final AuthenticationManager authenticationManager;

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
        if (rq.getRole() == UserRole.ROLE_SELLER){
            newUser.getRoles().add(UserRole.ROLE_SELLER);
            newUser.setCurrentRole(UserRole.ROLE_SELLER);
        } else {
            newUser.setCurrentRole(UserRole.ROLE_BUYER);
        }
        userRepo.save(newUser);
    }

    public LoginResponse login(LoginRequest lr){
        // 1. Xác thực người dùng (Spring sẽ tự gọi UserDetailsService và check Password)
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(lr.getIdentifier(), lr.getPassword())
        );
        User user = userRepo.findByUsernameOrEmailOrPhone(lr.getIdentifier(), lr.getIdentifier() , lr.getIdentifier()
                                                            ).orElseThrow(() -> new AppException("\"Tên đăng nhập hoặc mật khẩu không chính xác\""));
        // if (!passwordEncoder.matches(lr.getPassword(), user.getPasswordHash())) {
        //     throw new AppException("Tên đăng nhập hoặc mật khẩu không chính xác");
        // }
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
}
