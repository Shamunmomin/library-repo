package com.lab.library.service;

import com.lab.library.dto.StoredImage;
import com.lab.library.dto.response.MemberPaymentResponse;
import com.lab.library.dto.response.MemberResponse;
import com.lab.library.entity.Library;
import com.lab.library.entity.Member;
import com.lab.library.entity.MemberPayment;
import com.lab.library.entity.User;
import com.lab.library.enums.AllocationStatus;
import com.lab.library.enums.FeeStatus;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.exception.UnauthorizedException;
import com.lab.library.mapper.MemberMapper;
import com.lab.library.repository.MemberPaymentRepository;
import com.lab.library.repository.MemberRepository;
import com.lab.library.repository.SeatAllocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final MemberPaymentRepository memberPaymentRepository;
    private final SeatAllocationRepository seatAllocationRepository;
    private final UserService userService;
    private final LibraryService libraryService;
    private final MemberMapper memberMapper;
    private final ImageStorageService imageStorageService;

    @Transactional
    public MemberResponse create(UUID userId, String name, String email, String phone,
                                  String address, BigDecimal feeAmount, StoredImage photo,
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
                .photo(photo != null ? "/uploads/photos/" + photo.fileName() : null)
                .photoData(photo != null ? photo.data() : null)
                .photoContentType(photo != null ? photo.contentType() : null)
                .photoFileName(photo != null ? photo.fileName() : null)
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
        imageStorageService.delete(member.getPhotoFileName(), "photos");
        log.info("Member deleted: {}", member.getName());
    }

    @Transactional(readOnly = true)
    public StoredImage getMemberPhoto(UUID memberId) {
        Member member = getMemberEntity(memberId);
        UUID currentUserId = userService.getCurrentUserId();
        if (!member.getLibrary().getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You are not allowed to view this member's photo");
        }
        if (member.getPhotoData() != null) {
            return new StoredImage(member.getPhotoData(), member.getPhotoContentType(), member.getPhotoFileName());
        }
        return imageStorageService.readFromDisk(member.getPhoto());
    }

    @Transactional
    public MemberResponse markFeePaid(UUID memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "id", memberId));

        LocalDate today = LocalDate.now();
        LocalDate newPaidUpTo;
        if (member.getPaidUpTo() == null || member.getPaidUpTo().isBefore(today)) {
            newPaidUpTo = today.plusMonths(1);
        } else {
            newPaidUpTo = member.getPaidUpTo().plusMonths(1);
        }
        member.setPaidUpTo(newPaidUpTo);
        member.setFeeStatus(FeeStatus.PAID);
        member = memberRepository.save(member);

        MemberPayment payment = MemberPayment.builder()
                .member(member)
                .amount(member.getFeeAmount())
                .paidUpTo(newPaidUpTo)
                .paymentDate(LocalDateTime.now())
                .build();
        memberPaymentRepository.save(payment);

        log.info("Member fee marked paid: {}, paid up to {}", member.getName(), newPaidUpTo);
        return buildResponse(member);
    }

    public List<MemberPaymentResponse> getMemberPayments(UUID memberId) {
        return memberPaymentRepository.findByMemberIdOrderByPaymentDateDesc(memberId).stream()
                .map(p -> MemberPaymentResponse.builder()
                        .id(p.getId().toString())
                        .memberId(p.getMember().getId().toString())
                        .amount(p.getAmount())
                        .paidUpTo(p.getPaidUpTo())
                        .paymentDate(p.getPaymentDate())
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
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
