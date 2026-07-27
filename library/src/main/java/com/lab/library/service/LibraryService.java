package com.lab.library.service;

import com.lab.library.dto.response.LibraryResponse;
import com.lab.library.dto.response.OnboardingStatusResponse;
import com.lab.library.entity.Library;
import com.lab.library.entity.User;
import com.lab.library.enums.SubscriptionPackage;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.mapper.LibraryMapper;
import com.lab.library.mapper.SubscriptionMapper;
import com.lab.library.repository.LibraryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LibraryRepository libraryRepository;
    private final UserService userService;
    private final LibraryMapper libraryMapper;
    private final SubscriptionService subscriptionService;
    private final SubscriptionMapper subscriptionMapper;

    public OnboardingStatusResponse getOnboardingStatus(UUID userId) {
        User user = userService.getById(userId);

        var subscriptionResp = subscriptionService.getMySubscription(userId);

        Library library = libraryRepository.findByUser(user).orElse(null);

        return OnboardingStatusResponse.builder()
                .hasSubscription(subscriptionResp != null)
                .subscription(subscriptionResp)
                .hasLibrary(library != null)
                .library(library != null ? libraryMapper.toResponse(library) : null)
                .build();
    }

    public Library getLibraryByUser(User user) {
        return libraryRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Library", "user", user.getId()));
    }

    @Transactional
    public LibraryResponse create(UUID userId, String name, String address, String phone, String iconPath) {
        User user = userService.getById(userId);

        SubscriptionPackage pkg = subscriptionService.getUserActivePackage(userId);
        if (pkg == null) {
            throw new BadRequestException("No active subscription found");
        }

        long currentLibraries = libraryRepository.countByUser(user);
        if (pkg == SubscriptionPackage.BASE && currentLibraries >= 1) {
            throw new BadRequestException("Base plan allows only 1 library");
        }
        if (pkg == SubscriptionPackage.PRO && currentLibraries >= 2) {
            throw new BadRequestException("Pro plan allows up to 2 libraries");
        }

        Library library = Library.builder()
                .user(user)
                .name(name)
                .address(address)
                .phone(phone)
                .icon(iconPath)
                .build();

        library = libraryRepository.save(library);
        log.info("Library created: {} for user: {}", library.getName(), user.getEmail());
        return libraryMapper.toResponse(library);
    }

    public LibraryResponse getMyLibrary(UUID userId) {
        User user = userService.getById(userId);
        return libraryRepository.findByUser(user)
                .map(libraryMapper::toResponse)
                .orElse(null);
    }

    public LibraryResponse getById(UUID id) {
        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Library", "id", id));
        return libraryMapper.toResponse(library);
    }

    public List<LibraryResponse> getAllLibraries() {
        return libraryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(libraryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LibraryResponse update(UUID id, String name, String address, String phone, String iconPath) {
        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Library", "id", id));
        if (name != null) library.setName(name);
        if (address != null) library.setAddress(address);
        if (phone != null) library.setPhone(phone);
        if (iconPath != null) library.setIcon(iconPath);
        library = libraryRepository.save(library);
        log.info("Library updated: {}", library.getName());
        return libraryMapper.toResponse(library);
    }

    @Transactional
    public void delete(UUID id) {
        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Library", "id", id));
        libraryRepository.delete(library);
        log.info("Library deleted: {}", library.getName());
    }
}
