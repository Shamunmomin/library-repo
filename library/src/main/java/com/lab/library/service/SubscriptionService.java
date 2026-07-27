package com.lab.library.service;

import com.lab.library.dto.response.PlanResponse;
import com.lab.library.dto.response.SubscriptionStatusResponse;
import com.lab.library.entity.*;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.lab.library.dto.response.PaymentRequestResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final LibraryRepository libraryRepository;
    private final LibrarySubscriptionRepository subscriptionRepository;
    private final PaymentRequestRepository paymentRequestRepository;
    private final UserRepository userRepository;

    @Value("${file.upload.payments:uploads/payments/}")
    private String uploadDir;

    @Value("${app.admin.phone}")
    private String adminPhone;

    @Value("${app.admin.upi-id}")
    private String adminUpiId;

    public List<PlanResponse> getActivePlans() {
        return planRepository.findByActiveTrue().stream()
                .map(this::mapToPlanResponse)
                .toList();
    }

    public SubscriptionStatusResponse getSubscriptionStatus(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean hasPendingPayment = paymentRequestRepository
                .existsByUserIdAndStatus(userId, PaymentStatus.PENDING);

        boolean hasApprovedPayment = !hasPendingPayment &&
                paymentRequestRepository.existsByUserIdAndStatus(userId, PaymentStatus.APPROVED);

        var libraryOpt = libraryRepository.findByOwnerId(userId);

        if (libraryOpt.isEmpty()) {
            return SubscriptionStatusResponse.builder()
                    .subscribed(false)
                    .status(null)
                    .planName(null)
                    .startDate(null)
                    .endDate(null)
                    .pendingPayment(hasPendingPayment)
                    .paymentApproved(hasApprovedPayment)
                    .build();
        }

        Library library = libraryOpt.get();

        var activeSubscription = subscriptionRepository
                .findByLibraryIdAndStatus(library.getId(), SubscriptionStatus.ACTIVE);

        if (activeSubscription.isPresent()) {
            LibrarySubscription sub = activeSubscription.get();
            return SubscriptionStatusResponse.builder()
                    .subscribed(true)
                    .status(sub.getStatus())
                    .planName(sub.getPlan().getName())
                    .startDate(sub.getStartDate())
                    .endDate(sub.getEndDate())
                    .pendingPayment(false)
                    .paymentApproved(false)
                    .build();
        }

        // Has library but no active subscription — check for approved payment
        boolean hasApprovedPaymentWithLibrary = paymentRequestRepository
                .existsByUserIdAndStatus(userId, PaymentStatus.APPROVED);

        return SubscriptionStatusResponse.builder()
                .subscribed(false)
                .status(null)
                .planName(null)
                .startDate(null)
                .endDate(null)
                .pendingPayment(hasPendingPayment)
                .paymentApproved(hasApprovedPaymentWithLibrary)
                .build();
    }

    @Transactional
    public void submitPayment(UUID userId, UUID planId, MultipartFile screenshot) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));

        if (!plan.isActive()) {
            throw new BadRequestException("Selected plan is no longer active");
        }

        boolean hasPending = paymentRequestRepository
                .existsByUserIdAndStatus(userId, PaymentStatus.PENDING);
        if (hasPending) {
            throw new BadRequestException("You already have a pending payment request. Please wait for admin approval.");
        }

        boolean hasActive = libraryRepository.findByOwnerId(userId)
                .flatMap(library -> subscriptionRepository.findByLibraryIdAndStatus(library.getId(), SubscriptionStatus.ACTIVE))
                .isPresent();
        if (hasActive) {
            throw new BadRequestException("You already have an active subscription.");
        }

        String screenshotPath = saveScreenshot(screenshot, userId);

        PaymentRequest paymentRequest = PaymentRequest.builder()
                .libraryId(null)
                .userId(userId)
                .plan(plan)
                .amount(plan.getPrice())
                .screenshotPath(screenshotPath)
                .status(PaymentStatus.PENDING)
                .build();

        paymentRequestRepository.save(paymentRequest);
        log.info("Payment request created for user: {}, plan: {}", user.getEmail(), plan.getName());
    }

    public String getAdminPhone() {
        return adminPhone;
    }

    public String getAdminUpiId() {
        return adminUpiId;
    }

    public List<PaymentRequestResponse> getPaymentHistory(UUID userId) {
        return paymentRequestRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(pr -> {
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
                })
                .toList();
    }

    private String saveScreenshot(MultipartFile file, UUID userId) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String fileName = userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            return uploadDir + fileName;
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload screenshot: " + e.getMessage());
        }
    }

    private PlanResponse mapToPlanResponse(SubscriptionPlan plan) {
        return PlanResponse.builder()
                .id(plan.getId())
                .planType(plan.getPlanType())
                .name(plan.getName())
                .price(plan.getPrice())
                .maxFloors(plan.getMaxFloors())
                .maxSeats(plan.getMaxSeats())
                .maxMembers(plan.getMaxMembers())
                .description(plan.getDescription())
                .durationDays(plan.getDurationDays())
                .build();
    }
}
