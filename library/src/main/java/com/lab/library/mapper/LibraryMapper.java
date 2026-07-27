package com.lab.library.mapper;

import com.lab.library.dto.response.LibraryResponse;
import com.lab.library.entity.Library;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LibraryMapper {

    @Mapping(target = "userId", source = "user.id")
    LibraryResponse toResponse(Library library);
}
