package com.thuc_kien.freelance_marketplace.Config;

import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import com.thuc_kien.freelance_marketplace.security.JwtService;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") 
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                // Chỉ xử lý khi có lệnh CONNECT (bắt tay WebSocket)
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Lấy token từ header "Authorization"
                    String authorizationHeader = accessor.getFirstNativeHeader("Authorization");
                    String token = null;
                    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                        token = authorizationHeader.substring(7);
                    }

                    if (token != null) {
                        try {
                            // 1. Trích xuất username từ token bằng hàm của bạn
                            String username = jwtService.extractUsername(token);
                            
                            if (username != null) {
                                // 2. Tải thông tin tài khoản đầy đủ từ Database lên
                                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                
                                // 3. Đối chiếu xác thực thời hạn và tính hợp lệ của Token thông qua hàm validateToken
                                if (jwtService.validateToken(token, userDetails)) {
                                    
                                    // Tạo quyền chứng thực an toàn cho Spring Security
                                    UsernamePasswordAuthenticationToken authentication = 
                                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                                    
                                    // 🔑 Nạp thông tin người dùng vào phiên làm việc của WebSocket
                                    accessor.setUser(authentication);
                                    System.out.println("🟢 WebSocket: Xác thực thành công cho tài khoản: " + username);
                                } else {
                                    System.err.println("❌ WebSocket: Token đã hết hạn hoặc không khớp thông tin.");
                                }
                            }
                        } catch (Exception e) {
                            System.err.println("❌ WebSocket: Lỗi giải mã Token ngầm: " + e.getMessage());
                        }
                    } else {
                        System.err.println("❌ WebSocket: Không tìm thấy Token hợp lệ trong Header CONNECT.");
                    }
                }
                return message;
            }
        });
    }
}
