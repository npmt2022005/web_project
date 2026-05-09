package com.thuc_kien.freelance_marketplace.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import com.thuc_kien.freelance_marketplace.Service.UserDetailsServiceImpl;
import com.thuc_kien.freelance_marketplace.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Sử dụng BCrypt để mã hóa mật khẩu trong DB
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider =
            new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Cấu hình CORS (Lấy từ Bean bên dưới)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. Tắt CSRF vì chúng ta dùng JWT (Stateless)
            .csrf(AbstractHttpConfigurer::disable)
            
            // 3. Quản lý phân quyền API
            .authorizeHttpRequests(auth -> auth
                // Cho phép tất cả các API liên quan đến Auth và Quên mật khẩu
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(
                "/v3/api-docs/**",          // Dữ liệu API thô
                "/swagger-ui/**",           // Giao diện Swagger UI
                "/swagger-ui.html",         // Trang chính Swagger
                "/swagger-resources/**",
                "/webjars/**"
            ).permitAll()
                .requestMatchers("/api//admin/**").hasRole("ADMIN")   // Chỉ ADMIN mới vào được các link này
                
                // Các API khác yêu cầu phải đăng nhập mới được dùng
                .anyRequest().authenticated()
            )
            
            // 4. Cấu hình Session: Không lưu Session trên Server (Stateless)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 4. Cấu hình Authentication Provider (Nơi chứa PasswordEncoder và UserDetailsService)
            .authenticationProvider(authenticationProvider())

            // 5. Thêm JWT Filter vào trước UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() { 
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Cho phép Frontend (Vite/React) truy cập
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); 
        
        // Cho phép các phương thức HTTP
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Cho phép tất cả các Header (Quan trọng để gửi JWT trong Header)
        configuration.setAllowedHeaders(List.of("*"));
        
        // Cho phép gửi kèm thông tin xác thực
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
}