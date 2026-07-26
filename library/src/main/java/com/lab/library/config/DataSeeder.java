package com.lab.library.config;

import com.lab.library.entity.Role;
import com.lab.library.entity.User;
import com.lab.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
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
}
