package com.lab.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {
    private long totalLibraries;
    private long activeSubscriptions;
    private long expiredSubscriptions;
    private long totalOwners;
    private BigDecimal totalRevenue;
    private long pendingRequests;
}
