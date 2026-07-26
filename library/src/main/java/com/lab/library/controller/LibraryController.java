package com.lab.library.controller;

import com.lab.library.dto.request.CreateLibraryRequest;
import com.lab.library.dto.request.UpdateLibraryRequest;
import com.lab.library.dto.response.ApiResponse;
import com.lab.library.dto.response.LibraryResponse;
import com.lab.library.entity.User;
import com.lab.library.repository.UserRepository;
import com.lab.library.service.LibraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;
    private final UserRepository userRepository;

    @PostMapping("/api/owner/library")
    public ResponseEntity<ApiResponse<LibraryResponse>> createLibrary(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateLibraryRequest request) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.lab.library.exception.ResourceNotFoundException("User not found"));

        LibraryResponse library = libraryService.createLibrary(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Library created successfully", library));
    }

    @GetMapping("/api/owner/library")
    public ResponseEntity<ApiResponse<LibraryResponse>> getMyLibrary(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.lab.library.exception.ResourceNotFoundException("User not found"));

        LibraryResponse library = libraryService.getLibraryByOwner(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Library retrieved", library));
    }

    @PutMapping("/api/owner/library")
    public ResponseEntity<ApiResponse<LibraryResponse>> updateMyLibrary(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateLibraryRequest request) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.lab.library.exception.ResourceNotFoundException("User not found"));

        LibraryResponse library = libraryService.updateLibrary(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Library updated successfully", library));
    }

    @GetMapping("/api/admin/libraries")
    public ResponseEntity<ApiResponse<List<LibraryResponse>>> getAllLibraries() {
        List<LibraryResponse> libraries = libraryService.getAllLibraries();
        return ResponseEntity.ok(ApiResponse.success("Libraries retrieved", libraries));
    }

    @GetMapping("/api/admin/libraries/{id}")
    public ResponseEntity<ApiResponse<LibraryResponse>> getLibraryById(@PathVariable UUID id) {
        LibraryResponse library = libraryService.getLibraryById(id);
        return ResponseEntity.ok(ApiResponse.success("Library retrieved", library));
    }

    @PutMapping("/api/admin/libraries/{id}/toggle-active")
    public ResponseEntity<ApiResponse<LibraryResponse>> toggleLibraryActive(@PathVariable UUID id) {
        LibraryResponse library = libraryService.toggleLibraryActive(id);
        String status = library.isActive() ? "activated" : "deactivated";
        return ResponseEntity.ok(ApiResponse.success("Library " + status, library));
    }
}
