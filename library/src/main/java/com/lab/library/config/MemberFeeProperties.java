package com.lab.library.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "app.member-fee")
public class MemberFeeProperties {

    @Value("${app.member-fee.expiry-cron}")
    private String expiryCron;

    @Value("#{'${app.member-fee.reminder-days-before}'.split(',')}")
    private List<Integer> reminderDaysBefore;
}
