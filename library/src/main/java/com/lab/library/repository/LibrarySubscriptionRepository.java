package com.lab.library.repository;

import com.lab.library.entity.LibrarySubscription;
import com.lab.library.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LibrarySubscriptionRepository extends JpaRepository<LibrarySubscription, UUID> {

    Optional<LibrarySubscription> findByLibraryIdAndStatus(UUID libraryId, SubscriptionStatus status);

    List<LibrarySubscription> findByEndDateBeforeAndStatus(LocalDate date, SubscriptionStatus status);

    @Modifying
    @Query("UPDATE LibrarySubscription ls SET ls.status = :newStatus WHERE ls.endDate < :today AND ls.status = :currentStatus")
    int expireSubscriptions(LocalDate today, SubscriptionStatus currentStatus, SubscriptionStatus newStatus);
}
