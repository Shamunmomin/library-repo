package com.lab.library.repository;

import com.lab.library.entity.Library;
import com.lab.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LibraryRepository extends JpaRepository<Library, UUID> {
    Optional<Library> findByUser(User user);
    List<Library> findAllByOrderByCreatedAtDesc();
    boolean existsByUser(User user);
}
