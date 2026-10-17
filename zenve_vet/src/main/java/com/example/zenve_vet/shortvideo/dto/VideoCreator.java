package com.example.zenve_vet.shortvideo.dto;


public record VideoCreator(
        Long id,
        String name,
        String profileImageUrl,
        String specialization,
        String location,
        boolean following
) {
}
