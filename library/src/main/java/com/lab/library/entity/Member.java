package com.lab.library.entity;

import com.lab.library.enums.FeeStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_id", nullable = false)
    private Library library;

    @Column(nullable = false)
    private String name;

    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String photo;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(name = "paid_up_to")
    private LocalDate paidUpTo;

    @Column(name = "fee_amount", precision = 10, scale = 2)
    private BigDecimal feeAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "fee_status", nullable = false)
    @Builder.Default
    private FeeStatus feeStatus = FeeStatus.UNPAID;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (joinDate == null) joinDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
