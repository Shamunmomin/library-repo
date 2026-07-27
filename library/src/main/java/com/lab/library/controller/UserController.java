package com.lab.library.controller;

import com.lab.library.dto.response.OnboardingStatusResponse;
import com.lab.library.service.LibraryService;
import com.lab.library.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final LibraryService libraryService;

    @GetMapping("/onboarding-status")
    public ResponseEntity<OnboardingStatusResponse> getOnboardingStatus() {
        UUID userId = userService.getCurrentUserId();
        return ResponseEntity.ok(libraryService.getOnboardingStatus(userId));
    }
}
