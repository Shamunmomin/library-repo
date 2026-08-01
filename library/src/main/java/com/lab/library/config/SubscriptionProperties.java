package com.lab.library.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "app.subscription")
public class SubscriptionProperties {

    @Value("${app.subscription.months-per-cycle}")
    private int monthsPerCycle;

    @Value("${app.subscription.grace-period-days}")
    private long gracePeriodDays;

    @Value("${app.subscription.expiry-cron}")
    private String expiryCron = "0 0 6 * * *";


    private List<Integer> reminderDaysBefore = List.of(3, 1);
}
