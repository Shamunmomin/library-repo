package com.lab.library.repository;

import com.lab.library.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    List<SubscriptionPlan> findByActiveTrue();

    Optional<SubscriptionPlan> findByPlanTypeAndActiveTrue(String planType);
}
