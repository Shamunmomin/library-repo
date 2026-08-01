package com.lab.library.service.policy;

import com.lab.library.entity.Subscription;
import com.lab.library.enums.SubscriptionStatus;

import java.time.LocalDateTime;

public interface SubscriptionExpiryPolicy {

    LocalDateTime lockoutTime(LocalDateTime endDate);

    boolean isLockedOut(LocalDateTime endDate, LocalDateTime now);

    boolean isReminderDue(LocalDateTime endDate, LocalDateTime now, int daysBefore);

    SubscriptionStatus resolveEffectiveStatus(Subscription subscription, LocalDateTime now);
}
