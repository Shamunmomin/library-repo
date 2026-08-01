package com.lab.library.repository;

import com.lab.library.entity.NotificationLog;
import com.lab.library.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {

    boolean existsBySubscriptionIdAndType(UUID subscriptionId, NotificationType type);

    boolean existsBySubscriptionIdAndTypeAndReminderDays(UUID subscriptionId, NotificationType type, Integer reminderDays);
}
