package com.lab.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MemberRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String address;

    private BigDecimal feeAmount;
}
