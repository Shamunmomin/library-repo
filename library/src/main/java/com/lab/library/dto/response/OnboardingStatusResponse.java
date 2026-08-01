package com.lab.library.dto.response;

import com.lab.library.enums.OnboardingStep;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingStatusResponse {
    private boolean hasSubscription;
    private SubscriptionResponse subscription;
    private boolean hasLibrary;
    private LibraryResponse library;
    private OnboardingStep nextStep;
    private String notice;
}
