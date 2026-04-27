package com.thuc_kien.freelance_marketplace.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.thuc_kien.freelance_marketplace.DTO.*;

import com.thuc_kien.freelance_marketplace.Service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController implements AuthApi{
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<APIResponse<Void>> register(@Valid @RequestBody RegisterRequest request){
        // Gọi service xử lý nghiệp vụ
        authService.register(request);

        // Trả về phản hồi thành công theo chuẩn ApiResponse
        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<Void>builder()
                        .status("success")
                        .message("Đăng ký tài khoản thành công!")
                        .build()
        );
    }
    @PostMapping("/login")
    public ResponseEntity<APIResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest lr){
        LoginResponse loginResponse = authService.login(lr);

        return ResponseEntity.ok(
                APIResponse.<LoginResponse>builder()
                        .status("success")
                        .message("Đăng nhập thành công!")
                        .data(loginResponse)
                        .build()
        );
    } 

    @PostMapping("/verify-otp")
    public ResponseEntity<APIResponse<String>> verifyOtp(@RequestBody VerifyRequest request) {
        authService.verifyOtp(request.getIdentifier(), request.getOtp());
        
        // Nếu verifyOtp không ném ra Exception, nghĩa là mã đúng.
        return ResponseEntity.ok(
            APIResponse.<String>builder()
                .status("success")
                .message("Mã OTP hợp lệ")
                .data("OK") // Trả về tín hiệu để Frontend chuyển màn hình
                .build()
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<APIResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        
        // Gọi service xử lý logic đổi mật khẩu
        authService.resetPassword(request);
        
        return ResponseEntity.ok(new APIResponse<>(
                "success", 
                "Mật khẩu đã được cập nhật thành công!", 
                null
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<APIResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest rq){
        authService.forgotPassword(rq.getIdentifier());
        
        return ResponseEntity.ok(
                APIResponse.<Void>builder()
                        .status("success")
                        .message("Mã OTP đã được gửi vào Email của bạn. Vui lòng kiểm tra!")
                        .build()
        );
        
    }    
}
