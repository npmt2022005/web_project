package com.thuc_kien.freelance_marketplace.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        
        // 1. Lấy token từ Header Authorization
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        String userEmail;
        try {
            // 2. Trích xuất Token (Cắt bỏ chuỗi "Bearer " - 7 ký tự)
            jwt = authHeader.substring(7);
            
            // 3. Giải mã token để lấy email người dùng
            userEmail = jwtService.extractUsername(jwt);

            // 4. Nếu lấy được email và chưa được xác thực trong SecurityContext
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                // 5. Kiểm tra tính hợp lệ của token (hết hạn, đúng chữ ký...)
                if (jwtService.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // 6. Lưu thông tin xác thực vào Context của hệ thống
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (MalformedJwtException e) {
            // Xử lý lỗi token sai định dạng (thiếu dấu chấm)
            handleException(response, "Token không đúng định dạng (Malformed JWT)");
            return;
        } catch (ExpiredJwtException e) {
            // Xử lý lỗi token hết hạn
            handleException(response, "Token đã hết hạn");
            return;
        } catch (Exception e) {
            // Các lỗi JWT khác
            handleException(response, "Token không hợp lệ");
            return;
        }

        filterChain.doFilter(request, response);
    }
    // Hàm bổ trợ để trả về lỗi JSON cho Frontend
    private void handleException(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }
}
