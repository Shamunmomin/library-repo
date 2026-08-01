package com.lab.library.service;

import com.lab.library.entity.Subscription;
import com.lab.library.enums.NotificationType;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.notifications.mail.enabled}")
    private boolean mailEnabled;

    @Value("${app.notifications.frontend-url}")
    private String frontendUrl;

    @Async("notificationExecutor")
    public void sendSubscriptionNotification(Subscription subscription, NotificationType type) {
        if (!mailEnabled) {
            log.debug("Mail notifications disabled; skipping {} for subscription {}", type, subscription.getId());
            return;
        }

        try {
            String renewUrl = frontendUrl + "/subscribe";
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(subscription.getUser().getEmail());
            helper.setSubject("LibraryPro: " + (type == NotificationType.EXPIRED
                    ? "Your subscription has expired"
                    : "Your subscription expires soon"));
            helper.setText(EmailTemplates.render(subscription, type, renewUrl), true);
            mailSender.send(message);
            log.info("{} email sent for subscription {}", type, subscription.getId());
        } catch (Exception e) {
            log.error("Failed to send {} email for subscription {}: {}", type, subscription.getId(), e.getMessage());
        }
    }
}
