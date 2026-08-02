package com.lab.library.service;

import com.lab.library.config.MemberFeeProperties;
import com.lab.library.entity.Member;
import com.lab.library.entity.MemberNotificationLog;
import com.lab.library.enums.FeeStatus;
import com.lab.library.enums.NotificationType;
import com.lab.library.repository.MemberNotificationLogRepository;
import com.lab.library.repository.MemberRepository;
import com.lab.library.service.policy.MemberFeePolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberFeeExpiryService {

    private final MemberRepository memberRepository;
    private final MemberNotificationLogRepository notificationLogRepository;
    private final MemberFeePolicy feePolicy;
    private final MemberFeeProperties properties;
    private final EmailService emailService;

    @Scheduled(cron = "${app.member-fee.expiry-cron:0 30 6 * * *}")
    @Transactional
    public void processMemberFeeLifecycle() {
        LocalDate today = LocalDate.now();
        log.info("Member fee lifecycle job started at {}", today);

        int expired = expireMembers(today);
        int reminders = sendReminders(today);

        log.info("Member fee lifecycle job finished: expired={}, reminders={}", expired, reminders);
    }

    private int expireMembers(LocalDate today) {
        List<Member> dueMembers = memberRepository.findAllFeeExpired(today);

        int expired = 0;
        for (Member member : dueMembers) {
            try {
                if (!feePolicy.isExpired(member, today)) {
                    continue;
                }
                if (member.getFeeStatus() == FeeStatus.UNPAID || member.getFeeStatus() == FeeStatus.EXPIRED) {
                    continue;
                }
                member.setFeeStatus(FeeStatus.EXPIRED);
                memberRepository.save(member);

                emailService.sendMemberFeeNotification(member, NotificationType.EXPIRED);
                recordNotification(member, NotificationType.EXPIRED, null);

                log.info("Member {} fee expired", member.getId());
                expired++;
            } catch (Exception e) {
                log.error("Failed to expire member {}: {}", member.getId(), e.getMessage(), e);
            }
        }
        return expired;
    }

    private int sendReminders(LocalDate today) {
        List<Integer> reminderDays = properties.getReminderDaysBefore();
        if (reminderDays == null || reminderDays.isEmpty()) {
            return 0;
        }

        int maxDays = reminderDays.stream().mapToInt(Integer::intValue).max().orElse(1);
        List<Member> candidates = memberRepository.findReminderCandidates(
                today, today.plusDays(maxDays), List.of(FeeStatus.PAID, FeeStatus.PARTIAL));

        int sent = 0;
        for (Member member : candidates) {
            for (int daysBefore : reminderDays) {
                try {
                    if (!feePolicy.isReminderDue(member.getPaidUpTo(), today, daysBefore)) {
                        continue;
                    }
                    if (notificationLogRepository.existsByMemberIdAndTypeAndReminderDays(
                            member.getId(), NotificationType.REMINDER, daysBefore)) {
                        continue;
                    }
                    emailService.sendMemberFeeNotification(member, NotificationType.REMINDER);
                    recordNotification(member, NotificationType.REMINDER, daysBefore);

                    log.info("Reminder (T-{}d) sent for member {} user {}", daysBefore,
                            member.getId(), member.getLibrary().getUser().getEmail());
                    sent++;
                } catch (Exception e) {
                    log.error("Failed to send reminder for member {}: {}", member.getId(), e.getMessage(), e);
                }
            }
        }
        return sent;
    }

    private void recordNotification(Member member, NotificationType type, Integer reminderDays) {
        MemberNotificationLog logEntry = MemberNotificationLog.builder()
                .member(member)
                .type(type)
                .reminderDays(reminderDays)
                .build();
        try {
            notificationLogRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("Could not record {} notification for member {}: {}", type, member.getId(), e.getMessage());
        }
    }
}
