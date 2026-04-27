package com.thuc_kien.freelance_marketplace.Service;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;


@Service
public class OtpService {

    @Autowired
    private StringRedisTemplate redisTemplate;
    // Thời gian sống của OTP (ví dụ 5 phút)
    private final long OTP_VALID_DURATION = 5;


    public void saveOtp(String loginId, String otpCode) {
        // Key trong Redis sẽ có dạng: "OTP:0987654321"
        String key = "OTP:" + loginId;
        
        // Lưu vào Redis và đặt thời gian tự động xóa sau 5 phút
        redisTemplate.opsForValue().set(key, otpCode, OTP_VALID_DURATION, TimeUnit.MINUTES);
    }
    public String getOtp(String loginId) {
        return redisTemplate.opsForValue().get("OTP:" + loginId);
    }
    public void deleteOtp(String loginId) {
        redisTemplate.delete("OTP:" + loginId);
    }
}
