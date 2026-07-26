package com.lab.library.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateLibraryRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;
}
