package com.lab.library.config;

import com.lab.library.entity.User;
import com.lab.library.enums.Role;
import com.lab.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@library.com")) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@library.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("0000000000")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin created: admin@library.com / admin123");
        } else {
            log.info("Default admin already exists");
        }

        long ownerCount = userRepository.countByRole(Role.OWNER);
        log.info("Total owners registered: {}", ownerCount);
    }
}
