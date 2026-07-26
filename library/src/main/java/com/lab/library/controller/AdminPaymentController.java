package com.lab.library.controller;

import com.lab.library.dto.request.PaymentApprovalRequest;
import com.lab.library.dto.response.ApiResponse;
import com.lab.library.dto.response.PaymentRequestResponse;
import com.lab.library.service.AdminPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<PaymentRequestResponse>>> getPendingPayments() {
        List<PaymentRequestResponse> payments = adminPaymentService.getPendingPayments();
        return ResponseEntity.ok(ApiResponse.success("Pending payments retrieved", payments));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<PaymentRequestResponse>>> getAllPayments() {
        List<PaymentRequestResponse> payments = adminPaymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success("All payments retrieved", payments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentRequestResponse>> getPaymentById(@PathVariable UUID id) {
        PaymentRequestResponse payment = adminPaymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved", payment));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approvePayment(
            @PathVariable UUID id,
            @RequestBody(required = false) PaymentApprovalRequest request) {
        String notes = request != null ? request.getAdminNotes() : null;
        adminPaymentService.approvePayment(id, notes);
        return ResponseEntity.ok(ApiResponse.success("Payment approved successfully"));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectPayment(
            @PathVariable UUID id,
            @RequestBody PaymentApprovalRequest request) {
        adminPaymentService.rejectPayment(id, request.getAdminNotes());
        return ResponseEntity.ok(ApiResponse.success("Payment rejected"));
    }
}
