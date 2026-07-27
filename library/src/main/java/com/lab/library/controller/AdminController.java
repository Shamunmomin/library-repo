package com.lab.library.controller;

import com.lab.library.dto.request.VerifySubscriptionRequest;
import com.lab.library.dto.response.LibraryResponse;
import com.lab.library.dto.response.SubscriptionResponse;
import com.lab.library.enums.SubscriptionStatus;
import com.lab.library.service.LibraryService;
import com.lab.library.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SubscriptionService subscriptionService;
    private final LibraryService libraryService;

    @GetMapping("/subscriptions")
    public ResponseEntity<List<SubscriptionResponse>> getAllSubscriptions(
            @RequestParam(required = false) String status) {
        if (status != null) {
            SubscriptionStatus subscriptionStatus = SubscriptionStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(subscriptionService.getSubscriptionsByStatus(subscriptionStatus));
        }
        return ResponseEntity.ok(subscriptionService.getAllSubscriptions());
    }

    @PutMapping("/subscriptions/{id}/verify")
    public ResponseEntity<SubscriptionResponse> verifySubscription(
            @PathVariable UUID id,
            @Valid @RequestBody VerifySubscriptionRequest request) {
        SubscriptionStatus newStatus = SubscriptionStatus.valueOf(request.getStatus().toUpperCase());
        return ResponseEntity.ok(subscriptionService.verify(id, newStatus, request.getRejectionReason()));
    }

    @GetMapping("/libraries")
    public ResponseEntity<List<LibraryResponse>> getAllLibraries() {
        return ResponseEntity.ok(libraryService.getAllLibraries());
    }

    @GetMapping("/libraries/{id}")
    public ResponseEntity<LibraryResponse> getLibrary(@PathVariable UUID id) {
        return ResponseEntity.ok(libraryService.getById(id));
    }

    @DeleteMapping("/libraries/{id}")
    public ResponseEntity<Void> deleteLibrary(@PathVariable UUID id) {
        libraryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
