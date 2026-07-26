package com.lab.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryResponse {

    private UUID id;
    private String name;
    private UUID ownerId;
    private String ownerName;
    private String address;
    private String phone;
    private boolean active;
}
