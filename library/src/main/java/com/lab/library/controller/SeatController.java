package com.lab.library.controller;

import com.lab.library.dto.response.SeatResponse;
import com.lab.library.enums.SeatStatus;
import com.lab.library.service.SeatService;
import com.lab.library.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;
    private final UserService userService;

    @PostMapping("/bulk")
    public ResponseEntity<List<SeatResponse>> createBulk(@RequestBody Map<String, Object> body) {
        UUID userId = userService.getCurrentUserId();
        UUID floorId = UUID.fromString((String) body.get("floorId"));
        @SuppressWarnings("unchecked")
        List<String> seatNumbers = (List<String>) body.get("seatNumbers");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(seatService.createBulk(userId, floorId, seatNumbers));
    }

    @PostMapping
    public ResponseEntity<SeatResponse> create(@RequestBody Map<String, String> body) {
        UUID userId = userService.getCurrentUserId();
        UUID floorId = UUID.fromString(body.get("floorId"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(seatService.create(userId, floorId, body.get("seatNumber")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SeatResponse> update(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String seatNumber = body.get("seatNumber");
        String statusStr = body.get("status");
        SeatStatus status = statusStr != null ? SeatStatus.valueOf(statusStr.toUpperCase()) : null;
        return ResponseEntity.ok(seatService.update(id, seatNumber, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        seatService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/floor/{floorId}")
    public ResponseEntity<List<SeatResponse>> getByFloor(@PathVariable UUID floorId) {
        return ResponseEntity.ok(seatService.getByFloor(floorId));
    }
}
