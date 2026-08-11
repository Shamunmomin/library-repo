package com.lab.library.service;

import com.lab.library.dto.response.*;
import com.lab.library.entity.*;
import com.lab.library.enums.*;
import com.lab.library.mapper.LibraryMapper;
import com.lab.library.mapper.SubscriptionMapper;
import com.lab.library.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final LibraryRepository libraryRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final SeatRepository seatRepository;
    private final FloorRepository floorRepository;
    private final LibraryMapper libraryMapper;
    private final SubscriptionMapper subscriptionMapper;

    public AdminDashboardStatsResponse getDashboardStats() {
        long totalLibraries = libraryRepository.count();
        long activeSubscriptions = subscriptionRepository.countByStatus(SubscriptionStatus.ACTIVE);
        long expiredSubscriptions = subscriptionRepository.countByStatus(SubscriptionStatus.EXPIRED);
        long totalOwners = userRepository.countByRole(Role.OWNER);
        long pendingRequests = subscriptionRepository.countByStatus(SubscriptionStatus.PENDING);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        List<Payment> completedPayments = paymentRepository.findByStatusOrderByCreatedAtDesc(PaymentStatus.COMPLETED);
        for (Payment p : completedPayments) {
            if (p.getAmount() != null) {
                totalRevenue = totalRevenue.add(p.getAmount());
            }
        }

        log.info("Admin dashboard stats fetched");
        return AdminDashboardStatsResponse.builder()
                .totalLibraries(totalLibraries)
                .activeSubscriptions(activeSubscriptions)
                .expiredSubscriptions(expiredSubscriptions)
                .totalOwners(totalOwners)
                .totalRevenue(totalRevenue)
                .pendingRequests(pendingRequests)
                .build();
    }

    public List<LibraryDetailResponse> getAllLibrariesWithDetails(String filter) {
        List<Library> libraries = libraryRepository.findAllByOrderByCreatedAtDesc();

        return libraries.stream()
                .map(lib -> {
                    Subscription sub = subscriptionRepository.findTopByUserOrderByCreatedAtDesc(lib.getUser()).orElse(null);
                    boolean include = true;
                    if ("active".equals(filter)) include = sub != null && sub.getStatus() == SubscriptionStatus.ACTIVE;
                    else if ("expired".equals(filter)) include = sub == null || sub.getStatus() != SubscriptionStatus.ACTIVE;

                    if (!include) return null;

                    return buildLibraryDetail(lib, sub);
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public LibraryDetailResponse getLibraryDetail(UUID id) {
        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new com.lab.library.exception.ResourceNotFoundException("Library", "id", id));
        Subscription sub = subscriptionRepository.findTopByUserOrderByCreatedAtDesc(library.getUser()).orElse(null);
        return buildLibraryDetail(library, sub);
    }

    private LibraryDetailResponse buildLibraryDetail(Library library, Subscription sub) {
        List<Floor> floors = floorRepository.findByLibraryOrderByCreatedAtAsc(library);
        int floorCount = floors.size();
        long totalSeats = 0;
        long occupiedSeats = 0;
        for (Floor f : floors) {
            totalSeats += seatRepository.countByFloor(f);
            occupiedSeats += seatRepository.countByFloorAndStatus(f, SeatStatus.OCCUPIED);
        }

        return LibraryDetailResponse.builder()
                .id(library.getId())
                .userId(library.getUser().getId())
                .ownerName(library.getUser().getName())
                .ownerEmail(library.getUser().getEmail())
                .ownerPhone(library.getUser().getPhone())
                .name(library.getName())
                .address(library.getAddress())
                .phone(library.getPhone())
                .icon(library.getIconData() != null || library.getIcon() != null
                        ? "/api/libraries/" + library.getId() + "/icon" : null)
                .subscriptionPackage(sub != null ? sub.getPackageType().name() : "NONE")
                .subscriptionStatus(sub != null ? sub.getStatus().name() : "NONE")
                .floorCount(floorCount)
                .totalSeats(totalSeats)
                .occupiedSeats(occupiedSeats)
                .createdAt(library.getCreatedAt())
                .build();
    }

    public List<User> getAllOwners() {
        return userRepository.findByRoleOrderByNameAsc(Role.OWNER);
    }

    public List<Payment> getAllPayments(String status, String startDate, String endDate) {
        PaymentStatus paymentStatus = null;
        if (status != null && !status.isBlank()) {
            paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
        }

        LocalDateTime start = null;
        LocalDateTime end = null;
        if (startDate != null && endDate != null) {
            start = LocalDate.parse(startDate).atStartOfDay();
            end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
        }

        if (paymentStatus != null && start != null && end != null) {
            return paymentRepository.findByStatusAndPaymentDateBetweenOrderByPaymentDateDesc(paymentStatus, start, end);
        }
        if (paymentStatus != null) {
            return paymentRepository.findByStatusOrderByCreatedAtDesc(paymentStatus);
        }
        if (start != null && end != null) {
            return paymentRepository.findByPaymentDateBetweenOrderByPaymentDateDesc(start, end);
        }
        return paymentRepository.findAllByOrderByCreatedAtDesc();
    }

}
