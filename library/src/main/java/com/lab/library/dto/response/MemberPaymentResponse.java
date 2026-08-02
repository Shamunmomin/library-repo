package com.lab.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberPaymentResponse {
    private String id;
    private String memberId;
    private BigDecimal amount;
    private LocalDate periodStart;
    private LocalDate paidUpTo;
    private LocalDateTime paymentDate;
    private String method;
    private String receiptNo;
    private String remarks;
    private String status;
    private String reversedBy;
    private LocalDateTime reversedAt;
    private String reverseReason;
    private LocalDateTime createdAt;
}
