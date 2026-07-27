package com.lab.library.mapper;

import com.lab.library.dto.response.SeatAllocationResponse;
import com.lab.library.entity.SeatAllocation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SeatAllocationMapper {

    @Mapping(target = "seatId", source = "seat.id")
    @Mapping(target = "seatNumber", source = "seat.seatNumber")
    @Mapping(target = "memberId", source = "member.id")
    @Mapping(target = "memberName", source = "member.name")
    SeatAllocationResponse toResponse(SeatAllocation allocation);
}
