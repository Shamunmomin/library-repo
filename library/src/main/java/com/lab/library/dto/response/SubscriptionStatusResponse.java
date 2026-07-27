package com.lab.library.dto.response;

import com.lab.library.entity.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionStatusResponse {

    private boolean subscribed;
    private SubscriptionStatus status;
    private String planName;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean pendingPayment;
    private boolean paymentApproved;
}
