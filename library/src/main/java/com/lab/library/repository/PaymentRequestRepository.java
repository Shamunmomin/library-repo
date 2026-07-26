package com.lab.library.repository;

import com.lab.library.entity.PaymentRequest;
import com.lab.library.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, UUID> {

    List<PaymentRequest> findByStatusOrderByCreatedAtDesc(PaymentStatus status);

    List<PaymentRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<PaymentRequest> findByLibraryIdOrderByCreatedAtDesc(UUID libraryId);

    boolean existsByUserIdAndStatus(UUID userId, PaymentStatus status);
}
