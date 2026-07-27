package com.lab.library.mapper;

import com.lab.library.dto.response.SeatResponse;
import com.lab.library.entity.Seat;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SeatMapper {

    @Mapping(target = "floorId", source = "floor.id")
    SeatResponse toResponse(Seat seat);
}
