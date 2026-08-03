package com.lab.library.service;

import com.lab.library.dto.StoredImage;
import com.lab.library.dto.response.MemberPaymentResponse;
import com.lab.library.dto.response.MemberResponse;
import com.lab.library.dto.response.PageResponse;
import com.lab.library.entity.Library;
import com.lab.library.entity.Member;
import com.lab.library.entity.MemberPayment;
import com.lab.library.entity.SeatAllocation;
import com.lab.library.entity.User;
import com.lab.library.enums.AllocationStatus;
import com.lab.library.enums.FeeCycle;
import com.lab.library.enums.FeeStatus;
import com.lab.library.enums.MemberPaymentStatus;
import com.lab.library.enums.PaymentMethod;
import com.lab.library.enums.SeatStatus;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.exception.UnauthorizedException;
import com.lab.library.mapper.MemberMapper;
import com.lab.library.repository.MemberPaymentRepository;
import com.lab.library.repository.MemberRepository;
import com.lab.library.repository.SeatAllocationRepository;
import com.lab.library.service.policy.MemberFeePolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private static final DateTimeFormatter RECEIPT_MONTH = DateTimeFormatter.ofPattern("yyyyMM");

    private final MemberRepository memberRepository;
    private final MemberPaymentRepository memberPaymentRepository;
    private final SeatAllocationRepository seatAllocationRepository;
    private final UserService userService;
    private final LibraryService libraryService;
    private final MemberMapper memberMapper;
    private final ImageStorageService imageStorageService;
    private final SeatService seatService;
    private final MemberFeePolicy feePolicy;

    @Transactional
    public MemberResponse create(UUID userId, String name, String email, String phone,
                                  String address, BigDecimal feeAmount, FeeCycle feeCycle,
                                  StoredImage photo, String joinDateStr) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);

        LocalDate joinDate;
        try {
            joinDate = LocalDate.parse(joinDateStr);
        } catch (Exception e) {
            throw new BadRequestException("Invalid join date format. Use YYYY-MM-DD");
        }
        if (joinDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("Join date cannot be in the future");
        }

        Member member = Member.builder()
                .library(library)
                .name(name.toLowerCase())
                .email(email)
                .phone(phone)
                .address(address)
                .feeAmount(feeAmount)
                .feeCycle(feeCycle != null ? feeCycle : FeeCycle.MONTHLY)
                .feeStatus(FeeStatus.UNPAID)
                .photo(photo != null ? "/uploads/photos/" + photo.fileName() : null)
                .photoData(photo != null ? photo.data() : null)
                .photoContentType(photo != null ? photo.contentType() : null)
                .photoFileName(photo != null ? photo.fileName() : null)
                .joinDate(joinDate)
                .build();

        member = memberRepository.save(member);

