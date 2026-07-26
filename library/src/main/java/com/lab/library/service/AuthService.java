package com.lab.library.service;

import com.lab.library.dto.request.LoginRequest;
import com.lab.library.dto.request.RegisterRequest;
import com.lab.library.dto.response.AuthResponse;
import com.lab.library.entity.*;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.DuplicateResourceException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.repository.LibraryRepository;
import com.lab.library.repository.LibrarySubscriptionRepository;
import com.lab.library.repository.UserRepository;
import com.lab.library.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final LibraryRepository libraryRepository;
    private final LibrarySubscriptionRepository subscriptionRepository;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .libraryId(user.getLibraryId())
                .isSubscribed(checkSubscription(user))
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already in use");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already in use");
        }

        if (request.getRole() == Role.SUPER_ADMIN) {
            throw new BadRequestException("Cannot register as SUPER_ADMIN");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateTokenFromUsername(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshTokenFromUsername(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .libraryId(user.getLibraryId())
                .isSubscribed(false)
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        String newAccessToken = jwtTokenProvider.generateTokenFromUsername(username);
        String newRefreshToken = jwtTokenProvider.generateRefreshTokenFromUsername(username);

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .libraryId(user.getLibraryId())
                .isSubscribed(checkSubscription(user))
                .build();
    }

    public AuthResponse getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .libraryId(user.getLibraryId())
                .isSubscribed(checkSubscription(user))
                .build();
    }

    private boolean checkSubscription(User user) {
        if (user.getRole() == Role.SUPER_ADMIN) {
            return true;
        }

        return libraryRepository.findByOwnerId(user.getId())
                .flatMap(library -> subscriptionRepository.findByLibraryIdAndStatus(
                        library.getId(), SubscriptionStatus.ACTIVE))
                .isPresent();
    }
}
