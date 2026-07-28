package com.lab.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberPaymentResponse {
    private String id;
    private String memberId;
    private BigDecimal amount;
    private LocalDate paidUpTo;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
}
