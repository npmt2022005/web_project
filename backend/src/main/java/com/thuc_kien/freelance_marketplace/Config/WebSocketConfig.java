package com.thuc_kien.freelance_marketplace.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Mở endpoint cho React kết nối tới. Cho phép Cross-Origin (CORS).
        // Sử dụng SockJS làm fallback nếu trình duyệt không hỗ trợ WebSocket chuẩn.
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") 
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Tiền tố cho các kênh mà server sẽ đẩy dữ liệu về (React sẽ "lắng nghe" kênh này)
        registry.enableSimpleBroker("/topic");
        
        // Tiền tố cho các message từ React gửi lên Server (nếu cần)
        registry.setApplicationDestinationPrefixes("/app");
    }
}
