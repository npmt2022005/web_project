package com.thuc_kien.freelance_marketplace.Service;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private static final String SECRET_KEY = "amF2YWRldmVsb3BlcnRhc2tiYXNlNjRzZWNyZXRreXByb2plY3RmcmVlbGFuY2U=";
    // Thời gian sống của Token (ví dụ: 24 giờ)
    private static final long EXPIRATION_TIME = 86400000;

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username) // Lưu username vào token
                .setIssuedAt(new Date(System.currentTimeMillis())) // Thời điểm tạo
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // Thời điểm hết hạn
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Ký tên bằng thuật toán HS256
                .compact();
    }
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    public long getExpirationTimeInSeconds() {
        return EXPIRATION_TIME / 1000;
    }
}

