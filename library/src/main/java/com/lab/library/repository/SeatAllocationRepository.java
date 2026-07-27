package com.lab.library.repository;

import com.lab.library.entity.Member;
import com.lab.library.entity.Seat;
import com.lab.library.entity.SeatAllocation;
import com.lab.library.enums.AllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeatAllocationRepository extends JpaRepository<SeatAllocation, UUID> {
    List<SeatAllocation> findByStatusOrderByCreatedAtDesc(AllocationStatus status);
    List<SeatAllocation> findByMemberOrderByCreatedAtDesc(Member member);
    Optional<SeatAllocation> findBySeatAndStatus(Seat seat, AllocationStatus status);
    boolean existsBySeatAndStatus(Seat seat, AllocationStatus status);
    long countByStatus(AllocationStatus status);
}
