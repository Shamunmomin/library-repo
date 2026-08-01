package com.lab.library.controller;

import com.lab.library.dto.StoredImage;
import com.lab.library.dto.response.SubscriptionResponse;
import com.lab.library.enums.SubscriptionPackage;
import com.lab.library.service.ImageStorageService;
import com.lab.library.service.SubscriptionEventService;
import com.lab.library.service.SubscriptionService;
import com.lab.library.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserService userService;
    private final ImageStorageService imageStorageService;
    private final SubscriptionEventService subscriptionEventService;

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEvents() {
        UUID userId = userService.getCurrentUserId();
        return subscriptionEventService.subscribe(userId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubscriptionResponse> create(
            @RequestParam("packageType") String packageType,
            @RequestParam("screenshot") MultipartFile screenshot) throws IOException {

        UUID userId = userService.getCurrentUserId();
        StoredImage storedScreenshot = imageStorageService.save(screenshot, "subscriptions");
        SubscriptionPackage pkg = SubscriptionPackage.valueOf(packageType.toUpperCase());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subscriptionService.create(userId, pkg, storedScreenshot));
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

    @GetMapping("/{id}/screenshot")
    public ResponseEntity<byte[]> getScreenshot(@PathVariable UUID id) {
        StoredImage image = subscriptionService.getSubscriptionScreenshot(id);
        return buildImageResponse(image);
    }

    private ResponseEntity<byte[]> buildImageResponse(StoredImage image) {
        if (image == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.contentType()))
                .cacheControl(CacheControl.noCache())
                .body(image.data());
    }
}
