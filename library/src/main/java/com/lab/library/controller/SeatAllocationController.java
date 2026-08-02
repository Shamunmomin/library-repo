package com.lab.library.controller;

import com.lab.library.dto.request.AllocateSeatRequest;
import com.lab.library.dto.response.SeatAllocationResponse;
import com.lab.library.service.SeatAllocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/allocations")
@RequiredArgsConstructor
public class SeatAllocationController {

    private final SeatAllocationService seatAllocationService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<SeatAllocationResponse> allocate(@Valid @RequestBody AllocateSeatRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(seatAllocationService.allocate(
                        request.getSeatId(),
                        request.getMemberId(),
                        request.getStartDate(),
                        request.getEndDate()));
    }

    @PutMapping("/{id}/end")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<SeatAllocationResponse> endAllocation(@PathVariable UUID id) {
        return ResponseEntity.ok(seatAllocationService.endAllocation(id));
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<SeatAllocationResponse>> getActiveAllocationsByUserIdAndLibrary() {

        return ResponseEntity.ok(seatAllocationService.getActiveAllocations());
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<SeatAllocationResponse>> getMemberHistory(@PathVariable UUID memberId) {
        return ResponseEntity.ok(seatAllocationService.getMemberHistory(memberId));
    }
}
