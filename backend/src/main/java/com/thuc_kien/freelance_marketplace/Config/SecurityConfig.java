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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.http.HttpMethod;
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
                    "/v3/api-docs/**",        
                    "/swagger-ui/**",          
                    "/swagger-ui.html",         
                    "/swagger-resources/**",
                    "/webjars/**",
                    "/ws/**" // Endpoint WebSocket
                ).permitAll()
                // Các API công khai cho khách xem (chỉ GET requests)
                .requestMatchers(HttpMethod.GET, "/api/v1/gigs/featured").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/gigs_v1/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/gigs/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/gigs/{id}/similar").permitAll()

                // Các API cho Seller (tạo, cập nhật, xóa gig, upload ảnh)
                // Admin cũng có thể thực hiện các hành động này nếu cần, nên dùng hasAnyRole
                .requestMatchers(HttpMethod.POST, "/api/v1/gigs/create_gig").hasAnyRole("SELLER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/gigs/update/**").hasAnyRole("SELLER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/gigs/delete/**").hasAnyRole("SELLER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/uploads/image").hasAnyRole("SELLER", "ADMIN")

                // Các API liên quan đến Order (yêu cầu xác thực, logic chi tiết trong service)
                .requestMatchers("/api/v1/orders/**").authenticated()
                
                // Các API quản trị
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

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
        
        // Cho phép Frontend từ các nguồn khác nhau:
        // - http://localhost (Nginx proxy - cổng 80)
        // - http://127.0.0.1 (localhost alias)
        // - http://localhost:3000 (Node dev server nếu cần)
        // - http://localhost:5173 (Vite dev server)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost",
            "http://localhost:80",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1",
            "http://127.0.0.1:80",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        )); 
        
        // Cho phép các phương thức HTTP cần thiết
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // Cho phép tất cả các Header (Quan trọng để gửi JWT trong Header)
        configuration.setAllowedHeaders(List.of("*"));
        
        // Cho phép gửi kèm thông tin xác thực (Cookies, Authorization header)
        configuration.setAllowCredentials(true);
        
        // Cache preflight response trong 3600 giây (1 giờ)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
}