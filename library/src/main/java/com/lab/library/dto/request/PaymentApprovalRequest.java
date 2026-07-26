package com.lab.library.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PaymentApprovalRequest {

    @NotNull
    private UUID paymentRequestId;

    private String adminNotes;
}
