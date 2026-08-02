package com.lab.library.service.policy;

import com.lab.library.entity.Member;
import com.lab.library.enums.FeeStatus;

import java.time.LocalDate;

public interface MemberFeePolicy {

    boolean isExpired(Member member, LocalDate now);

    boolean isReminderDue(LocalDate paidUpTo, LocalDate now, int daysBefore);

    FeeStatus resolveEffectiveStatus(Member member, LocalDate now);

    LocalDate resolveBillingBase(Member member);
}
