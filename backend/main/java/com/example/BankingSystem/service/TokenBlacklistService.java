package com.example.BankingSystem.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "jwt_blacklist:";
    private final StringRedisTemplate redisTemplate;

    public TokenBlacklistService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Đưa token vào danh sách đen trong Redis với thời gian sống (TTL) cụ thể.
     *
     * @param token Bearer token cần chặn
     * @param ttlMs thời gian còn lại trước khi token hết hạn (ms)
     */
    public void blacklistToken(String token, long ttlMs) {
        if (ttlMs > 0) {
            String key = BLACKLIST_PREFIX + token;
            redisTemplate.opsForValue().set(key, "true", ttlMs, TimeUnit.MILLISECONDS);
        }
    }

    /**
     * Kiểm tra xem token có nằm trong danh sách đen không.
     *
     * @param token Bearer token cần kiểm tra
     * @return true nếu token đã bị blacklist, ngược lại false
     */
    public boolean isTokenBlacklisted(String token) {
        String key = BLACKLIST_PREFIX + token;
        Boolean hasKey = redisTemplate.hasKey(key);
        return hasKey != null && hasKey;
    }
}
