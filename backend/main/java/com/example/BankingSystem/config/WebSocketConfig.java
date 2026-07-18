package com.example.BankingSystem.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket / STOMP configuration.
 *
 * <p>Flow:
 * <ol>
 *   <li>Client connects to <code>/ws</code> (with SockJS fallback)</li>
 *   <li>Client subscribes to <code>/topic/notifications/{userId}</code></li>
 *   <li>Server pushes via <code>SimpMessagingTemplate.convertAndSend(...)</code></li>
 * </ol>
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Simple in-memory broker for topics
        registry.enableSimpleBroker("/topic", "/queue");
        // Client sends messages to /app/...
        registry.setApplicationDestinationPrefixes("/app");
        // User-specific queues  /user/{userId}/queue/...
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();          // fallback for browsers without native WebSocket
    }
}
