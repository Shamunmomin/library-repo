package com.lab.library.service;

import com.lab.library.config.SubscriptionProperties;
import com.lab.library.dto.response.SubscriptionResponse;
import com.lab.library.entity.NotificationLog;
import com.lab.library.entity.Subscription;
import com.lab.library.enums.NotificationType;
import com.lab.library.enums.SubscriptionStatus;
import com.lab.library.mapper.SubscriptionMapper;
import com.lab.library.repository.NotificationLogRepository;
import com.lab.library.repository.SubscriptionRepository;
import com.lab.library.service.policy.SubscriptionExpiryPolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionExpiryService {

    private final SubscriptionRepository subscriptionRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final SubscriptionMapper subscriptionMapper;
    private final SubscriptionEventService subscriptionEventService;
    private final EmailService emailService;
    private final SubscriptionExpiryPolicy expiryPolicy;
    private final SubscriptionProperties properties;

    @Scheduled(cron = "${app.subscription.expiry-cron:0 0 6 * * *}")
    @Transactional
    public void processSubscriptionLifecycle() {
        LocalDateTime now = LocalDateTime.now();
        log.info("Subscription lifecycle job started at {}", now);

        int expired = expireLockedOutSubscriptions(now);
        int reminders = sendReminders(now);

        log.info("Subscription lifecycle job finished: expired={}, reminders={}", expired, reminders);
    }

    private int expireLockedOutSubscriptions(LocalDateTime now) {
        LocalDateTime cutoff = now.minusDays(properties.getGracePeriodDays());
        List<Subscription> dueSubscriptions = subscriptionRepository
                .findByStatusAndEndDateBefore(SubscriptionStatus.ACTIVE, cutoff);

        int expired = 0;
        for (Subscription subscription : dueSubscriptions) {
            try {
                if (!expiryPolicy.isLockedOut(subscription.getEndDate(), now)) {
                    continue;
                }
                subscription.setStatus(SubscriptionStatus.EXPIRED);
                subscription = subscriptionRepository.save(subscription);

                SubscriptionResponse response = subscriptionMapper.toResponse(subscription);
                subscriptionEventService.notifyUser(subscription.getUser().getId(), response);
                emailService.sendSubscriptionNotification(subscription, NotificationType.EXPIRED);
                recordNotification(subscription, NotificationType.EXPIRED, null);

                log.info("Subscription {} expired for user {}", subscription.getId(), subscription.getUser().getEmail());
                expired++;
            } catch (Exception e) {
                log.error("Failed to expire subscription {}: {}", subscription.getId(), e.getMessage(), e);
            }
        }
        return expired;
    }

    private int sendReminders(LocalDateTime now) {
        List<Integer> reminderDays = properties.getReminderDaysBefore();
        if (reminderDays == null || reminderDays.isEmpty()) {
            return 0;
        }

        int maxDays = reminderDays.stream().mapToInt(Integer::intValue).max().orElse(1);
        List<Subscription> candidates = subscriptionRepository
                .findByStatusAndEndDateBetween(SubscriptionStatus.ACTIVE, now, now.plusDays(maxDays));

        int sent = 0;
        for (Subscription subscription : candidates) {
            for (int daysBefore : reminderDays) {
                try {
                    if (!expiryPolicy.isReminderDue(subscription.getEndDate(), now, daysBefore)) {
                        continue;
                    }
                    if (notificationLogRepository.existsBySubscriptionIdAndTypeAndReminderDays(
                            subscription.getId(), NotificationType.REMINDER, daysBefore)) {
                        continue;
                    }
                    emailService.sendSubscriptionNotification(subscription, NotificationType.REMINDER);
                    recordNotification(subscription, NotificationType.REMINDER, daysBefore);

                    log.info("Reminder (T-{}d) sent for subscription {} user {}", daysBefore,
                            subscription.getId(), subscription.getUser().getEmail());
                    sent++;
                } catch (Exception e) {
                    log.error("Failed to send reminder for subscription {}: {}", subscription.getId(), e.getMessage(), e);
                }
            }
        }
        return sent;
    }

    private void recordNotification(Subscription subscription, NotificationType type, Integer reminderDays) {
        NotificationLog logEntry = NotificationLog.builder()
                .subscription(subscription)
                .type(type)
                .reminderDays(reminderDays)
                .build();
        try {
            notificationLogRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("Could not record {} notification for subscription {}: {}", type, subscription.getId(), e.getMessage());
        }
    }
}
