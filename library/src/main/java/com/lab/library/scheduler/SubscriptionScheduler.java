package com.lab.library.scheduler;

import com.lab.library.entity.SubscriptionStatus;
import com.lab.library.repository.LibrarySubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionScheduler {

    private final LibrarySubscriptionRepository subscriptionRepository;

    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void checkExpiredSubscriptions() {
        LocalDate today = LocalDate.now();

        int expiredCount = subscriptionRepository.expireSubscriptions(
                today,
                SubscriptionStatus.ACTIVE,
                SubscriptionStatus.EXPIRED
        );

        log.info("Subscription expiry job completed. Expired {} subscriptions.", expiredCount);
    }
}
