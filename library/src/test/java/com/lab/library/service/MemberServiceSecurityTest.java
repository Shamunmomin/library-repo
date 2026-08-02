package com.lab.library.service;

import com.lab.library.entity.Library;
import com.lab.library.entity.Member;
import com.lab.library.entity.User;
import com.lab.library.enums.FeeStatus;
import com.lab.library.exception.UnauthorizedException;
import com.lab.library.mapper.MemberMapper;
import com.lab.library.repository.MemberPaymentRepository;
import com.lab.library.repository.MemberRepository;
import com.lab.library.repository.SeatAllocationRepository;
import com.lab.library.service.policy.MemberFeePolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MemberServiceSecurityTest {

    @Mock
    private MemberRepository memberRepository;
    @Mock
    private MemberPaymentRepository memberPaymentRepository;
    @Mock
    private SeatAllocationRepository seatAllocationRepository;
    @Mock
    private UserService userService;
    @Mock
    private LibraryService libraryService;
    @Mock
    private MemberMapper memberMapper;
    @Mock
    private ImageStorageService imageStorageService;
    @Mock
    private SeatService seatService;
    @Mock
    private MemberFeePolicy memberFeePolicy;

    @InjectMocks
    private MemberService memberService;

    private UUID ownerId;
    private UUID otherOwnerId;
    private Member member;

    @BeforeEach
    void setUp() {
        ownerId = UUID.randomUUID();
        otherOwnerId = UUID.randomUUID();

        User owner = User.builder().id(ownerId).build();
        User other = User.builder().id(otherOwnerId).build();
        Library library = Library.builder().user(owner).build();

        member = Member.builder()
                .id(UUID.randomUUID())
                .library(library)
                .name("member")
                .feeStatus(FeeStatus.UNPAID)
                .joinDate(LocalDate.now())
                .build();
    }

    @Test
    void update_deniesCrossLibraryAccess() {
        when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));

        assertThrows(UnauthorizedException.class,
                () -> memberService.update(otherOwnerId, member.getId(), "x", null, null, null, null, null));
        verify(memberRepository, never()).save(any());
    }

    @Test
    void delete_deniesCrossLibraryAccess() {
        when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));

        assertThrows(UnauthorizedException.class, () -> memberService.delete(member.getId(), otherOwnerId));
        verify(memberRepository, never()).save(any());
    }

    @Test
    void recordPayment_deniesCrossLibraryAccess() {
        when(memberRepository.findByIdForUpdate(member.getId())).thenReturn(Optional.of(member));

        assertThrows(UnauthorizedException.class,
                () -> memberService.recordPayment(otherOwnerId, member.getId(), null, null, null, null, null));
        verify(memberPaymentRepository, never()).save(any());
    }

    @Test
    void getMemberPayments_deniesCrossLibraryAccess() {
        when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));

        assertThrows(UnauthorizedException.class, () -> memberService.getMemberPayments(otherOwnerId, member.getId()));
    }
}
