package com.lab.library.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/health")
public class RenderActivationController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/warmup")
    public ResponseEntity<String> warmup() {
        // Execute a simple query to warm up the database connection
        Integer result = jdbcTemplate.queryForObject(
                "SELECT 1",
                Integer.class
        );

        return ResponseEntity.ok("run warmup query: " + result);
    }

}
