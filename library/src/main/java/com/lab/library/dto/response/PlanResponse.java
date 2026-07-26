package com.lab.library.dto.response;

import com.lab.library.entity.PlanType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanResponse {

    private Long id;
    private PlanType planType;
    private String name;
    private BigDecimal price;
    private int maxFloors;
    private int maxSeats;
    private int maxMembers;
    private String description;
    private int durationDays;
}
