package com.lab.library.config;

import com.lab.library.entity.PlanType;
import com.lab.library.entity.Role;
import com.lab.library.entity.SubscriptionPlan;
import com.lab.library.entity.User;
import com.lab.library.repository.SubscriptionPlanRepository;
import com.lab.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubscriptionPlanRepository planRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedPlans();
    }

    private void seedAdmin() {
        String adminEmail = "admin@library.com";

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin user already exists, skipping seed.");
            return;
        }

        User admin = User.builder()
                .name("Super Admin")
                .email(adminEmail)
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.SUPER_ADMIN)
                .active(true)
                .build();

        userRepository.save(admin);
        log.info("Admin user created successfully: {}", adminEmail);
    }

    private void seedPlans() {
        if (planRepository.count() > 0) {
            log.info("Subscription plans already exist, skipping seed.");
            return;
        }

        SubscriptionPlan basic = SubscriptionPlan.builder()
                .planType(PlanType.BASIC)
                .name("Basic Plan")
                .price(new BigDecimal("999.00"))
                .maxFloors(1)
                .maxSeats(50)
                .maxMembers(100)
                .description("Perfect for small libraries. Includes basic features for managing members and seats.")
                .durationDays(30)
                .active(true)
                .build();

        SubscriptionPlan pro = SubscriptionPlan.builder()
                .planType(PlanType.PRO)
                .name("Pro Plan")
                .price(new BigDecimal("2499.00"))
                .maxFloors(5)
                .maxSeats(500)
                .maxMembers(1000)
                .description("For growing libraries. Includes advanced features, multiple floors, and priority support.")
                .durationDays(30)
                .active(true)
                .build();

        planRepository.save(basic);
        planRepository.save(pro);
        log.info("Subscription plans seeded: BASIC, PRO");
    }
}
