package com.example.BankingSystem.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {
    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        try {
            // Thử kết nối nhanh đến Redis để kiểm tra xem Redis Server có đang chạy không
            connectionFactory.getConnection().close();
            
            log.info("====> Redis đang hoạt động. Kích hoạt RedisCacheManager...");
            RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(10)) // Cache tồn tại 10 phút mặc định
                    .disableCachingNullValues();
            
            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(config)
                    .build();
        } catch (Exception e) {
            log.warn("====> Không thể kết nối tới Redis Server. Hệ thống tự động chuyển sang In-Memory Cache (ConcurrentMapCacheManager). Chi tiết lỗi: {}", e.getMessage());
            return new ConcurrentMapCacheManager("lessons", "vouchers", "captcha");
        }
    }
}
