package com.lab.library.service.policy;

import com.lab.library.entity.Member;
import com.lab.library.enums.FeeStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class DerivedMemberFeePolicyTest {

    private DerivedMemberFeePolicy policy;

    @BeforeEach
    void setUp() {
        policy = new DerivedMemberFeePolicy();
    }

    private Member memberWith(LocalDate paidUpTo, FeeStatus storedStatus) {
        return Member.builder()
                .paidUpTo(paidUpTo)
                .feeStatus(storedStatus)
                .build();
    }

    @Test
    void resolveEffectiveStatus_isUnpaidWhenNoCoverage() {
        LocalDate now = LocalDate.of(2026, 8, 1);
        assertEquals(FeeStatus.UNPAID, policy.resolveEffectiveStatus(memberWith(null, FeeStatus.UNPAID), now));
    }

    @Test
    void resolveEffectiveStatus_isPaidWhileCovered() {
        LocalDate now = LocalDate.of(2026, 8, 1);
        assertEquals(FeeStatus.PAID, policy.resolveEffectiveStatus(memberWith(now, FeeStatus.PAID), now));
        assertEquals(FeeStatus.PAID, policy.resolveEffectiveStatus(memberWith(now.plusDays(10), FeeStatus.PAID), now));
    }

    @Test
    void resolveEffectiveStatus_isExpiredWhenCoverageLapsed() {
        LocalDate now = LocalDate.of(2026, 8, 1);
        assertEquals(FeeStatus.EXPIRED, policy.resolveEffectiveStatus(memberWith(now.minusDays(1), FeeStatus.PAID), now));
        assertEquals(FeeStatus.EXPIRED, policy.resolveEffectiveStatus(memberWith(now.minusDays(1), FeeStatus.PARTIAL), now));
    }

    @Test
    void resolveEffectiveStatus_keepsPartialWhileCovered() {
        LocalDate now = LocalDate.of(2026, 8, 1);
        assertEquals(FeeStatus.PARTIAL, policy.resolveEffectiveStatus(memberWith(now.plusDays(5), FeeStatus.PARTIAL), now));
    }

    @Test
    void isExpired_respectsBoundary() {
        LocalDate now = LocalDate.of(2026, 8, 1);
        assertTrue(policy.isExpired(memberWith(now.minusDays(1), FeeStatus.PAID), now));
        assertFalse(policy.isExpired(memberWith(now, FeeStatus.PAID), now));
        assertFalse(policy.isExpired(memberWith(null, FeeStatus.UNPAID), now));
    }

    @Test
    void isReminderDue_firesOnlyInItsOwnDayWindow() {
        LocalDate paidUpTo = LocalDate.of(2026, 8, 10);

        assertTrue(policy.isReminderDue(paidUpTo, paidUpTo.minusDays(3).plusDays(1), 3));
        assertFalse(policy.isReminderDue(paidUpTo, paidUpTo.minusDays(3), 3));
        assertFalse(policy.isReminderDue(paidUpTo, paidUpTo.minusDays(1), 3));

        assertTrue(policy.isReminderDue(paidUpTo, paidUpTo.minusDays(1).plusDays(1), 1));
        assertFalse(policy.isReminderDue(paidUpTo, paidUpTo.minusDays(1), 1));
        assertFalse(policy.isReminderDue(paidUpTo, paidUpTo.plusDays(1), 1));
    }

    @Test
    void resolveBillingBase_anchorsFirstPaymentToJoinDateNotPaymentDate() {
        Member member = memberWith(null, FeeStatus.UNPAID);
        member.setJoinDate(LocalDate.of(2026, 8, 1));

        assertEquals(LocalDate.of(2026, 8, 1), policy.resolveBillingBase(member));
    }

    @Test
    void resolveBillingBase_resumesFromExistingPaidUpToAfterGap() {
        Member member = memberWith(LocalDate.of(2026, 5, 1), FeeStatus.EXPIRED);
        member.setJoinDate(LocalDate.of(2026, 1, 1));

        assertEquals(LocalDate.of(2026, 5, 1), policy.resolveBillingBase(member));
    }

    @Test
    void resolveBillingBase_keepsPrepaidCoverageBoundary() {
        Member member = memberWith(LocalDate.of(2026, 9, 20), FeeStatus.PAID);
        member.setJoinDate(LocalDate.of(2026, 8, 1));

        assertEquals(LocalDate.of(2026, 9, 20), policy.resolveBillingBase(member));
    }

    @Test
    void resolveBillingBase_fallsBackToNowWhenJoinDateMissing() {
        Member member = Member.builder().feeStatus(FeeStatus.UNPAID).build();

        assertEquals(LocalDate.now(), policy.resolveBillingBase(member));
    }
}
