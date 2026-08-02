package com.lab.library.entity;

import com.lab.library.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "member_notification_logs",
        uniqueConstraints = @UniqueConstraint(name = "uk_member_notif_member_type_days", columnNames = {"member_id", "type", "reminder_days"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberNotificationLog {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(name = "reminder_days")
    private Integer reminderDays;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }
}
