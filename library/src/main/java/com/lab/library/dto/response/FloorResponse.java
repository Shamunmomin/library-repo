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
public class FloorResponse {
    private UUID id;
    private UUID libraryId;
    private String name;
    private String description;
    private long seatCount;
    private LocalDateTime createdAt;
}
