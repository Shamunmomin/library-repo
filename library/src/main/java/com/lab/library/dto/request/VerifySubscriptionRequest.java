package com.lab.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifySubscriptionRequest {
    @NotBlank(message = "Status is required")
    private String status;

    private String rejectionReason;
}
