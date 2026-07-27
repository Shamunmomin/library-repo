package com.lab.library.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaMigrator {

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void migratePaymentRequestLibraryId() {
        try {
            Integer notNullable = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns " +
                "WHERE table_name = 'payment_requests' " +
                "AND column_name = 'library_id' " +
                "AND is_nullable = 'NO'",
                Integer.class
            );

            if (notNullable != null && notNullable > 0) {
                jdbcTemplate.execute(
                    "ALTER TABLE payment_requests ALTER COLUMN library_id DROP NOT NULL"
                );
                log.info("Schema migrated: payment_requests.library_id NOT NULL constraint removed");
            } else {
                log.info("Schema check: payment_requests.library_id already nullable, no migration needed");
            }
        } catch (DataAccessException e) {
            log.warn("Schema migration skipped (table may not exist yet): {}", e.getMessage());
        }
    }
}
