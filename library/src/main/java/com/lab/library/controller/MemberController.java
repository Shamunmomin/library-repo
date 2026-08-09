package com.lab.library.controller;

import com.lab.library.dto.StoredImage;
import com.lab.library.dto.response.MemberPaymentResponse;
import com.lab.library.dto.response.MemberResponse;
import com.lab.library.dto.response.PageResponse;
import com.lab.library.enums.FeeCycle;
import com.lab.library.enums.FeeStatus;
import com.lab.library.enums.PaymentMethod;
import com.lab.library.exception.BadRequestException;
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
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
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
            @RequestParam(value = "feeCycle", required = false) FeeCycle feeCycle,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "joinDate", required = true) String joinDate) throws IOException {

        UUID userId = userService.getCurrentUserId();
        StoredImage storedPhoto = photo != null ? imageStorageService.save(photo, "photos") : null;

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(memberService.create(userId, name, email, phone, address, feeAmount, feeCycle, storedPhoto, joinDate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberResponse> update(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {

        FeeCycle feeCycle = body.get("feeCycle") != null
                ? parseFeeCycle(body.get("feeCycle").toString())
                : null;

        return ResponseEntity.ok(memberService.update(
                userService.getCurrentUserId(),
                id,
                (String) body.get("name"),
                (String) body.get("email"),
                (String) body.get("phone"),
                (String) body.get("address"),
                body.get("feeAmount") != null ? new BigDecimal(body.get("feeAmount").toString()) : null,
                feeCycle
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        memberService.delete(id, userService.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable UUID id) {
        StoredImage image = memberService.getMemberPhoto(id);
        return buildImageResponse(image);
    }


    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<PageResponse<MemberResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) FeeStatus feeStatus) {
        UUID userId = userService.getCurrentUserId();
        return ResponseEntity.ok(memberService.getByLibraryPaginated(userId, search, feeStatus, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MemberResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(memberService.getById(userService.getCurrentUserId(), id));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<MemberResponse>> getAllByLibrary() {
        return ResponseEntity.ok(memberService.getByLibrary(userService.getCurrentUserId()));
    }

    @GetMapping("/filter")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<MemberResponse>> getByFeeStatus(@RequestParam("feeStatus") String feeStatus) {
        UUID userId = userService.getCurrentUserId();
        return ResponseEntity.ok(memberService.getByFeeStatus(userId, FeeStatus.valueOf(feeStatus.toUpperCase())));
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<MemberResponse>> getAvailableForAllocation() {
        return ResponseEntity.ok(memberService.getAvailableForAllocation(userService.getCurrentUserId()));
    }

    @PostMapping("/{id}/payments")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MemberResponse> recordPayment(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> body) {
        LocalDate payDate = null;
        LocalDate paidUpTo = null;
        PaymentMethod method = null;
        BigDecimal amount = null;
        String remarks = null;

        if (body != null) {
            if (body.get("payDate") != null) {
                payDate = parseDate(body.get("payDate").toString(), "payDate");
            }
            if (body.get("paidUpTo") != null) {
                paidUpTo = parseDate(body.get("paidUpTo").toString(), "paidUpTo");
            }
            if (body.get("method") != null) {
                try {
                    method = PaymentMethod.valueOf(body.get("method").toString().toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new BadRequestException("Invalid payment method");
                }
            }
            if (body.get("amount") != null) {
                amount = new BigDecimal(body.get("amount").toString());
            }
            remarks = body.get("remarks") != null ? body.get("remarks").toString() : null;
        }

        return ResponseEntity.ok(memberService.recordPayment(
                userService.getCurrentUserId(), id, payDate, method, amount, remarks, paidUpTo));
    }

    @PostMapping("/{id}/payments/{paymentId}/void")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<MemberPaymentResponse> voidPayment(
            @PathVariable UUID id,
            @PathVariable UUID paymentId,
            @RequestBody(required = false) Map<String, Object> body) {
        String reason = body != null && body.get("reason") != null ? body.get("reason").toString() : null;
        return ResponseEntity.ok(memberService.voidPayment(userService.getCurrentUserId(), id, paymentId, reason));
    }

    @GetMapping("/fee-expired")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<MemberResponse>> getFeeExpired() {
        UUID userId = userService.getCurrentUserId();
        return ResponseEntity.ok(memberService.getExpiredFeeMembers(userId));
    }

    @GetMapping("/{id}/payments")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<MemberPaymentResponse>> getMemberPayments(@PathVariable UUID id) {
        return ResponseEntity.ok(memberService.getMemberPayments(userService.getCurrentUserId(), id));
    }

    private FeeCycle parseFeeCycle(String value) {
        try {
            return FeeCycle.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid fee cycle. Use MONTHLY, QUARTERLY, HALF_YEARLY or YEARLY");
        }
    }

    private LocalDate parseDate(String value, String field) {
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Invalid " + field + " format. Use YYYY-MM-DD");
        }
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
