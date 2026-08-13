package com.lab.library.service;

import com.lab.library.entity.Member;
import com.lab.library.entity.Subscription;
import com.lab.library.enums.NotificationType;
import com.lab.library.enums.SubscriptionPackage;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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

    @Async("notificationExecutor")
    public void sendMemberFeeNotification(Member member, NotificationType type) {
        if (!mailEnabled) {
            log.debug("Mail notifications disabled; skipping {} for member {}", type, member.getId());
            return;
        }
        if (member.getEmail() == null || member.getEmail().isBlank()) {
            log.debug("Member {} has no email; skipping {} notification", member.getId(), type);
            return;
        }

        try {
            String libraryName = member.getLibrary().getName();
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(member.getEmail());
            helper.setSubject(libraryName + ": " + (type == NotificationType.EXPIRED
                    ? "Your membership fee has expired"
                    : "Your membership fee expires soon"));
            helper.setText(EmailTemplates.renderMemberFee(member, type, libraryName), true);
            mailSender.send(message);
            log.info("{} member-fee email sent to {}", type, member.getEmail());
        } catch (Exception e) {
            log.error("Failed to send {} member-fee email for member {}: {}", type, member.getId(), e.getMessage());
        }
    }

//    subscription apply reminder  notification to admin
@Async("notificationExecutor")
public void sendSubscriptionRequestMailTOOwner(String name, SubscriptionPackage subscriptionPackage) {
    if (!mailEnabled) {
        log.debug("Mail notifications disabled; skipping {} for subscription request {}", name,subscriptionPackage);
        return;
    }

    String ownerEmail="samtech20070809@gmail.com";
    String packageType=subscriptionPackage.name();

    try {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(ownerEmail);
        helper.setSubject(name + ": " + "New subscription request received");
        helper.setText(EmailTemplates.renderSubscriptionApplication(name,packageType,NotificationType.SUBSCRIPTION_REQUEST, LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")),"https://shamunmomin.github.io/library-repo/login") ,true);
        mailSender.send(message);
        log.info("{} member-fee email sent to {}", subscriptionPackage, ownerEmail);
    } catch (Exception e) {
        log.error("Failed to send {} member-fee email for member {}: {}", ownerEmail, e.getMessage());
    }
}

}
