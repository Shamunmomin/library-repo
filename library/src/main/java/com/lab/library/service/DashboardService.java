package com.lab.library.service;

import com.lab.library.dto.response.OwnerDashboardStatsResponse;
import com.lab.library.dto.response.SeatAllocationResponse;
import com.lab.library.entity.Library;
import com.lab.library.entity.User;
import com.lab.library.enums.AllocationStatus;
import com.lab.library.enums.FeeStatus;
import com.lab.library.enums.SeatStatus;
import com.lab.library.mapper.SeatAllocationMapper;
import com.lab.library.repository.MemberRepository;
import com.lab.library.repository.SeatAllocationRepository;
import com.lab.library.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserService userService;
    private final LibraryService libraryService;
    private final SeatRepository seatRepository;
    private final MemberRepository memberRepository;
    private final SeatAllocationRepository seatAllocationRepository;
    private final SeatAllocationMapper allocationMapper;

    public OwnerDashboardStatsResponse getOwnerStats(UUID userId) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);

        long totalSeats = seatRepository.countAllByFloorLibrary(library);
        long occupiedSeats = seatRepository.countAllByFloorLibraryAndStatus(library, SeatStatus.OCCUPIED);
        long availableSeats = totalSeats - occupiedSeats;
        long activeMembers = memberRepository.countByLibrary(library);
        long pendingDues = memberRepository.countByLibraryAndFeeStatus(library, FeeStatus.UNPAID)
                + memberRepository.countByLibraryAndFeeStatus(library, FeeStatus.PARTIAL);

        BigDecimal monthlyRevenue = memberRepository.findByLibraryOrderByNameAsc(library).stream()
                .filter(m -> m.getFeeStatus() == FeeStatus.PAID && m.getFeeAmount() != null)
                .map(com.lab.library.entity.Member::getFeeAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<SeatAllocationResponse> recentAllocations = seatAllocationRepository
                .findByLibraryAndStatus(library, AllocationStatus.ACTIVE)
                .stream()
                .limit(5)
                .map(allocationMapper::toResponse)
                .collect(Collectors.toList());

        log.info("Dashboard stats fetched for user: {}", user.getEmail());
        return OwnerDashboardStatsResponse.builder()
                .totalSeats(totalSeats)
                .occupiedSeats(occupiedSeats)
                .availableSeats(availableSeats)
                .activeMembers(activeMembers)
                .pendingDues(pendingDues)
                .monthlyRevenue(monthlyRevenue)
                .recentAllocations(recentAllocations)
                .build();
    }
}
