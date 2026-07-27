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
public class LibraryDetailResponse {
    private UUID id;
    private UUID userId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private String name;
    private String address;
    private String phone;
    private String icon;
    private String subscriptionPackage;
    private String subscriptionStatus;
    private int floorCount;
    private long totalSeats;
    private long occupiedSeats;
    private LocalDateTime createdAt;
}
