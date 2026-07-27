package com.lab.library.mapper;

import com.lab.library.dto.response.MemberResponse;
import com.lab.library.entity.Member;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MemberMapper {

    @Mapping(target = "libraryId", source = "library.id")
    @Mapping(target = "allocatedSeat", ignore = true)
    MemberResponse toResponse(Member member);
}
