package com.lab.library.controller;

import com.lab.library.dto.response.OwnerDashboardStatsResponse;
import com.lab.library.service.DashboardService;
import com.lab.library.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    @GetMapping("/owner/stats")
    @PreAuthorize("hasAuthority('OWNER')")
    public ResponseEntity<OwnerDashboardStatsResponse> getOwnerStats() {
        OwnerDashboardStatsResponse stats = dashboardService.getOwnerStats(userService.getCurrentUserId());
        return ResponseEntity.ok(stats);
    }
}
