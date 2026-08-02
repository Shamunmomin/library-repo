package com.lab.library.repository;

import com.lab.library.entity.MemberNotificationLog;
import com.lab.library.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MemberNotificationLogRepository extends JpaRepository<MemberNotificationLog, UUID> {

    boolean existsByMemberIdAndTypeAndReminderDays(UUID memberId, NotificationType type, Integer reminderDays);

    boolean existsByMemberIdAndType(UUID memberId, NotificationType type);
}
