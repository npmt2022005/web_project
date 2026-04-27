package com.thuc_kien.freelance_marketplace.Exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.validation.ValidationException;
import com.thuc_kien.freelance_marketplace.DTO.APIResponse;

@RestControllerAdvice
public class GlobalExceptionController {
    // DuplicateRecordException
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<APIResponse<Void>> handleConflict(ConflictException ex){
        APIResponse<Void> response = APIResponse.<Void>builder()
            .status("error")
            .message(ex.getMessage())
            .build();
        return ResponseEntity.status(409).body(response);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<APIResponse<Void>> handleValidation(ValidationException ex){
        APIResponse<Void> reponse = APIResponse.<Void>builder()
        .status("error")
        .message(ex.getMessage())
        .build();
        return ResponseEntity.status(400).body(reponse);
    }
    
    @ExceptionHandler(AppException.class)
    public ResponseEntity<APIResponse<Void>> handleAppException(AppException ex) {
        APIResponse<Void> response = APIResponse.<Void>builder()
                .status("error")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
   
    @ExceptionHandler(Exception.class)
    public ResponseEntity<APIResponse<Void>> handleGeneralException(Exception ex) {
        ex.printStackTrace(); 
        // Hoặc nếu dùng log: log.error("Hệ thống lỗi: ", ex);

        APIResponse<Void> response = APIResponse.<Void>builder()
                .status("error")
                .message("Đã xảy ra lỗi hệ thống: " + ex.getMessage()) // Hiện message lỗi để debug nhanh
                .build();
        return ResponseEntity.status(500).body(response);
    }
    

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse<Map<String, String>>> handleValidException(MethodArgumentNotValidException ex){
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage); // Lỗi sau cùng của cùng 1 field sẽ đè lên lỗi trước
        });

        APIResponse<Map<String, String>> response = APIResponse.<Map<String, String>>builder()
        .status("error")
        .message("Dữ liệu nhập vào không hợp lệ")
        .data(errors)
        .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
