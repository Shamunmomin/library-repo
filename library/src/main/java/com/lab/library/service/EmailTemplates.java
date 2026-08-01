package com.lab.library.service;

import com.lab.library.entity.Subscription;
import com.lab.library.entity.User;
import com.lab.library.enums.NotificationType;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

final class EmailTemplates {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private EmailTemplates() {
    }

    static String render(Subscription subscription, NotificationType type, String renewUrl) {
        User owner = subscription.getUser();
        String packageName = subscription.getPackageType().name();
        String endDate = subscription.getEndDate() != null
                ? subscription.getEndDate().format(DATE_FORMAT)
                : "N/A";

        String headline;
        String body;
        switch (type) {
            case EXPIRED -> {
                headline = "Your subscription has expired";
                body = "Your " + packageName + " plan expired on " + endDate + " and access to your library workspace has been locked. "
                        + "Renew now to restore access — all your data is safe.";
            }
            case REMINDER -> {
                headline = "Your subscription expires soon";
                body = "Your " + packageName + " plan expires on " + endDate + ". "
                        + "Renew before then to keep your library workspace running without interruption.";
            }
            default -> throw new IllegalArgumentException("Unsupported notification type: " + type);
        }

        return "<html><body style='font-family:Arial,sans-serif;background:#f7f7f7;padding:24px;'>"
                + "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px;'>"
                + "<h2 style='margin-top:0;color:#111827;'>" + headline + "</h2>"
                + "<p style='color:#374151;'>Hello " + htmlEscape(owner.getName()) + ",</p>"
                + "<p style='color:#374151;'>" + body + "</p>"
                + "<p style='margin:24px 0;'>"
                + "<a href='" + htmlEscape(renewUrl) + "' style='background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;'>Renew Now</a>"
                + "</p>"
                + "<p style='color:#6b7280;font-size:12px;margin-bottom:0;'>This is an automated message from LibraryPro.</p>"
                + "</div></body></html>";
    }

    private static String htmlEscape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
