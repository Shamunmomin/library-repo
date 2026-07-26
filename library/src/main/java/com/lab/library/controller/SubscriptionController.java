package com.lab.library.controller;

import com.lab.library.dto.response.ApiResponse;
import com.lab.library.dto.response.PlanResponse;
import com.lab.library.dto.response.SubscriptionStatusResponse;
import com.lab.library.entity.User;
import com.lab.library.repository.UserRepository;
import com.lab.library.service.SubscriptionService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/owner/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<PlanResponse>>> getPlans() {
        List<PlanResponse> plans = subscriptionService.getActivePlans();
        return ResponseEntity.ok(ApiResponse.success("Plans retrieved successfully", plans));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<SubscriptionStatusResponse>> getSubscriptionStatus(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.lab.library.exception.ResourceNotFoundException("User not found"));

        SubscriptionStatusResponse status = subscriptionService.getSubscriptionStatus(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Subscription status retrieved", status));
    }

    @PostMapping("/purchase")
    public ResponseEntity<ApiResponse<Void>> submitPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("planId") @NotNull Long planId,
            @RequestParam("screenshot") MultipartFile screenshot) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.lab.library.exception.ResourceNotFoundException("User not found"));

        subscriptionService.submitPayment(user.getId(), planId, screenshot);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment request submitted successfully. Please wait for admin approval."));
    }

    @GetMapping("/admin-phone")
    public ResponseEntity<ApiResponse<String>> getAdminPhone() {
        String phone = subscriptionService.getAdminPhone();
        return ResponseEntity.ok(ApiResponse.success("Admin phone retrieved", phone));
    }
}
