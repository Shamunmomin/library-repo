package com.lab.library.service;

import com.lab.library.dto.response.SeatResponse;
import com.lab.library.entity.Floor;
import com.lab.library.entity.Library;
import com.lab.library.entity.Seat;
import com.lab.library.entity.User;
import com.lab.library.enums.SeatStatus;
import com.lab.library.enums.SubscriptionPackage;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.mapper.SeatMapper;
import com.lab.library.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final UserService userService;
    private final FloorService floorService;
    private final SubscriptionService subscriptionService;
    private final SeatMapper seatMapper;

    @Transactional
    public List<SeatResponse> createBulk(UUID userId, UUID floorId, List<String> seatNumbers) {
        User user = userService.getById(userId);
        Floor floor = floorService.getFloorEntity(floorId);
        Library library = floor.getLibrary();

        SubscriptionPackage pkg = subscriptionService.getUserActivePackage(userId);
        if (pkg == null) {
            throw new BadRequestException("No active subscription found");
        }

        long totalSeats = seatRepository.countAllByFloorLibrary(library);
        if (pkg == SubscriptionPackage.BASE && (totalSeats + seatNumbers.size()) > 100) {
            throw new BadRequestException("Base plan allows max 100 seats");
        }

        List<Seat> saved = new ArrayList<>();
        for (String seatNum : seatNumbers) {
            if (seatRepository.existsByFloorAndSeatNumber(floor, seatNum)) {
                throw new BadRequestException("Seat " + seatNum + " already exists");
            }
            Seat seat = Seat.builder()
                    .floor(floor)
                    .seatNumber(seatNum)
                    .status(SeatStatus.AVAILABLE)
                    .build();
            saved.add(seatRepository.save(seat));
        }

        log.info("Created {} seats for floor: {}", saved.size(), floor.getName());
        return saved.stream().map(seatMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public SeatResponse create(UUID userId, UUID floorId, String seatNumber) {
        return createBulk(userId, floorId, List.of(seatNumber)).get(0);
    }

    public Seat getSeatEntity(UUID seatId) {
        return seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));
    }

    @Transactional
    public void updateStatus(UUID seatId, SeatStatus status) {
        Seat seat = getSeatEntity(seatId);
        seat.setStatus(status);
        seatRepository.save(seat);
        log.info("Seat {} status updated to: {}", seat.getSeatNumber(), status);
    }

    @Transactional
    public SeatResponse update(UUID seatId, String seatNumber, SeatStatus status) {
        Seat seat = getSeatEntity(seatId);

        if (seatNumber != null) seat.setSeatNumber(seatNumber);
        if (status != null) seat.setStatus(status);

        seat = seatRepository.save(seat);
        log.info("Seat updated: {} status: {}", seat.getSeatNumber(), seat.getStatus());
        return seatMapper.toResponse(seat);
    }

    @Transactional
    public void delete(UUID seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));
        seatRepository.delete(seat);
        log.info("Seat deleted: {}", seat.getSeatNumber());
    }

    public List<SeatResponse> getByFloor(UUID floorId) {
        Floor floor = floorService.getFloorEntity(floorId);
        return seatRepository.findByFloorOrderBySeatNumberAsc(floor).stream()
                .map(seatMapper::toResponse)
                .collect(Collectors.toList());
    }
}
