package com.lab.library.repository;

import com.lab.library.entity.Subscription;
import com.lab.library.entity.User;
import com.lab.library.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findTopByUserOrderByCreatedAtDesc(User user);
    List<Subscription> findByStatus(SubscriptionStatus status);
    List<Subscription> findAllByOrderByCreatedAtDesc();
    boolean existsByUserAndStatus(User user, SubscriptionStatus status);
    long countByStatus(SubscriptionStatus status);

    List<Subscription> findByScreenshotDataIsNullAndPaymentScreenshotIsNotNull();
}
