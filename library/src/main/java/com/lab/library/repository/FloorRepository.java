package com.lab.library.repository;

import com.lab.library.entity.Floor;
import com.lab.library.entity.Library;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FloorRepository extends JpaRepository<Floor, UUID> {
    List<Floor> findByLibraryOrderByCreatedAtAsc(Library library);
    long countByLibrary(Library library);
}
