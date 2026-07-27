package com.lab.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardStatsResponse {
    private long totalSeats;
    private long occupiedSeats;
    private long availableSeats;
    private long activeMembers;
    private long pendingDues;
    private BigDecimal monthlyRevenue;
    private List<SeatAllocationResponse> recentAllocations;
}
