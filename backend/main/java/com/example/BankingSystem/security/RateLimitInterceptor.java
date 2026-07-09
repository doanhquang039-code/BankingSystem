package com.example.BankingSystem.security;

import com.example.BankingSystem.annotation.RateLimit;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.TimeUnit;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);
    private final StringRedisTemplate redisTemplate;

    public RateLimitInterceptor(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        // Kiểm tra xem annotation @RateLimit được khai báo ở method hoặc class (controller)
        RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);
        if (rateLimit == null) {
            rateLimit = handlerMethod.getBeanType().getAnnotation(RateLimit.class);
        }

        if (rateLimit == null) {
            return true;
        }

        int limit = rateLimit.limit();
        int duration = rateLimit.duration();

        // Xác định client key: Dùng username nếu đã đăng nhập, ngược lại dùng IP
        String clientKey = getClientKey(request);
        String methodKey = handlerMethod.getBeanType().getSimpleName() + ":" + handlerMethod.getMethod().getName();
        String redisKey = "rate_limit:" + clientKey + ":" + methodKey;

        try {
            Long currentRequests = redisTemplate.opsForValue().increment(redisKey);
            if (currentRequests != null) {
                if (currentRequests == 1) {
                    redisTemplate.expire(redisKey, duration, TimeUnit.SECONDS);
                }

                if (currentRequests > limit) {
                    log.warn("Rate limit exceeded for client: {}, method: {}. Total requests: {}", clientKey, methodKey, currentRequests);
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"status\": 429, \"error\": \"Too Many Requests\", \"message\": \"Thao tác quá nhanh. Vui lòng thử lại sau ít phút.\"}");
                    return false;
                }
            }
        } catch (Exception e) {
            log.warn("Lỗi kết nối Redis khi kiểm tra Rate Limit. Tự động bỏ qua kiểm tra: {}", e.getMessage());
        }

        return true;
    }

    private String getClientKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return "user:" + auth.getName();
        }
        
        // Lấy IP thật nếu đứng sau proxy/load balancer
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return "ip:" + ip;
    }
}
