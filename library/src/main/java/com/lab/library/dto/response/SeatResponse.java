package com.lab.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatResponse {
    private UUID id;
    private UUID floorId;
    private String seatNumber;
    private String status;
    private LocalDateTime createdAt;
}
