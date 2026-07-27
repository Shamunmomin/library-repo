package com.lab.library.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class RateLimitingConfig {

    @Value("${app.rate-limit.login-capacity}")
    private int loginCapacity;

    @Value("${app.rate-limit.login-refill}")
    private int loginRefill;

    @Value("${app.rate-limit.register-capacity}")
    private int registerCapacity;

    @Value("${app.rate-limit.register-refill}")
    private int registerRefill;

    @Value("${app.rate-limit.refill-minutes}")
    private int refillMinutes;

    @Bean
    public Bucket loginBucket() {
        Bandwidth limit = Bandwidth.classic(loginCapacity,
                Refill.greedy(loginRefill, Duration.ofMinutes(refillMinutes)));
        return Bucket.builder().addLimit(limit).build();
    }

    @Bean
    public Bucket registerBucket() {
        Bandwidth limit = Bandwidth.classic(registerCapacity,
                Refill.greedy(registerRefill, Duration.ofMinutes(refillMinutes)));
        return Bucket.builder().addLimit(limit).build();
    }
}
