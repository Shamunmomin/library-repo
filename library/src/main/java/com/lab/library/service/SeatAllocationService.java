package com.lab.library.service;

import com.lab.library.dto.response.SeatAllocationResponse;
import com.lab.library.entity.Member;
import com.lab.library.entity.Seat;
import com.lab.library.entity.SeatAllocation;
import com.lab.library.enums.AllocationStatus;
import com.lab.library.enums.SeatStatus;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.mapper.SeatAllocationMapper;
import com.lab.library.repository.SeatAllocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatAllocationService {

    private final SeatAllocationRepository seatAllocationRepository;
    private final SeatService seatService;
    private final MemberService memberService;
    private final SeatAllocationMapper allocationMapper;

    @Transactional
    public SeatAllocationResponse allocate(UUID seatId, UUID memberId, LocalDateTime startDate, LocalDateTime endDate) {
        Seat seat = seatService.getSeatEntity(seatId);
        Member member = memberService.getMemberEntity(memberId);

        if (seat.getStatus() != SeatStatus.AVAILABLE) {
            throw new BadRequestException("Seat " + seat.getSeatNumber() + " is not available");
        }

        boolean alreadyAllocated = seatAllocationRepository.existsBySeatAndStatus(seat, AllocationStatus.ACTIVE);
        if (alreadyAllocated) {
            throw new BadRequestException("Seat " + seat.getSeatNumber() + " already has an active allocation");
        }

        SeatAllocation allocation = SeatAllocation.builder()
                .seat(seat)
                .member(member)
                .startDate(startDate != null ? startDate : LocalDateTime.now())
                .endDate(endDate)
                .status(AllocationStatus.ACTIVE)
                .build();

        allocation = seatAllocationRepository.save(allocation);
        seatService.updateStatus(seatId, SeatStatus.OCCUPIED);

        log.info("Seat {} allocated to member {}", seat.getSeatNumber(), member.getName());
        return allocationMapper.toResponse(allocation);
    }

    @Transactional
    public SeatAllocationResponse endAllocation(UUID allocationId) {
        SeatAllocation allocation = seatAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("SeatAllocation", "id", allocationId));

        if (allocation.getStatus() != AllocationStatus.ACTIVE) {
            throw new BadRequestException("Allocation is not active");
        }

        allocation.setStatus(AllocationStatus.EXPIRED);
        allocation.setEndDate(LocalDateTime.now());
        allocation = seatAllocationRepository.save(allocation);

        seatService.updateStatus(allocation.getSeat().getId(), SeatStatus.AVAILABLE);

        log.info("Allocation ended for seat {}", allocation.getSeat().getSeatNumber());
        return allocationMapper.toResponse(allocation);
    }

    public List<SeatAllocationResponse> getActiveAllocations() {
        return seatAllocationRepository.findByStatusOrderByCreatedAtDesc(AllocationStatus.ACTIVE).stream()
                .map(allocationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<SeatAllocationResponse> getMemberHistory(UUID memberId) {
        Member member = memberService.getMemberEntity(memberId);
        return seatAllocationRepository.findByMemberOrderByCreatedAtDesc(member).stream()
                .map(allocationMapper::toResponse)
                .collect(Collectors.toList());
    }
}
