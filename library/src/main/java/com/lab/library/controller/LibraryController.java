package com.lab.library.controller;

import com.lab.library.dto.response.LibraryResponse;
import com.lab.library.service.LibraryService;
import com.lab.library.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/libraries")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;
    private final UserService userService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LibraryResponse> create(
            @RequestParam("name") String name,
            @RequestParam("address") String address,
            @RequestParam("phone") String phone,
            @RequestParam(value = "icon", required = false) MultipartFile icon) throws IOException {

        UUID userId = userService.getCurrentUserId();
        String iconPath = icon != null ? saveFile(icon, "icons") : null;

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(libraryService.create(userId, name, address, phone, iconPath));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LibraryResponse> update(
            @PathVariable UUID id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "icon", required = false) MultipartFile icon) throws IOException {

        String iconPath = icon != null ? saveFile(icon, "icons") : null;
        return ResponseEntity.ok(libraryService.update(id, name, address, phone, iconPath));
    }

    @GetMapping("/my")
    public ResponseEntity<LibraryResponse> getMyLibrary() {
        UUID userId = userService.getCurrentUserId();
        LibraryResponse response = libraryService.getMyLibrary(userId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LibraryResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(libraryService.getById(id));
    }

    private String saveFile(MultipartFile file, String subDir) throws IOException {
        String uploadDir = System.getProperty("user.dir") + "/uploads/" + subDir;
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName));
        return "/uploads/" + subDir + "/" + fileName;
    }
}
