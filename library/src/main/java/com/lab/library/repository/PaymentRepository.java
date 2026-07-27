package com.lab.library.repository;

import com.lab.library.entity.Payment;
import com.lab.library.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findAllByOrderByCreatedAtDesc();
    List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);
    List<Payment> findByPaymentDateBetweenOrderByPaymentDateDesc(LocalDateTime start, LocalDateTime end);
    long countByStatus(PaymentStatus status);
}
