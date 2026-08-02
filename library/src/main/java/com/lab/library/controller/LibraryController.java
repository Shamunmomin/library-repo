package com.lab.library.controller;

import com.lab.library.dto.StoredImage;
import com.lab.library.dto.response.LibraryResponse;
import com.lab.library.service.ImageStorageService;
import com.lab.library.service.LibraryService;
import com.lab.library.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/libraries")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;
    private final UserService userService;
    private final ImageStorageService imageStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<LibraryResponse> create(
            @RequestParam("name") String name,
            @RequestParam("address") String address,
            @RequestParam("phone") String phone,
            @RequestParam(value = "icon", required = false) MultipartFile icon) throws IOException {

        UUID userId = userService.getCurrentUserId();
        StoredImage storedIcon = icon != null ? imageStorageService.save(icon, "icons") : null;

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(libraryService.create(userId, name, address, phone, storedIcon));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<LibraryResponse> update(
            @PathVariable UUID id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "icon", required = false) MultipartFile icon) throws IOException {

        StoredImage storedIcon = icon != null ? imageStorageService.save(icon, "icons") : null;
        return ResponseEntity.ok(libraryService.update(id, name, address, phone, storedIcon));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<LibraryResponse> getMyLibrary() {
        UUID userId = userService.getCurrentUserId();
        LibraryResponse response = libraryService.getMyLibrary(userId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<LibraryResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(libraryService.getById(id));
    }

    @GetMapping("/{id}/icon")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getIcon(@PathVariable UUID id) {
        StoredImage image = libraryService.getLibraryIcon(id);
        return buildImageResponse(image);
    }

    private ResponseEntity<byte[]> buildImageResponse(StoredImage image) {
        if (image == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.contentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .body(image.data());
    }
}
