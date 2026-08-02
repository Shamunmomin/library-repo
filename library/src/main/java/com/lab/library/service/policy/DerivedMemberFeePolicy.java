package com.lab.library.service.policy;

import com.lab.library.entity.Member;
import com.lab.library.enums.FeeStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DerivedMemberFeePolicy implements MemberFeePolicy {

    @Override
    public boolean isExpired(Member member, LocalDate now) {
        return member.getPaidUpTo() != null && member.getPaidUpTo().isBefore(now);
    }

    @Override
    public boolean isReminderDue(LocalDate paidUpTo, LocalDate now, int daysBefore) {
        if (paidUpTo == null || daysBefore <= 0) {
            return false;
        }
        return now.isAfter(paidUpTo.minusDays(daysBefore))
                && !now.isAfter(paidUpTo.minusDays(daysBefore - 1));
    }

    @Override
    public FeeStatus resolveEffectiveStatus(Member member, LocalDate now) {
        if (member.getPaidUpTo() == null) {
            return FeeStatus.UNPAID;
        }
        if (member.getPaidUpTo().isBefore(now)) {
            return FeeStatus.EXPIRED;
        }
        if (member.getFeeStatus() == FeeStatus.PARTIAL) {
            return FeeStatus.PARTIAL;
        }
        return FeeStatus.PAID;
    }

    @Override
    public LocalDate resolveBillingBase(Member member) {
        if (member.getPaidUpTo() != null) {
            return member.getPaidUpTo();
        }
        if (member.getJoinDate() != null) {
            return member.getJoinDate();
        }
        return LocalDate.now();
    }
}
