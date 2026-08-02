package com.lab.library.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "app.member-fee")
public class MemberFeeProperties {

    private String expiryCron = "0 30 6 * * *";

    private List<Integer> reminderDaysBefore = List.of(3, 1);
}
