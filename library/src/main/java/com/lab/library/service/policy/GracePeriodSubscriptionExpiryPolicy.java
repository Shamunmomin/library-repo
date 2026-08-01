package com.lab.library.service.policy;

import com.lab.library.config.SubscriptionProperties;
import com.lab.library.entity.Subscription;
import com.lab.library.enums.SubscriptionStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class GracePeriodSubscriptionExpiryPolicy implements SubscriptionExpiryPolicy {

    private final SubscriptionProperties properties;

    public GracePeriodSubscriptionExpiryPolicy(SubscriptionProperties properties) {
        this.properties = properties;
    }

    @Override
    public LocalDateTime lockoutTime(LocalDateTime endDate) {
        if (endDate == null) {
            return null;
        }
        return endDate.plusDays(properties.getGracePeriodDays());
    }

    @Override
    public boolean isLockedOut(LocalDateTime endDate, LocalDateTime now) {
        LocalDateTime lockout = lockoutTime(endDate);
        return lockout != null && now.isAfter(lockout);
    }

    @Override
    public boolean isReminderDue(LocalDateTime endDate, LocalDateTime now, int daysBefore) {
        if (endDate == null || daysBefore <= 0) {
            return false;
        }
        return now.isAfter(endDate.minusDays(daysBefore))
                && !now.isAfter(endDate.minusDays(daysBefore - 1));
    }

    @Override
    public SubscriptionStatus resolveEffectiveStatus(Subscription subscription, LocalDateTime now) {
        if (subscription.getStatus() == SubscriptionStatus.ACTIVE
                && isLockedOut(subscription.getEndDate(), now)) {
            return SubscriptionStatus.EXPIRED;
        }
        return subscription.getStatus();
    }
}
