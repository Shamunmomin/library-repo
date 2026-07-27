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
public class LibraryResponse {
    private UUID id;
    private UUID userId;
    private String name;
    private String address;
    private String phone;
    private String icon;
    private LocalDateTime createdAt;
}
