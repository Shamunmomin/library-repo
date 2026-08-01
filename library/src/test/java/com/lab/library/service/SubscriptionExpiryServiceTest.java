package com.lab.library.service;

import com.lab.library.config.SubscriptionProperties;
import com.lab.library.entity.Subscription;
import com.lab.library.entity.User;
import com.lab.library.enums.NotificationType;
import com.lab.library.enums.Role;
import com.lab.library.enums.SubscriptionPackage;
import com.lab.library.enums.SubscriptionStatus;
import com.lab.library.mapper.SubscriptionMapper;
import com.lab.library.repository.NotificationLogRepository;
import com.lab.library.repository.SubscriptionRepository;
import com.lab.library.service.policy.GracePeriodSubscriptionExpiryPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubscriptionExpiryServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;
    @Mock
    private NotificationLogRepository notificationLogRepository;
    @Mock
    private SubscriptionMapper subscriptionMapper;
    @Mock
    private SubscriptionEventService subscriptionEventService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private SubscriptionExpiryService expiryService;

    private SubscriptionProperties properties;
    private User owner;

    @BeforeEach
    void setUp() {
        properties = new SubscriptionProperties();
        properties.setGracePeriodDays(3);
        properties.setReminderDaysBefore(List.of(3, 1));

        owner = User.builder()
                .id(UUID.randomUUID())
                .name("Test Owner")
                .email("owner@example.com")
                .role(Role.OWNER)
                .build();

        expiryService = new SubscriptionExpiryService(
                subscriptionRepository,
                notificationLogRepository,
                subscriptionMapper,
                subscriptionEventService,
                emailService,
                new GracePeriodSubscriptionExpiryPolicy(properties),
                properties);
    }

    @Test
    void expiresLockedOutSubscriptionsAndNotifies() {
        LocalDateTime now = LocalDateTime.now();
        Subscription due = Subscription.builder()
                .id(UUID.randomUUID())
                .user(owner)
                .packageType(SubscriptionPackage.BASE)
                .status(SubscriptionStatus.ACTIVE)
                .endDate(now.minusDays(10))
                .build();

        when(subscriptionRepository.findByStatusAndEndDateBefore(eq(SubscriptionStatus.ACTIVE), any()))
                .thenReturn(List.of(due));
        when(subscriptionRepository.findByStatusAndEndDateBetween(eq(SubscriptionStatus.ACTIVE), any(), any()))
                .thenReturn(List.of());
        when(subscriptionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        expiryService.processSubscriptionLifecycle();

        assertEquals(SubscriptionStatus.EXPIRED, due.getStatus());
        verify(subscriptionRepository).save(due);
        verify(subscriptionEventService).notifyUser(eq(owner.getId()), any());
        verify(emailService).sendSubscriptionNotification(due, NotificationType.EXPIRED);
        verify(notificationLogRepository).save(argThat(log ->
                log.getType() == NotificationType.EXPIRED && log.getReminderDays() == null));
    }

    @Test
    void skipsSubscriptionStillInsideGracePeriod() {
        LocalDateTime now = LocalDateTime.now();
        Subscription inGrace = Subscription.builder()
                .id(UUID.randomUUID())
                .user(owner)
                .packageType(SubscriptionPackage.BASE)
                .status(SubscriptionStatus.ACTIVE)
                .endDate(now.minusDays(1))
                .build();

        when(subscriptionRepository.findByStatusAndEndDateBefore(eq(SubscriptionStatus.ACTIVE), any()))
                .thenReturn(List.of(inGrace));
        when(subscriptionRepository.findByStatusAndEndDateBetween(eq(SubscriptionStatus.ACTIVE), any(), any()))
                .thenReturn(List.of());

        expiryService.processSubscriptionLifecycle();

        assertEquals(SubscriptionStatus.ACTIVE, inGrace.getStatus());
        verify(subscriptionRepository, never()).save(inGrace);
        verify(emailService, never()).sendSubscriptionNotification(any(), eq(NotificationType.EXPIRED));
    }

    @Test
    void sendsReminderOncePerWindowAndDoesNotDuplicate() {
        LocalDateTime now = LocalDateTime.now();
        Subscription upcoming = Subscription.builder()
                .id(UUID.randomUUID())
                .user(owner)
                .packageType(SubscriptionPackage.PRO)
                .status(SubscriptionStatus.ACTIVE)
                .endDate(now.plusDays(3).minusMinutes(5))
                .build();

        AtomicBoolean alreadyNotified = new AtomicBoolean(false);
        when(subscriptionRepository.findByStatusAndEndDateBefore(eq(SubscriptionStatus.ACTIVE), any()))
                .thenReturn(List.of());
        when(subscriptionRepository.findByStatusAndEndDateBetween(eq(SubscriptionStatus.ACTIVE), any(), any()))
                .thenReturn(List.of(upcoming));
        when(notificationLogRepository.existsBySubscriptionIdAndTypeAndReminderDays(any(), any(), any()))
                .thenAnswer(inv -> alreadyNotified.get());
        doAnswer(inv -> {
            alreadyNotified.set(true);
            return null;
        }).when(notificationLogRepository).save(any());

        expiryService.processSubscriptionLifecycle();
        expiryService.processSubscriptionLifecycle();

        verify(emailService, times(1)).sendSubscriptionNotification(upcoming, NotificationType.REMINDER);
        verify(notificationLogRepository).save(argThat(log ->
                log.getType() == NotificationType.REMINDER && log.getReminderDays() == 3));
    }

    @Test
    void doesNotSendReminderWhenAlreadyLogged() {
        LocalDateTime now = LocalDateTime.now();
        Subscription upcoming = Subscription.builder()
                .id(UUID.randomUUID())
                .user(owner)
                .packageType(SubscriptionPackage.PRO)
                .status(SubscriptionStatus.ACTIVE)
                .endDate(now.plusDays(1))
                .build();

        when(subscriptionRepository.findByStatusAndEndDateBefore(eq(SubscriptionStatus.ACTIVE), any()))
                .thenReturn(List.of());
        when(subscriptionRepository.findByStatusAndEndDateBetween(eq(SubscriptionStatus.ACTIVE), any(), any()))
                .thenReturn(List.of(upcoming));
        when(notificationLogRepository.existsBySubscriptionIdAndTypeAndReminderDays(any(), any(), any()))
                .thenReturn(true);

        expiryService.processSubscriptionLifecycle();

        verify(emailService, never()).sendSubscriptionNotification(upcoming, NotificationType.REMINDER);
    }
}
