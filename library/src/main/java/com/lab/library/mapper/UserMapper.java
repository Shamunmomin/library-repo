package com.lab.library.mapper;

import com.lab.library.dto.response.UserResponse;
import com.lab.library.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
