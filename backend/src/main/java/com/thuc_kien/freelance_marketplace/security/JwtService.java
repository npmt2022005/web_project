package com.thuc_kien.freelance_marketplace.security;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private static final String SECRET_KEY = "amF2YWRldmVsb3BlcnRhc2tiYXNlNjRzZWNyZXRreXByb2plY3RmcmVlbGFuY2U=";
    // Thời gian sống của Token (ví dụ: 24 giờ)
    private static final long EXPIRATION_TIME = 86400000;


    // tạo access token từ thông tin username
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        
        var authorities = userDetails.getAuthorities();
        claims.put("roles", authorities.stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList()));
        

        if (userDetails instanceof CustomUserDetails) {
            claims.put("userId", ((CustomUserDetails) userDetails).getUser().getId());
        }
        return createToken(claims, userDetails.getUsername());
    }

    //tạo Token với thời gian hết hạn và chữ ký
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) 
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    public long getExpirationTimeInSeconds() {
        return EXPIRATION_TIME / 1000;
    }
   

    // 5. Trích xuất thời gian hết hạn từ Token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    

    // Trích xuất username
    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }
    //Hàm hỗ trợ để trích xuất một Claim cụ thể
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
   

    // kiểm tra tính hợp lệ
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

  
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}

