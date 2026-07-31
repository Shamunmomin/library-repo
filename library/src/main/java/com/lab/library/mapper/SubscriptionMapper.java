package com.lab.library.mapper;

import com.lab.library.dto.response.SubscriptionResponse;
import com.lab.library.entity.Subscription;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "packageType", source = "packageType")
    @Mapping(target = "status", source = "status")
    SubscriptionResponse toResponse(Subscription subscription);

    @AfterMapping
    default void mapScreenshotUrl(Subscription subscription, @MappingTarget SubscriptionResponse response) {
        response.setPaymentScreenshot(subscription.getScreenshotData() != null || subscription.getPaymentScreenshot() != null
                ? "/api/subscriptions/" + subscription.getId() + "/screenshot"
                : null);
    }
}
