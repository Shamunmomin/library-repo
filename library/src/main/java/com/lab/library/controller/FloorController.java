package com.lab.library.controller;

import com.lab.library.dto.response.FloorResponse;
import com.lab.library.service.FloorService;
import com.lab.library.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/floors")
@RequiredArgsConstructor
public class FloorController {

    private final FloorService floorService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<FloorResponse> create(@RequestBody Map<String, String> body) {
        UUID userId = userService.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(floorService.create(userId, body.get("name"), body.get("description")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FloorResponse> update(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(floorService.update(id, body.get("name"), body.get("description")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        floorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<FloorResponse>> getMyFloors() {
        UUID userId = userService.getCurrentUserId();
        return ResponseEntity.ok(floorService.getByLibrary(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FloorResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(floorService.getById(id));
    }
}
