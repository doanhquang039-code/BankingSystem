package com.example.BankingSystem.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * Cấu hình Flyway tường minh.
 * Cần thiết vì Spring Boot 4.x có thể không tự-autoconfigure Flyway đúng cách.
 * Bean này đảm bảo Flyway LUÔN chạy khi app khởi động.
 */
@Configuration
public class FlywayConfig {

    @Value("${spring.flyway.locations:classpath:db/migration}")
    private String[] locations;

    @Value("${spring.flyway.baseline-on-migrate:true}")
    private boolean baselineOnMigrate;

    @Value("${spring.flyway.baseline-version:0}")
    private String baselineVersion;

    @Value("${spring.flyway.out-of-order:true}")
    private boolean outOfOrder;

    @Value("${spring.flyway.validate-on-migrate:false}")
    private boolean validateOnMigrate;

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations(locations)
                .baselineOnMigrate(baselineOnMigrate)
                .baselineVersion(baselineVersion)
                .outOfOrder(outOfOrder)
                .validateOnMigrate(validateOnMigrate)
                .load();
        
        // Tự động sửa chữa bảng lịch sử flyway_schema_history nếu có migration bị lỗi trước đó
        flyway.repair();
        
        return flyway;
    }
}
