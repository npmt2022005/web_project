package com.thuc_kien.freelance_marketplace.Controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;

import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.ForgotPasswordRequest;
import com.thuc_kien.freelance_marketplace.DTO.LoginRequest;
import com.thuc_kien.freelance_marketplace.DTO.LoginResponse;
import com.thuc_kien.freelance_marketplace.DTO.RegisterRequest;
import com.thuc_kien.freelance_marketplace.DTO.ResetPasswordRequest;
import com.thuc_kien.freelance_marketplace.DTO.VerifyRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Authentication")
public interface AuthApi {
    @Operation(summary = "Đăng ký tài khoản", description = "Tạo tài khoản mới cho người dùng Buyer.")
    @ApiResponses(value = {
    @ApiResponse(
        responseCode = "201", 
        description = "Đăng ký thành công",
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(
                name = "SuccessResponse",
                value = "{\"status\": \"success\", \"message\": \"Đăng ký tài khoản thành công!\", \"data\": null}"
            )
        )
    ),
    @ApiResponse(
        responseCode = "400", 
        description = "Lỗi nhập liệu",
        content = @Content(
            mediaType = "application/json",
            examples = {
            @ExampleObject(
                name = "Tổng hợp các lỗi",
                value = """
                    {
                    "status": "error",
                    "message": "Dữ liệu nhập vào không hợp lệ",
                    "data": {
                        "confirmPassword": "Mật khẩu xác nhận không trùng khớp",
                        "phone": "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0",
                        "email": "Định dạng email không hợp lệ",
                        "password": "Mật khẩu không được để trống",
                        "fullname": "Fullname không được để trống"
                    }
                    }
                    """
            ),
            @ExampleObject(name = "Mật khẩu xác nhận không khớp", value = "{\"status\": \"error\", \"message\": \"Mật khẩu xác thực không được để trống\"}")
        }
        )
    ),
    @ApiResponse(
        responseCode = "409", 
        description = "Xung đột dữ liệu",
        content = @Content(
            mediaType = "application/json",
            examples = {
            @ExampleObject(name = "Trùng Email", value = "{\"status\": \"error\", \"message\": \"Email đã tồn tại\"}"),
            @ExampleObject(name = "Trùng Số điện thoại", value = "{\"status\": \"error\", \"message\": \"Số điện thoại đã tồn tại\"}"),
            @ExampleObject(name = "Trùng Username", value = "{\"status\": \"error\", \"message\": \"Tên đăng nhập đã tồn tại\"}")
        }
        )
    )
})
    ResponseEntity<APIResponse<Void>> register(RegisterRequest request);


    @Operation(summary = "Đặt lại mật khẩu mới", description = "Dùng mã OTP để xác nhận và thiết lập mật khẩu mới.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Đổi tài khoản thành công",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "SuccessResponse",
                    value = "{\"status\": \"success\", \"message\": \"Mật khẩu đã được cập nhật thành công!\", \"data\": null}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = APIResponse.class),
                examples = {
                    @ExampleObject(
                    name = "Tổng hợp các lỗi ",
                    value = """
                        {
                            "status": "error",
                            "message": "Dữ liệu nhập vào không hợp lệ",
                            "data": {
                                "identifier" : "không để trống"
                                "identifier" : Identifier phải là Email hoặc Số điện thoại 10 chữ số,
                                "otp": "không để trống",
                                "otp": "Mã OTP phải có đúng 6 chữ số",
                                "newPassword" : "không để trống",
                                "confirmPassword" : "không để trống",
                                "newPassword" : "Mật khẩu phải có ít nhất 8 ký tự"
                            }
                        }
                        """
                    ),
                    @ExampleObject(name = "ma otp het han", value = "{\"status\": \"error\", \"message\": \"Mã OTP đã hết hạn, vui lòng gửi lại\"}"),
                    @ExampleObject(name = "ma otp khong chính xác", value = "{\"status\": \"error\", \"message\": \"Mã OTP không chính xác\"}"),
                    @ExampleObject(name = "mat khau xác nhận ko trùng", value = "{\"status\": \"error\", \"message\": \"Mật khẩu xác nhận không trùng khớp!\"}"),
                    @ExampleObject(name = "nguoi dùng không tồn tại", value = "{\"status\": \"error\", \"message\": \"Người dùng không tồn tại\"}")
                }
            )
        )
    })
    public ResponseEntity<APIResponse<String>> resetPassword(ResetPasswordRequest request);
    
    @Operation(summary = "Gửi yêu cầu quên mật khẩu", 
            description = "Nhập Email hoặc Số điện thoại để nhận mã OTP xác thực.")
    @ApiResponses(value = {
        @ApiResponse(
                responseCode = "200", 
                description = "Mã OTP đã được gửi vào Email của bạn",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(
                        name = "SuccessResponse",
                        value = "{\"status\": \"success\", \"message\": \"Mã OTP đã được gửi vào Email của bạn. Vui lòng kiểm tra!\"}"
                    )
                )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Lỗi logic hoặc định dạng",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = APIResponse.class),
                examples = {
                    @ExampleObject(
                    name = "Tổng hợp các lỗi ",
                    value = """
                        {
                            "status": "error",
                            "message": "Dữ liệu nhập vào không hợp lệ",
                            "data": {
                                "identifier" : "Tên định danh không được để trống"
                            }
                        }
                        """
                    ),
                    @ExampleObject(
                        name = "Thiếu thông tin liên lạc",
                        summary = "Tài khoản tồn tại nhưng không có email/sdt tương ứng",
                        value = "{\"status\": \"error\", \"message\": \"Tài khoản này chưa có thông tin Email/SDT\"}"
                    ),
                    @ExampleObject(
                        name = "Định dạng không hợp lệ",
                        summary = "Nhập sai định dạng cả email lẫn sdt",
                        value = "{\"status\": \"error\", \"message\": \"Định danh phải là Email hợp lệ hoặc Số điện thoại 10 chữ số\"}"
                    ),
                }
                    
            )
        )
    })
    public ResponseEntity<APIResponse<Void>> forgotPassword(ForgotPasswordRequest rq);

    @Operation(summary = "Xác thực mã OTP", 
            description = "Kiểm tra mã OTP người dùng nhập vào có khớp với mã đã gửi hay không.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Xác thực thành công",
            content = @Content(schema = @Schema(implementation = APIResponse.class),
            examples = @ExampleObject(value = "{\"status\": \"success\", \"message\": \"Mã OTP hợp lệ\", \"data\": \"OK\"}"))
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Mã OTP không chính xác hoặc hết hạn",
            content = @Content(
                mediaType = "application/json",
                examples = {
                    @ExampleObject(
                        name = "OTP sai",
                        value = "{\"status\": \"error\", \"message\": \"Mã OTP không chính xác\"}"
                    ),
                    @ExampleObject(
                        name = "OTP hết hạn",
                        value = "{\"status\": \"error\", \"message\": \"Mã OTP đã hết hạn, vui lòng gửi lại\"}"
                    ),
                    @ExampleObject(
                    name = "Tổng hợp các lỗi ",
                    value = """
                        {
                            "status": "error",
                            "message": "Dữ liệu nhập vào không hợp lệ",
                            "data": {
                                "identifier" : "Identifier phải là Email hoặc Số điện thoại 10 chữ số",
                                "otp": "Mã OTP không được để trống",
                            }
                        }
                        """
                    ),
                }
            )
        )
    })
    public ResponseEntity<APIResponse<String>> verifyOtp(VerifyRequest request);


    @Operation(summary = "Đăng nhập hệ thống", 
            description = "Xác thực người dùng và trả về JWT Token nếu thành công.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Đăng nhập thành công",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                        "status": "success",
                        "message": "Đăng nhập thành công",
                        "data": {
                            "token": "eyJhbGciO...",
                            "fullname": "Nguyen Pham Minh Thuc",
                            "roles": [
                                "ROLE_BUYER",
                                "ROLE_ADMIN"
                            ],
                            "currentRole": "ROLE_BUYER",
                            "type": "Bearer",
                            "expiresIn": 86400
                        }
                    }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Lỗi Validation dữ liệu đầu vào",
            content = @Content(
                mediaType = "application/json",
                examples = {
                    @ExampleObject(
                    name = "Tổng hợp các lỗi ",
                    value = """
                        {
                            "status": "error",
                            "message": "Dữ liệu nhập vào không hợp lệ",
                            "data": {
                                "identifier" : "Tên đăng nhập không được để trống",
                                "password" : "Mật khẩu không được để trống"
                            }
                        }
                        """
                    ),
                    @ExampleObject(
                        name = "ten dang nhap/mk ko dung",
                        value = "{\"status\": \"error\", \"message\": \"Tên đăng nhập hoặc mật khẩu không chính xác\"}"
                    ),

            }
            )
        )
    })
    @PostMapping("/login")
    public ResponseEntity<APIResponse<LoginResponse>> login(LoginRequest request);



}