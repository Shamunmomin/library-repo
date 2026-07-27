package com.lab.library.service;

import com.lab.library.dto.response.LibraryResponse;
import com.lab.library.dto.response.OnboardingStatusResponse;
import com.lab.library.entity.Library;
import com.lab.library.entity.User;
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

    @Transactional
    public LibraryResponse create(UUID userId, String name, String address, String phone, String iconPath) {
        User user = userService.getById(userId);

        if (libraryRepository.existsByUser(user)) {
            throw new BadRequestException("You already have a library");
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
    public void delete(UUID id) {
        Library library = libraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Library", "id", id));
        libraryRepository.delete(library);
        log.info("Library deleted: {}", library.getName());
    }
}
