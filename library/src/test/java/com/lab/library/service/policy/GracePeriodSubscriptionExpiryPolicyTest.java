package com.lab.library.service.policy;

import com.lab.library.config.SubscriptionProperties;
import com.lab.library.entity.Subscription;
import com.lab.library.enums.SubscriptionPackage;
import com.lab.library.enums.SubscriptionStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class GracePeriodSubscriptionExpiryPolicyTest {

    private GracePeriodSubscriptionExpiryPolicy policy;

    @BeforeEach
    void setUp() {
        SubscriptionProperties properties = new SubscriptionProperties();
        properties.setGracePeriodDays(3);
        policy = new GracePeriodSubscriptionExpiryPolicy(properties);
    }

    @Test
    void isLockedOut_isFalseBeforeGracePeriodEnds() {
        LocalDateTime now = LocalDateTime.of(2026, 8, 1, 12, 0);
        LocalDateTime endDate = now.minusDays(1);

        assertFalse(policy.isLockedOut(endDate, now));
    }

    @Test
    void isLockedOut_isFalseExactlyAtLockoutBoundary() {
        LocalDateTime now = LocalDateTime.of(2026, 8, 1, 12, 0);
        LocalDateTime endDate = now.minusDays(3);

        assertFalse(policy.isLockedOut(endDate, now));
    }

    @Test
    void isLockedOut_isTrueAfterGracePeriod() {
        LocalDateTime now = LocalDateTime.of(2026, 8, 1, 12, 0);
        LocalDateTime endDate = now.minusDays(3).minusMinutes(1);

        assertTrue(policy.isLockedOut(endDate, now));
    }

    @Test
    void isReminderDue_firesOnlyInItsOwnDayWindow() {
        LocalDateTime endDate = LocalDateTime.of(2026, 8, 10, 12, 0);

        assertTrue(policy.isReminderDue(endDate, endDate.minusDays(3).plusMinutes(1), 3));
        assertFalse(policy.isReminderDue(endDate, endDate.minusDays(3), 3));
        assertTrue(policy.isReminderDue(endDate, endDate.minusDays(2).minusMinutes(1), 3));
        assertFalse(policy.isReminderDue(endDate, endDate.minusDays(1), 3));

        assertTrue(policy.isReminderDue(endDate, endDate.minusDays(1).plusMinutes(1), 1));
        assertFalse(policy.isReminderDue(endDate, endDate.minusDays(1), 1));
        assertFalse(policy.isReminderDue(endDate, endDate.plusMinutes(1), 1));
    }

    @Test
    void resolveEffectiveStatus_marksOverdueActiveAsExpired() {
        LocalDateTime now = LocalDateTime.of(2026, 8, 1, 12, 0);

        Subscription activeOverdue = Subscription.builder()
                .packageType(SubscriptionPackage.BASE)
                .status(SubscriptionStatus.ACTIVE)
                .endDate(now.minusDays(5))
                .build();

        assertEquals(SubscriptionStatus.EXPIRED, policy.resolveEffectiveStatus(activeOverdue, now));
    }

    @Test
    void resolveEffectiveStatus_keepsActiveDuringGrace() {
        LocalDateTime now = LocalDateTime.of(2026, 8, 1, 12, 0);

        Subscription activeInGrace = Subscription.builder()
                .packageType(SubscriptionPackage.BASE)
                .status(SubscriptionStatus.ACTIVE)
                .endDate(now.minusDays(1))
                .build();

        assertEquals(SubscriptionStatus.ACTIVE, policy.resolveEffectiveStatus(activeInGrace, now));
    }

    @Test
    void resolveEffectiveStatus_doesNotTouchOtherStatuses() {
        LocalDateTime now = LocalDateTime.of(2026, 8, 1, 12, 0);

        Subscription pending = Subscription.builder()
                .packageType(SubscriptionPackage.BASE)
                .status(SubscriptionStatus.PENDING)
                .endDate(null)
                .build();

        assertEquals(SubscriptionStatus.PENDING, policy.resolveEffectiveStatus(pending, now));
    }
}
