package com.lab.library.service;

import com.lab.library.dto.response.MemberResponse;
import com.lab.library.entity.Library;
import com.lab.library.entity.Member;
import com.lab.library.entity.User;
import com.lab.library.enums.AllocationStatus;
import com.lab.library.enums.FeeStatus;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.mapper.MemberMapper;
import com.lab.library.repository.MemberRepository;
import com.lab.library.repository.SeatAllocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final SeatAllocationRepository seatAllocationRepository;
    private final UserService userService;
    private final LibraryService libraryService;
    private final MemberMapper memberMapper;

    @Transactional
    public MemberResponse create(UUID userId, String name, String email, String phone,
                                  String address, BigDecimal feeAmount, String photoPath,
                                  String joinDateStr) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);

        LocalDate joinDate =  LocalDate.parse(joinDateStr);

        Member member = Member.builder()
                .library(library)
                .name(name)
                .email(email)
                .phone(phone)
                .address(address)
                .feeAmount(feeAmount)
                .feeStatus(FeeStatus.UNPAID)
                .photo(photoPath)
                .joinDate(joinDate)
                .build();

        member = memberRepository.save(member);
        log.info("Member created: {} in library: {}", member.getName(), library.getName());
        return buildResponse(member);
    }

    @Transactional
    public MemberResponse update(UUID memberId, String name, String email, String phone,
                                  String address, BigDecimal feeAmount) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "id", memberId));

        if (name != null) member.setName(name);
        if (email != null) member.setEmail(email);
        if (phone != null) member.setPhone(phone);
        if (address != null) member.setAddress(address);
        if (feeAmount != null) member.setFeeAmount(feeAmount);

        member = memberRepository.save(member);
        log.info("Member updated: {}", member.getName());
        return buildResponse(member);
    }

    @Transactional
    public void delete(UUID memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "id", memberId));
        memberRepository.delete(member);
        log.info("Member deleted: {}", member.getName());
    }

    @Transactional
    public MemberResponse markFeePaid(UUID memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "id", memberId));

        LocalDate today = LocalDate.now();
        if (member.getPaidUpTo() == null || member.getPaidUpTo().isBefore(today)) {
            member.setPaidUpTo(today.plusMonths(1));
        } else {
            member.setPaidUpTo(member.getPaidUpTo().plusMonths(1));
        }
        member.setFeeStatus(FeeStatus.PAID);
        member = memberRepository.save(member);
        log.info("Member fee marked paid: {}, paid up to {}", member.getName(), member.getPaidUpTo());
        return buildResponse(member);
    }

    public List<MemberResponse> getExpiredFeeMembers(UUID userId) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);
        return memberRepository.findExpiredFeeMembers(library, LocalDate.now()).stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    public List<MemberResponse> getByLibrary(UUID userId) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);
        return memberRepository.findByLibraryOrderByNameAsc(library).stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    public List<MemberResponse> getByFeeStatus(UUID userId, FeeStatus feeStatus) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);
        return memberRepository.findByLibraryAndFeeStatus(library, feeStatus).stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    public Member getMemberEntity(UUID memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "id", memberId));
    }

    public MemberResponse getById(UUID memberId) {
        return buildResponse(getMemberEntity(memberId));
    }

    private MemberResponse buildResponse(Member member) {
        MemberResponse resp = memberMapper.toResponse(member);
        seatAllocationRepository.findByMemberOrderByCreatedAtDesc(member).stream()
                .filter(a -> a.getStatus() == AllocationStatus.ACTIVE)
                .findFirst()
                .ifPresent(a -> resp.setAllocatedSeat(a.getSeat().getSeatNumber()));
        return resp;
    }
}
