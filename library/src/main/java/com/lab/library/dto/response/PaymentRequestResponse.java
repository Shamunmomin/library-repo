package com.lab.library.dto.response;

import com.lab.library.entity.PaymentStatus;
import com.lab.library.entity.PlanType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestResponse {

    private UUID id;
    private UUID libraryId;
    private UUID userId;
    private String userName;
    private String libraryName;
    private PlanType planType;
    private String planName;
    private BigDecimal amount;
    private String screenshotPath;
    private PaymentStatus status;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
