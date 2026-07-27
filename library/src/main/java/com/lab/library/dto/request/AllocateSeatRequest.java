package com.lab.library.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AllocateSeatRequest {
    @NotNull(message = "Seat ID is required")
    private UUID seatId;

    @NotNull(message = "Member ID is required")
    private UUID memberId;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}
