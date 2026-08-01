package com.lab.library.controller;

import com.lab.library.dto.StoredImage;
import com.lab.library.dto.response.MemberPaymentResponse;
import com.lab.library.dto.response.MemberResponse;
import com.lab.library.dto.response.PageResponse;
import com.lab.library.enums.FeeStatus;
import com.lab.library.service.ImageStorageService;
import com.lab.library.service.MemberService;
import com.lab.library.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class MemberController {

    private final MemberService memberService;
    private final UserService userService;
    private final ImageStorageService imageStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MemberResponse> create(
            @RequestParam("name") String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam("phone") String phone,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "feeAmount", required = false) BigDecimal feeAmount,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "joinDate", required = true) String joinDate) throws IOException {

        UUID userId = userService.getCurrentUserId();
        StoredImage storedPhoto = photo != null ? imageStorageService.save(photo, "photos") : null;

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(memberService.create(userId, name, email, phone, address, feeAmount, storedPhoto, joinDate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberResponse> update(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {

        return ResponseEntity.ok(memberService.update(
                id,
                (String) body.get("name"),
                (String) body.get("email"),
                (String) body.get("phone"),
                (String) body.get("address"),
                body.get("feeAmount") != null ? new BigDecimal(body.get("feeAmount").toString()) : null
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        memberService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable UUID id) {
        StoredImage image = memberService.getMemberPhoto(id);
        return buildImageResponse(image);
    }


    @GetMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<PageResponse<MemberResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) FeeStatus feeStatus) {
        UUID userId = userService.getCurrentUserId();
        return ResponseEntity.ok(memberService.getByLibraryPaginated(userId, search, feeStatus, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(memberService.getById(id));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<MemberResponse>> getByFeeStatus(@RequestParam("feeStatus") String feeStatus) {
        UUID userId = userService.getCurrentUserId();
        return ResponseEntity.ok(memberService.getByFeeStatus(userId, FeeStatus.valueOf(feeStatus.toUpperCase())));
    }

    @PutMapping("/{id}/mark-paid")
    public ResponseEntity<MemberResponse> markFeePaid(@PathVariable UUID id) {
        return ResponseEntity.ok(memberService.markFeePaid(id));
    }

    @GetMapping("/fee-expired")
    public ResponseEntity<List<MemberResponse>> getFeeExpired() {
        UUID userId = userService.getCurrentUserId();
        return ResponseEntity.ok(memberService.getExpiredFeeMembers(userId));
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<List<MemberPaymentResponse>> getMemberPayments(@PathVariable UUID id) {
        return ResponseEntity.ok(memberService.getMemberPayments(id));
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
