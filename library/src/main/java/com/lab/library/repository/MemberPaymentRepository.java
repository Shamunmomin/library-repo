package com.lab.library.repository;

import com.lab.library.entity.MemberPayment;
import com.lab.library.enums.MemberPaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MemberPaymentRepository extends JpaRepository<MemberPayment, UUID> {
    List<MemberPayment> findByMemberIdOrderByPaymentDateDesc(UUID memberId);

    List<MemberPayment> findByMemberIdAndStatusOrderByPaymentDateDesc(UUID memberId, MemberPaymentStatus status);

    long countByMemberId(UUID memberId);

    @Query("SELECT MAX(p.paidUpTo) FROM MemberPayment p WHERE p.member.id = :memberId AND p.status = :status")
    LocalDate findMaxPaidUpToByMemberIdAndStatus(@Param("memberId") UUID memberId, @Param("status") MemberPaymentStatus status);
}
