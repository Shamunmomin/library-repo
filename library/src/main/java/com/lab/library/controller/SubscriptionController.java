package com.lab.library.controller;

import com.lab.library.dto.response.SubscriptionResponse;
import com.lab.library.enums.SubscriptionPackage;
import com.lab.library.service.SubscriptionService;
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
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserService userService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubscriptionResponse> create(
            @RequestParam("packageType") String packageType,
            @RequestParam("screenshot") MultipartFile screenshot) throws IOException {

        UUID userId = userService.getCurrentUserId();
        String screenshotPath = saveFile(screenshot, "subscriptions");
        SubscriptionPackage pkg = SubscriptionPackage.valueOf(packageType.toUpperCase());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subscriptionService.create(userId, pkg, screenshotPath));
    }

    @GetMapping("/my")
    public ResponseEntity<SubscriptionResponse> getMySubscription() {
        UUID userId = userService.getCurrentUserId();
        SubscriptionResponse response = subscriptionService.getMySubscription(userId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionService.getById(id));
    }

    private String saveFile(MultipartFile file, String subDir) throws IOException {
        String uploadDir = System.getProperty("user.dir") + "/uploads/" + subDir;
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        return "/uploads/" + subDir + "/" + fileName;
    }
}