//        boolean hasFee = feeAmount != null && feeAmount.compareTo(BigDecimal.ZERO) > 0;
//        if (hasFee) {
//            FeeCycle cycle = member.getFeeCycle() != null ? member.getFeeCycle() : FeeCycle.MONTHLY;
//            LocalDate paidUpTo = joinDate.plusMonths(cycle.getMonths());
//            member.setPaidUpTo(paidUpTo);
//            member.setFeeStatus(FeeStatus.PAID);
//            memberPaymentRepository.save(buildPayment(member, joinDate, paidUpTo, feeAmount,
//                    LocalDate.now(), null, userId, null));
//            log.info("Initial fee payment recorded for member {}: paid up to {}", member.getName(), paidUpTo);
//        }

        log.info("Member created: {} in library: {}", member.getName(), library.getName());
        return buildResponse(member);
    }

    @Transactional
    public MemberResponse update(UUID userId, UUID memberId, String name, String email, String phone,
                                  String address, BigDecimal feeAmount, FeeCycle feeCycle) {
        Member member = getMemberEntityOwnedBy(memberId, userId);

        if (name != null && !name.isBlank()) member.setName(name.toLowerCase());
        if (email != null) member.setEmail(email);
        if (phone != null) member.setPhone(phone);
        if (address != null) member.setAddress(address);
        if (feeAmount != null) member.setFeeAmount(feeAmount);
        if (feeCycle != null) member.setFeeCycle(feeCycle);

        member = memberRepository.save(member);
        log.info("Member updated: {}", member.getName());
        return buildResponse(member);
    }

    @Transactional
    public void delete(UUID memberId, UUID userId) {
        Member member = getMemberEntityOwnedBy(memberId, userId);

        List<SeatAllocation> activeAllocations = seatAllocationRepository.findByMemberOrderByCreatedAtDesc(member).stream()
                .filter(a -> a.getStatus() == AllocationStatus.ACTIVE)
                .toList();
        for (SeatAllocation allocation : activeAllocations) {
            allocation.setStatus(AllocationStatus.EXPIRED);
            allocation.setEndDate(LocalDateTime.now());
            seatAllocationRepository.save(allocation);
            seatService.updateStatus(allocation.getSeat().getId(), SeatStatus.AVAILABLE);
        }

        member.setArchived(true);
        member.setFeeStatus(FeeStatus.UNPAID);
        member.setAllocated(false);
        memberRepository.save(member);
        imageStorageService.delete(member.getPhotoFileName(), "photos");
        log.info("Member archived: {} ({} active allocation(s) ended)", member.getName(), activeAllocations.size());
    }

    @Transactional(readOnly = true)
    public StoredImage getMemberPhoto(UUID memberId) {
        Member member = getMemberEntityOwnedBy(memberId, userService.getCurrentUserId());
        if (member.getPhotoData() != null) {
            return new StoredImage(member.getPhotoData(), member.getPhotoContentType(), member.getPhotoFileName());
        }
        return imageStorageService.readFromDisk(member.getPhoto());
    }

    @Transactional
    public MemberResponse recordPayment(UUID userId, UUID memberId, LocalDate payDate,
                                        PaymentMethod method, BigDecimal amount, String remarks,
                                        LocalDate paidUpToOverride) {
        Member member = memberRepository.findByIdForUpdate(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "id", memberId));
        if (!member.getLibrary().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not allowed to access this member");
        }

        LocalDate today = LocalDate.now();
        LocalDate paymentDate = payDate != null ? payDate : today;
        if (paymentDate.isAfter(today)) {
            throw new BadRequestException("Payment date cannot be in the future");
        }
        if (paymentDate.isBefore(today.minusYears(1))) {
            throw new BadRequestException("Payment date is too far in the past");
        }

        int cycleMonths = member.getFeeCycle() != null
                ? member.getFeeCycle().getMonths()
                : FeeCycle.MONTHLY.getMonths();

        LocalDate base = feePolicy.resolveBillingBase(member);
        LocalDate periodStart = base;
        LocalDate periodEnd = base.plusMonths(cycleMonths);

        if (paidUpToOverride != null) {
            if (!paidUpToOverride.isAfter(base)) {
                throw new BadRequestException(
                        "Override paid-up-to date must be after current coverage (" + base + ")");
            }
            periodEnd = paidUpToOverride;
        }

        BigDecimal paidAmount = amount != null ? amount : member.getFeeAmount();
        if (paidAmount == null) paidAmount = BigDecimal.ZERO;

        MemberPayment payment = buildPayment(member, periodStart, periodEnd, paidAmount,
                paymentDate, method != null ? method : PaymentMethod.CASH, userId, remarks);
        memberPaymentRepository.save(payment);

        LocalDate maxPaidUpTo = memberPaymentRepository
                .findMaxPaidUpToByMemberIdAndStatus(member.getId(), MemberPaymentStatus.COMPLETED);
        member.setPaidUpTo(maxPaidUpTo != null ? maxPaidUpTo : periodEnd);

        boolean partial = member.getFeeAmount() != null && paidAmount.compareTo(member.getFeeAmount()) < 0;
        member.setFeeStatus(partial ? FeeStatus.PARTIAL : FeeStatus.PAID);
        member = memberRepository.save(member);

        log.info("Payment {} (receipt {}) recorded for member {}, paid up to {}",
                payment.getId(), payment.getReceiptNo(), member.getName(), member.getPaidUpTo());
        return buildResponse(member);
    }

    @Transactional
    public MemberPaymentResponse voidPayment(UUID userId, UUID memberId, UUID paymentId, String reason) {
        Member member = getMemberEntityOwnedBy(memberId, userId);

        MemberPayment payment = memberPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("MemberPayment", "id", paymentId));
        if (!payment.getMember().getId().equals(memberId)) {
            throw new BadRequestException("Payment does not belong to this member");
        }
        if (payment.getStatus() != MemberPaymentStatus.COMPLETED) {
            throw new BadRequestException("Payment is already reversed");
        }
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Reversal reason is required");
        }

        payment.setStatus(MemberPaymentStatus.REVERSED);
        payment.setReversedBy(userId);
        payment.setReversedAt(LocalDateTime.now());
        payment.setReverseReason(reason);
        payment = memberPaymentRepository.save(payment);

        LocalDate maxPaidUpTo = memberPaymentRepository
                .findMaxPaidUpToByMemberIdAndStatus(memberId, MemberPaymentStatus.COMPLETED);
        member.setPaidUpTo(maxPaidUpTo);
        if (maxPaidUpTo == null) {
            member.setFeeStatus(FeeStatus.UNPAID);
        } else if (maxPaidUpTo.isBefore(LocalDate.now())) {
            member.setFeeStatus(FeeStatus.EXPIRED);
        }
        memberRepository.save(member);

        log.info("Payment {} reversed for member {}: {}", paymentId, member.getName(), reason);
        return buildPaymentResponse(payment);
    }

    public List<MemberPaymentResponse> getMemberPayments(UUID userId, UUID memberId) {
        Member member = getMemberEntityOwnedBy(memberId, userId);
        return memberPaymentRepository.findByMemberIdOrderByPaymentDateDesc(member.getId()).stream()
                .map(this::buildPaymentResponse)
                .toList();
    }

    public List<MemberResponse> getExpiredFeeMembers(UUID userId) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);
        return memberRepository.findExpiredFeeMembers(library, LocalDate.now()).stream()
                .map(this::buildResponse)
                .toList();
    }

    public List<MemberResponse> getByLibrary(UUID userId) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);
        return memberRepository.findByLibraryAndArchivedFalseOrderByNameAsc(library).stream()
                .map(this::buildResponse)
                .toList();
    }

    public List<MemberResponse> getAvailableForAllocation(UUID userId) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);
        return memberRepository.findAvailableForAllocation(library, FeeStatus.PAID).stream()
                .map(this::buildResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<MemberResponse> getByLibraryPaginated(UUID userId, String search, FeeStatus feeStatus, int page, int size) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);

        int safeSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("name").ascending());

        String searchTerm = (search != null && !search.isBlank()) ? "%" + search.toLowerCase() + "%" : null;

        Page<Member> memberPage = memberRepository.searchMembers(library, searchTerm, feeStatus, LocalDate.now(), pageable);
        List<MemberResponse> content = memberPage.getContent().stream()
                .map(this::buildResponse)
                .toList();

        return PageResponse.<MemberResponse>builder()
                .content(content)
                .page(memberPage.getNumber())
                .size(memberPage.getSize())
                .totalElements(memberPage.getTotalElements())
                .totalPages(memberPage.getTotalPages())
                .build();
    }

    public List<MemberResponse> getByFeeStatus(UUID userId, FeeStatus feeStatus) {
        User user = userService.getById(userId);
        Library library = libraryService.getLibraryByUser(user);
        return memberRepository.findByLibraryAndArchivedFalseAndFeeStatus(library, feeStatus).stream()
                .map(this::buildResponse)
                .toList();
    }

    public Member getMemberEntity(UUID memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "id", memberId));
    }

    public MemberResponse getById(UUID userId, UUID memberId) {
        return buildResponse(getMemberEntityOwnedBy(memberId, userId));
    }

    private Member getMemberEntityOwnedBy(UUID memberId, UUID userId) {
        Member member = getMemberEntity(memberId);
        if (!member.getLibrary().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not allowed to access this member");
        }
        return member;
    }

    private MemberPayment buildPayment(Member member, LocalDate periodStart, LocalDate paidUpTo,
                                       BigDecimal amount, LocalDate paymentDate, PaymentMethod method,
                                       UUID recordedBy, String remarks) {
        return MemberPayment.builder()
                .member(member)
                .amount(amount)
                .periodStart(periodStart)
                .paidUpTo(paidUpTo)
                .paymentDate(paymentDate != null ? paymentDate.atStartOfDay() : LocalDateTime.now())
                .method(method)
                .recordedBy(recordedBy)
                .receiptNo(generateReceiptNo(member))
                .remarks(remarks)
                .status(MemberPaymentStatus.COMPLETED)
                .build();
    }

    private String generateReceiptNo(Member member) {
        long seq = memberPaymentRepository.countByMemberId(member.getId()) + 1;
        return "MEM-" + RECEIPT_MONTH.format(LocalDate.now()) + "-" + String.format("%04d", seq);
    }

    private MemberResponse buildResponse(Member member) {
        MemberResponse resp = memberMapper.toResponse(member);
        resp.setFeeCycle(member.getFeeCycle() != null ? member.getFeeCycle().name() : FeeCycle.MONTHLY.name());
        resp.setEffectiveFeeStatus(feePolicy.resolveEffectiveStatus(member, LocalDate.now()).name());
        seatAllocationRepository.findByMemberOrderByCreatedAtDesc(member).stream()
                .filter(a -> a.getStatus() == AllocationStatus.ACTIVE)
                .findFirst()
                .ifPresent(a -> resp.setAllocatedSeat(a.getSeat().getSeatNumber()));
        return resp;
    }

    private MemberPaymentResponse buildPaymentResponse(MemberPayment payment) {
        return MemberPaymentResponse.builder()
                .id(payment.getId().toString())
                .memberId(payment.getMember().getId().toString())
                .amount(payment.getAmount())
                .periodStart(payment.getPeriodStart())
                .paidUpTo(payment.getPaidUpTo())
                .paymentDate(payment.getPaymentDate())
                .method(payment.getMethod() != null ? payment.getMethod().name() : null)
                .receiptNo(payment.getReceiptNo())
                .remarks(payment.getRemarks())
                .status(payment.getStatus().name())
                .reversedBy(payment.getReversedBy() != null ? payment.getReversedBy().toString() : null)
                .reversedAt(payment.getReversedAt())
                .reverseReason(payment.getReverseReason())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
