package com.example.zenve_vet.messaging.dto;


public record UserSummary(
        Long id,
        String name,
        String profileImageUrl,
        String specialization,
        String location,
        String bio,
        boolean online,
        boolean self
) {
}
