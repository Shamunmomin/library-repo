package com.lab.library.service;

import com.lab.library.dto.request.LoginRequest;
import com.lab.library.dto.request.RefreshTokenRequest;
import com.lab.library.dto.request.RegisterRequest;
import com.lab.library.dto.response.AuthResponse;
import com.lab.library.dto.response.UserResponse;
import com.lab.library.entity.RefreshToken;
import com.lab.library.entity.User;
import com.lab.library.enums.Role;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.DuplicateResourceException;
import com.lab.library.mapper.UserMapper;
import com.lab.library.repository.RefreshTokenRepository;
import com.lab.library.repository.UserRepository;
import com.lab.library.security.JwtTokenProvider;
import io.github.bucket4j.Bucket;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    @Qualifier("loginBucket")
    private final Bucket loginBucket;

    @Qualifier("registerBucket")
    private final Bucket registerBucket;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!registerBucket.tryConsume(1)) {
            throw new BadRequestException("Too many registration attempts. Please try again later.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed - email already exists: {}", request.getEmail());
            throw new DuplicateResourceException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.OWNER)
                .enabled(true)
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully: {} with role OWNER", user.getEmail());

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refreshTokenStr = jwtTokenProvider.generateRefreshToken(user.getId());

        saveRefreshToken(user, refreshTokenStr);

        UserResponse userResponse = userMapper.toResponse(user);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .user(userResponse)
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        if (!loginBucket.tryConsume(1)) {
            throw new BadRequestException("Too many login attempts. Please try again later.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            log.warn("Login failed for email: {}", request.getEmail());
            throw e;
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refreshTokenStr = jwtTokenProvider.generateRefreshToken(user.getId());

        saveRefreshToken(user, refreshTokenStr);

        UserResponse userResponse = userMapper.toResponse(user);
        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .user(userResponse)
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (storedToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(storedToken);
            log.warn("Expired refresh token used for userId: {}", storedToken.getUser().getId());
            throw new BadRequestException("Refresh token expired. Please login again.");
        }

        User user = storedToken.getUser();

        refreshTokenRepository.delete(storedToken);

        String newAccessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String newRefreshTokenStr = jwtTokenProvider.generateRefreshToken(user.getId());

        saveRefreshToken(user, newRefreshTokenStr);

        UserResponse userResponse = userMapper.toResponse(user);
        log.debug("Tokens refreshed for user: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .user(userResponse)
                .build();
    }

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        refreshTokenRepository.deleteByUser(user);
        log.info("User logged out: {}", email);
    }

    private void saveRefreshToken(User user, String token) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiryDate(Instant.now().plus(7, ChronoUnit.DAYS))
                .build();
        refreshTokenRepository.save(refreshToken);
    }
}
