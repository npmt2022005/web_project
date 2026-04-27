package com.thuc_kien.freelance_marketplace.Service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {
    public void sendOtpSms(String phoneNumber, String otp) {
        // Log ra màn hình để demo
        System.out.println("--- GIẢ LẬP SMS ---");
        System.out.println("Gửi mã " + otp + " đến số điện thoại: " + phoneNumber);
        System.out.println("-------------------");
    }
}
