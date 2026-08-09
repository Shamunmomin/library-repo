package com.lab.library.repository;

import com.lab.library.entity.Library;
import com.lab.library.entity.Member;
import com.lab.library.enums.FeeStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberRepository extends JpaRepository<Member, UUID> {
    List<Member> findByLibraryAndArchivedFalseOrderByNameAsc(Library library);
    List<Member> findByLibraryAndArchivedFalseAndFeeStatus(Library library, FeeStatus feeStatus);
    Member findByEmailAndLibrary(String email, Library library);

    @Query("""
            SELECT m
            FROM Member m
            WHERE m.library = :library
              AND m.archived = false
              AND m.isAllocated = false
              AND m.feeStatus = :feeStatus
              AND NOT EXISTS (
                  SELECT sa FROM SeatAllocation sa
                  WHERE sa.member = m AND sa.status = 'ACTIVE'
              )
            ORDER BY m.name ASC
            """)
    List<Member> findAvailableForAllocation(@Param("library") Library library,
                                            @Param("feeStatus") FeeStatus feeStatus);

    @Query("SELECT COUNT(m) FROM Member m WHERE m.library = :library AND m.archived = false")
    long countByLibrary(@Param("library") Library library);

    @Query("SELECT COUNT(m) FROM Member m WHERE m.library = :library AND m.archived = false AND m.feeStatus = :feeStatus")
    long countByLibraryAndFeeStatus(@Param("library") Library library, @Param("feeStatus") FeeStatus feeStatus);

    @Query("SELECT m FROM Member m WHERE m.library = :library AND m.archived = false AND m.paidUpTo IS NOT NULL AND m.paidUpTo < :today")
    List<Member> findExpiredFeeMembers(@Param("library") Library library, @Param("today") LocalDate today);

    @Query("SELECT m FROM Member m WHERE m.archived = false AND m.paidUpTo IS NOT NULL AND m.paidUpTo < :today")
    List<Member> findAllFeeExpired(@Param("today") LocalDate today);

    @Query("SELECT m FROM Member m WHERE m.archived = false AND m.paidUpTo IS NOT NULL AND m.paidUpTo BETWEEN :from AND :to AND m.feeStatus IN :statuses")
    List<Member> findReminderCandidates(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("statuses") List<FeeStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM Member m WHERE m.id = :id")
    Optional<Member> findByIdForUpdate(@Param("id") UUID id);

    List<Member> findByPhotoDataIsNullAndPhotoIsNotNull();

    @Query("""
SELECT m
FROM Member m
WHERE m.library = :library
AND m.archived = false
AND (
    :search IS NULL
    OR m.name LIKE :search
    OR m.phone LIKE :search
)
AND (
    :feeStatus IS NULL
    OR (:feeStatus = 'EXPIRED' AND m.paidUpTo IS NOT NULL AND m.paidUpTo < :today)
    OR (:feeStatus = 'PAID' AND m.paidUpTo IS NOT NULL AND m.paidUpTo >= :today AND m.feeStatus <> 'PARTIAL')
    OR (:feeStatus = 'PARTIAL' AND m.feeStatus = 'PARTIAL' AND m.paidUpTo >= :today)
    OR (:feeStatus = 'UNPAID' AND m.feeStatus = 'UNPAID')
)
ORDER BY m.createdAt DESC
""")
    Page<Member> searchMembers(@Param("library") Library library,
                               @Param("search") String search,
                               @Param("feeStatus") FeeStatus feeStatus,
                               @Param("today") LocalDate today,
                               Pageable pageable);
}
