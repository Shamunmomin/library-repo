package com.lab.library.service;

import com.lab.library.dto.response.PaymentRequestResponse;
import com.lab.library.entity.*;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminPaymentService {

    private final PaymentRequestRepository paymentRequestRepository;
    private final LibraryRepository libraryRepository;
    private final LibrarySubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final UserRepository userRepository;

    public List<PaymentRequestResponse> getPendingPayments() {
        return paymentRequestRepository.findByStatusOrderByCreatedAtDesc(PaymentStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<PaymentRequestResponse> getAllPayments() {
        return paymentRequestRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void approvePayment(UUID paymentRequestId, String adminNotes) {
        PaymentRequest paymentRequest = paymentRequestRepository.findById(paymentRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment request not found"));

        if (paymentRequest.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("This payment request has already been processed");
        }

        SubscriptionPlan plan = paymentRequest.getPlan();
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(plan.getDurationDays());

        LibrarySubscription subscription = LibrarySubscription.builder()
                .libraryId(paymentRequest.getLibraryId())
                .plan(plan)
                .startDate(startDate)
                .endDate(endDate)
                .status(SubscriptionStatus.ACTIVE)
                .build();

        subscriptionRepository.save(subscription);

        paymentRequest.setStatus(PaymentStatus.APPROVED);
        paymentRequest.setAdminNotes(adminNotes);
        paymentRequest.setProcessedAt(LocalDateTime.now());
        paymentRequestRepository.save(paymentRequest);

        log.info("Payment approved for library: {}, plan: {}", paymentRequest.getLibraryId(), plan.getName());
    }

    @Transactional
    public void rejectPayment(UUID paymentRequestId, String adminNotes) {
        PaymentRequest paymentRequest = paymentRequestRepository.findById(paymentRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment request not found"));

        if (paymentRequest.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("This payment request has already been processed");
        }

        paymentRequest.setStatus(PaymentStatus.REJECTED);
        paymentRequest.setAdminNotes(adminNotes);
        paymentRequest.setProcessedAt(LocalDateTime.now());
        paymentRequestRepository.save(paymentRequest);

        log.info("Payment rejected for library: {}, reason: {}", paymentRequest.getLibraryId(), adminNotes);
    }

    public PaymentRequestResponse getPaymentById(UUID paymentRequestId) {
        PaymentRequest paymentRequest = paymentRequestRepository.findById(paymentRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment request not found"));
        return mapToResponse(paymentRequest);
    }

    private PaymentRequestResponse mapToResponse(PaymentRequest pr) {
        String userName = userRepository.findById(pr.getUserId())
                .map(User::getName).orElse("Unknown");
        String libraryName = libraryRepository.findById(pr.getLibraryId())
                .map(Library::getName).orElse("Unknown");

        return PaymentRequestResponse.builder()
                .id(pr.getId())
                .libraryId(pr.getLibraryId())
                .userId(pr.getUserId())
                .userName(userName)
                .libraryName(libraryName)
                .planType(pr.getPlan().getPlanType())
                .planName(pr.getPlan().getName())
                .amount(pr.getAmount())
                .screenshotPath(pr.getScreenshotPath())
                .status(pr.getStatus())
                .adminNotes(pr.getAdminNotes())
                .createdAt(pr.getCreatedAt())
                .processedAt(pr.getProcessedAt())
                .build();
    }
}
