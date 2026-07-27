package com.lab.library.mapper;

import com.lab.library.dto.response.SubscriptionResponse;
import com.lab.library.entity.Subscription;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "packageType", source = "packageType")
    @Mapping(target = "status", source = "status")
    SubscriptionResponse toResponse(Subscription subscription);
}
