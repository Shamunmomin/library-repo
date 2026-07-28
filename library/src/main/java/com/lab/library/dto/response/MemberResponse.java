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
public class MemberResponse {
    private UUID id;
    private UUID libraryId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String photo;
    private LocalDate joinDate;
    private LocalDate paidUpTo;
    private BigDecimal feeAmount;
    private String feeStatus;
    private String allocatedSeat;
    private LocalDateTime createdAt;
}
