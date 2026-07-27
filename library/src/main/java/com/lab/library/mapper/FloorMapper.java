package com.lab.library.mapper;

import com.lab.library.dto.response.FloorResponse;
import com.lab.library.entity.Floor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FloorMapper {

    @Mapping(target = "libraryId", source = "library.id")
    @Mapping(target = "seatCount", ignore = true)
    FloorResponse toResponse(Floor floor);
}
