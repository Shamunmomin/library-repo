package com.lab.library.service;

import com.lab.library.dto.request.CreateLibraryRequest;
import com.lab.library.dto.request.UpdateLibraryRequest;
import com.lab.library.dto.response.LibraryResponse;
import com.lab.library.entity.Library;
import com.lab.library.entity.User;
import com.lab.library.exception.BadRequestException;
import com.lab.library.exception.DuplicateResourceException;
import com.lab.library.exception.ResourceNotFoundException;
import com.lab.library.repository.LibraryRepository;
import com.lab.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LibraryService {

    private final LibraryRepository libraryRepository;
    private final UserRepository userRepository;

    @Transactional
    public LibraryResponse createLibrary(UUID ownerId, CreateLibraryRequest request) {
        if (libraryRepository.existsByOwnerId(ownerId)) {
            throw new BadRequestException("You already have a library. Each owner can only have one library.");
        }

        Library library = Library.builder()
                .name(request.getName())
                .ownerId(ownerId)
                .address(request.getAddress())
                .phone(request.getPhone())
                .active(true)
                .build();

        library = libraryRepository.save(library);

        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setLibraryId(library.getId());
        userRepository.save(user);

        log.info("Library created: {} by owner: {}", library.getName(), ownerId);

        return mapToResponse(library, user.getName());
    }

    public LibraryResponse getLibraryByOwner(UUID ownerId) {
        Library library = libraryRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Library not found. Please create a library first."));

        String ownerName = userRepository.findById(ownerId)
                .map(User::getName).orElse("Unknown");

        return mapToResponse(library, ownerName);
    }

    @Transactional
    public LibraryResponse updateLibrary(UUID ownerId, UpdateLibraryRequest request) {
        Library library = libraryRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Library not found"));

        if (request.getName() != null) {
            library.setName(request.getName());
        }
        if (request.getAddress() != null) {
            library.setAddress(request.getAddress());
        }
        if (request.getPhone() != null) {
            library.setPhone(request.getPhone());
        }

        library = libraryRepository.save(library);

        String ownerName = userRepository.findById(ownerId)
                .map(User::getName).orElse("Unknown");

        log.info("Library updated: {} by owner: {}", library.getId(), ownerId);

        return mapToResponse(library, ownerName);
    }

    public List<LibraryResponse> getAllLibraries() {
        return libraryRepository.findAll().stream()
                .map(library -> {
                    String ownerName = userRepository.findById(library.getOwnerId())
                            .map(User::getName).orElse("Unknown");
                    return mapToResponse(library, ownerName);
                })
                .toList();
    }

    public LibraryResponse getLibraryById(UUID libraryId) {
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Library not found"));

        String ownerName = userRepository.findById(library.getOwnerId())
                .map(User::getName).orElse("Unknown");

        return mapToResponse(library, ownerName);
    }

    @Transactional
    public LibraryResponse toggleLibraryActive(UUID libraryId) {
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new ResourceNotFoundException("Library not found"));

        library.setActive(!library.isActive());
        library = libraryRepository.save(library);

        String ownerName = userRepository.findById(library.getOwnerId())
                .map(User::getName).orElse("Unknown");

        log.info("Library {} {}", libraryId, library.isActive() ? "activated" : "deactivated");

        return mapToResponse(library, ownerName);
    }

    private LibraryResponse mapToResponse(Library library, String ownerName) {
        return LibraryResponse.builder()
                .id(library.getId())
                .name(library.getName())
                .ownerId(library.getOwnerId())
                .ownerName(ownerName)
                .address(library.getAddress())
                .phone(library.getPhone())
                .active(library.isActive())
                .build();
    }
}
