package com.lab.library.mapper;

import com.lab.library.dto.response.MemberResponse;
import com.lab.library.entity.Member;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MemberMapper {

    @Mapping(target = "libraryId", source = "library.id")
    @Mapping(target = "allocatedSeat", ignore = true)
    MemberResponse toResponse(Member member);

    @AfterMapping
    default void mapPhotoUrl(Member member, @MappingTarget MemberResponse response) {
        response.setPhoto(member.getPhotoData() != null || member.getPhoto() != null
                ? "/api/members/" + member.getId() + "/photo"
                : null);
    }
}
