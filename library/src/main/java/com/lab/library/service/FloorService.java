package com.lab.library.service;

import com.lab.library.dto.response.FloorResponse;
import com.lab.library.entity.Floor;
import com.lab.library.entity.Library;
import com.lab.library.entity.Seat;
import com.lab.library.entity.User;
import com.lab.library.enums.AllocationStatus;
import com.lab.library.enums.SubscriptionPackage;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.mapper.FloorMapper;
import com.lab.library.repository.FloorRepository;
import com.lab.library.repository.SeatAllocationRepository;
import com.lab.library.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FloorService {

    private final FloorRepository floorRepository;
    private final SeatRepository seatRepository;
    private final SeatAllocationRepository seatAllocationRepository;
    private final UserService userService;
    private final LibraryService libraryService;
    private final SubscriptionService subscriptionService;
    private final FloorMapper floorMapper;

    public Floor getFloorEntity(UUID floorId) {
        return floorRepository.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor", "id", floorId));
    }

    @Transactional
    public FloorResponse create(UUID userId, String name, String description) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);

        SubscriptionPackage pkg = subscriptionService.getUserActivePackage(userId);
        if (pkg == null) {
            throw new BadRequestException("No active subscription found");
        }

        long currentFloors = floorRepository.countByLibrary(library);
        if (pkg == SubscriptionPackage.BASE && currentFloors >= 1) {
            throw new BadRequestException("Base plan allows only 1 floor");
        }

        Floor floor = Floor.builder()
                .library(library)
                .name(name)
                .description(description)
                .build();

        floor = floorRepository.save(floor);
        log.info("Floor created: {} for library: {}", floor.getName(), library.getName());
        return floorMapper.toResponse(floor);
    }

    @Transactional
    public FloorResponse update(UUID floorId, String name, String description) {
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor", "id", floorId));

        floor.setName(name);
        floor.setDescription(description);
        floor = floorRepository.save(floor);
        log.info("Floor updated: {}", floor.getName());
        return floorMapper.toResponse(floor);
    }

    @Transactional
    public void delete(UUID floorId) {
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found", "id", floorId));

        List<Seat> seats = seatRepository.findByFloor(floor);

        for (Seat seat : seats) {
            if (seatAllocationRepository.existsBySeatAndStatus(seat, AllocationStatus.ACTIVE)) {
                throw new BadRequestException(
                        "Cannot delete floor '" + floor.getName() + "': seat " + seat.getSeatNumber()
                                + " has an active allocation"
                );
            }
        }

        if (!seats.isEmpty()) {
            List<UUID> seatIds = seats.stream().map(Seat::getId).toList();
            seatAllocationRepository.deleteBySeatIds(seatIds);
            seatRepository.deleteAll(seats);
        }

        floorRepository.delete(floor);
        log.info("Floor deleted: {} along with {} seats", floor.getName(), seats.size());
    }

    public List<FloorResponse> getByLibrary(UUID userId) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);

        return floorRepository.findByLibraryOrderByCreatedAtAsc(library).stream()
                .map(floor -> {
                    FloorResponse resp = floorMapper.toResponse(floor);
                    long count = seatRepository.countByFloor(floor);
                    return FloorResponse.builder()
                            .id(resp.getId())
                            .libraryId(resp.getLibraryId())
                            .name(resp.getName())
                            .description(resp.getDescription())
                            .seatCount(count)
                            .createdAt(resp.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public FloorResponse getById(UUID floorId) {
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor", "id", floorId));
        FloorResponse resp = floorMapper.toResponse(floor);
        long count = seatRepository.countByFloor(floor);
        return FloorResponse.builder()
                .id(resp.getId())
                .libraryId(resp.getLibraryId())
                .name(resp.getName())
                .description(resp.getDescription())
                .seatCount(count)
                .createdAt(resp.getCreatedAt())
                .build();
    }
}
