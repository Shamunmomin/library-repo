package com.lab.library.repository;

import com.lab.library.entity.Floor;
import com.lab.library.entity.Library;
import com.lab.library.entity.Seat;
import com.lab.library.enums.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SeatRepository extends JpaRepository<Seat, UUID> {
    List<Seat> findByFloorOrderBySeatNumberAsc(Floor floor);
    long countByFloor(Floor floor);
    long countByFloorAndStatus(Floor floor, SeatStatus status);
    boolean existsByFloorAndSeatNumber(Floor floor, String seatNumber);
    long countAllByFloorLibrary(Library library);
    long countAllByFloorLibraryAndStatus(Library library, SeatStatus status);
}
