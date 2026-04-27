package com.thuc_kien.freelance_marketplace.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("your-email@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Mã OTP xác thực quên mật khẩu");
        message.setText("Chào bạn,\n\n" +
                "Mã OTP để đặt lại mật khẩu của bạn là: " + otpCode + "\n" +
                "Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.\n\n" +
                "Trân trọng,\n" +
                "Freelance Marketplace Team");

        mailSender.send(message);
    }
}