package com.lab.library.controller;

import com.lab.library.dto.request.VerifySubscriptionRequest;
import com.lab.library.dto.response.*;
import com.lab.library.entity.Payment;
import com.lab.library.entity.User;
import com.lab.library.enums.SubscriptionStatus;
import com.lab.library.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SubscriptionService subscriptionService;
    private final LibraryService libraryService;
    private final AdminService adminService;
    private final ReportService reportService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

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
    public ResponseEntity<List<LibraryDetailResponse>> getAllLibraries(
            @RequestParam(required = false) String filter) {
        return ResponseEntity.ok(adminService.getAllLibrariesWithDetails(filter));
    }

    @GetMapping("/libraries/{id}")
    public ResponseEntity<LibraryDetailResponse> getLibraryDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getLibraryDetail(id));
    }

    @DeleteMapping("/libraries/{id}")
    public ResponseEntity<Void> deleteLibrary(@PathVariable UUID id) {
        libraryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllOwners());
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getAllPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(adminService.getAllPayments(status, startDate, endDate));
    }

    @GetMapping("/reports/payments")
    public ResponseEntity<byte[]> downloadPaymentReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusMonths(1);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

        byte[] pdf = reportService.generateAdminPaymentReport(start, end);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=admin-payment-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
