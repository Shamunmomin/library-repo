package com.lab.library.mapper;

import com.lab.library.dto.response.LibraryResponse;
import com.lab.library.entity.Library;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface LibraryMapper {

    @Mapping(target = "userId", source = "user.id")
    LibraryResponse toResponse(Library library);

    @AfterMapping
    default void mapIconUrl(Library library, @MappingTarget LibraryResponse response) {
        response.setIcon(library.getIconData() != null || library.getIcon() != null
                ? "/api/libraries/" + library.getId() + "/icon"
                : null);
    }
}
