package com.lab.library.repository;

import com.lab.library.entity.Library;
import com.lab.library.entity.Member;
import com.lab.library.entity.Seat;
import com.lab.library.entity.SeatAllocation;
import com.lab.library.enums.AllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeatAllocationRepository extends JpaRepository<SeatAllocation, UUID> {
    List<SeatAllocation> findByMemberOrderByCreatedAtDesc(Member member);
    boolean existsBySeatAndStatus(Seat seat, AllocationStatus status);
    boolean existsByMemberIdAndStatus(UUID memberId, AllocationStatus status);

    @Query("SELECT sa FROM SeatAllocation sa WHERE sa.seat.floor.library = :library AND sa.status = :status ORDER BY sa.createdAt DESC")
    List<SeatAllocation> findByLibraryAndStatus(@Param("library") Library library, @Param("status") AllocationStatus status);

    @Modifying
    @Query("DELETE FROM SeatAllocation sa WHERE sa.seat.id IN :seatIds")
    void deleteBySeatIds(@Param("seatIds") List<UUID> seatIds);
}
