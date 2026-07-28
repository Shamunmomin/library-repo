package com.lab.library.repository;

import com.lab.library.entity.MemberPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MemberPaymentRepository extends JpaRepository<MemberPayment, UUID> {
    List<MemberPayment> findByMemberIdOrderByPaymentDateDesc(UUID memberId);
}
