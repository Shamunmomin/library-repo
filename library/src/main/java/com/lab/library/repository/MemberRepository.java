package com.lab.library.repository;

import com.lab.library.entity.Library;
import com.lab.library.entity.Member;
import com.lab.library.enums.FeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MemberRepository extends JpaRepository<Member, UUID> {
    List<Member> findByLibraryOrderByNameAsc(Library library);
    List<Member> findByLibraryAndFeeStatus(Library library, FeeStatus feeStatus);
    long countByLibrary(Library library);
    long countByLibraryAndFeeStatus(Library library, FeeStatus feeStatus);

    @Query("SELECT m FROM Member m WHERE m.library = :library AND m.paidUpTo IS NOT NULL AND m.paidUpTo < :today")
    List<Member> findExpiredFeeMembers(@Param("library") Library library, @Param("today") LocalDate today);
}
