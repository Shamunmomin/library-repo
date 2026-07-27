package com.lab.library.controller;

import com.lab.library.dto.response.MemberResponse;
import com.lab.library.enums.FeeStatus;
import com.lab.library.service.MemberService;
import com.lab.library.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final UserService userService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MemberResponse> create(
            @RequestParam("name") String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam("phone") String phone,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "feeAmount", required = false) BigDecimal feeAmount,
            @RequestParam(value = "photo", required = false) MultipartFile photo) throws IOException {

        UUID userId = userService.getCurrentUserId();
        String photoPath = photo != null ? saveFile(photo, "photos") : null;

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(memberService.create(userId, name, email, phone, address, feeAmount, photoPath));
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

    @GetMapping
    public ResponseEntity<List<MemberResponse>> getAll() {
        UUID userId = userService.getCurrentUserId();
        return ResponseEntity.ok(memberService.getByLibrary(userId));
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
