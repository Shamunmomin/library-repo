package com.lab.library.service;

import com.lab.library.dto.StoredImage;
import com.lab.library.dto.response.SubscriptionResponse;
import com.lab.library.entity.Payment;
import com.lab.library.entity.Subscription;
import com.lab.library.entity.User;
import com.lab.library.enums.PaymentStatus;
import com.lab.library.enums.Role;
import com.lab.library.enums.SubscriptionPackage;
import com.lab.library.enums.SubscriptionStatus;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.exception.UnauthorizedException;
import com.lab.library.mapper.SubscriptionMapper;
import com.lab.library.repository.PaymentRepository;
import com.lab.library.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final SubscriptionMapper subscriptionMapper;
    private final ImageStorageService imageStorageService;
    private final SubscriptionEventService subscriptionEventService;

    public SubscriptionPackage getUserActivePackage(UUID userId) {
        User user = userService.getById(userId);
        return subscriptionRepository.findTopByUserOrderByCreatedAtDesc(user)
                .filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE)
                .map(Subscription::getPackageType)
                .orElse(null);
    }

    @Transactional
    public SubscriptionResponse create(UUID userId, SubscriptionPackage packageType, StoredImage screenshot) {
        User user = userService.getById(userId);

        boolean hasActive = subscriptionRepository.existsByUserAndStatus(user, SubscriptionStatus.ACTIVE);
        if (hasActive) {
            throw new BadRequestException("You already have an active subscription");
        }

        boolean hasPending = subscriptionRepository.existsByUserAndStatus(user, SubscriptionStatus.PENDING);
        if (hasPending) {
            throw new BadRequestException("You already have a pending subscription request");
        }

        Subscription subscription = Subscription.builder()
                .user(user)
                .packageType(packageType)
                .status(SubscriptionStatus.PENDING)
                .paymentScreenshot("/uploads/subscriptions/" + screenshot.fileName())
                .screenshotData(screenshot.data())
                .screenshotContentType(screenshot.contentType())
                .screenshotFileName(screenshot.fileName())
                .build();

        subscription = subscriptionRepository.save(subscription);
        log.info("Subscription created for user: {} package: {}", user.getEmail(), packageType);

        SubscriptionResponse response = subscriptionMapper.toResponse(subscription);
        subscriptionEventService.notifyUser(user.getId(), response);
        return response;
    }

    public SubscriptionResponse getMySubscription(UUID userId) {
        User user = userService.getById(userId);
        return subscriptionRepository.findTopByUserOrderByCreatedAtDesc(user)
                .map(subscriptionMapper::toResponse)
                .orElse(null);
    }

    public SubscriptionResponse getById(UUID id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", id));
        return subscriptionMapper.toResponse(subscription);
    }

    @Transactional(readOnly = true)
    public StoredImage getSubscriptionScreenshot(UUID id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", id));
        User currentUser = userService.getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isAdmin && !subscription.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not allowed to view this payment screenshot");
        }
        if (subscription.getScreenshotData() != null) {
            return new StoredImage(subscription.getScreenshotData(), subscription.getScreenshotContentType(), subscription.getScreenshotFileName());
        }
        return imageStorageService.readFromDisk(subscription.getPaymentScreenshot());
    }

    public List<SubscriptionResponse> getAllSubscriptions() {
        return subscriptionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(subscriptionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<SubscriptionResponse> getSubscriptionsByStatus(SubscriptionStatus status) {
        return subscriptionRepository.findByStatus(status).stream()
                .map(subscriptionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubscriptionResponse verify(UUID id, SubscriptionStatus newStatus, String rejectionReason) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", "id", id));

        if (subscription.getStatus() != SubscriptionStatus.PENDING) {
            throw new BadRequestException("Only pending subscriptions can be verified");
        }

        subscription.setStatus(newStatus);

        if (newStatus == SubscriptionStatus.ACTIVE) {
            subscription.setStartDate(LocalDateTime.now());
            subscription.setEndDate(LocalDateTime.now().plusMonths(1));

            BigDecimal amount = subscription.getPackageType() == SubscriptionPackage.PRO
                    ? new BigDecimal("999") : new BigDecimal("499");

            Payment payment = Payment.builder()
                    .user(subscription.getUser())
                    .amount(amount)
                    .subscriptionType(subscription.getPackageType())
                    .paymentDate(LocalDateTime.now())
                    .subscriptionEndDate(subscription.getEndDate())
                    .paymentMethod("Online Transaction")
                    .status(PaymentStatus.COMPLETED)
                    .build();
            paymentRepository.save(payment);

            log.info("Subscription {} activated for user: {}, payment recorded: {}", id, subscription.getUser().getEmail(), payment.getId());
        } else if (newStatus == SubscriptionStatus.REJECTED) {
            subscription.setRejectionReason(rejectionReason);
            log.info("Subscription {} rejected for user: {}. Reason: {}", id, subscription.getUser().getEmail(), rejectionReason);
        }

        subscription = subscriptionRepository.save(subscription);

        SubscriptionResponse response = subscriptionMapper.toResponse(subscription);
        subscriptionEventService.notifyUser(subscription.getUser().getId(), response);
        return response;
    }
}
