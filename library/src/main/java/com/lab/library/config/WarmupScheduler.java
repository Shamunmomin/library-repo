package com.lab.library.config;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class WarmupScheduler {

    private final RestClient restClient;

    public WarmupScheduler(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://library-repo-n2eu.onrender.com")
                .build();
    }

    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void warmup() {
        try {
            String response = restClient
                    .get()
                    .uri("/api/health/warmup")
                    .retrieve()
                    .body(String.class);

            System.out.println("Warmup response: " + response);

        } catch (Exception e) {
            System.err.println("Warmup failed: " + e.getMessage());
        }
    }
}
