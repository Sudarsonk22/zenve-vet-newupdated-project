package com.example.zenve_vet.vetnetwork.dto;

import java.time.LocalDateTime;

public record VetResponse(Long id, String slug, String fullName, String specialty, String city,
                          String state, String bio, String avatarUrl, boolean verified,
                          long followersCount, long followingCount, boolean following,
                          LocalDateTime createdAt,
                          boolean requested, boolean requestedMe, boolean followsMe,
                          String bannerUrl) {

    public VetResponse(Long id, String slug, String fullName, String specialty, String city,
                       String state, String bio, String avatarUrl, boolean verified,
                       long followersCount, long followingCount, boolean following,
                       LocalDateTime createdAt,
                       boolean requested, boolean requestedMe, boolean followsMe) {
        this(id, slug, fullName, specialty, city, state, bio, avatarUrl, verified,
                followersCount, followingCount, following, createdAt,
                requested, requestedMe, followsMe, null);
    }

    public VetResponse(Long id, String slug, String fullName, String specialty, String city,
                       String state, String bio, String avatarUrl, boolean verified,
                       long followersCount, long followingCount, boolean following,
                       LocalDateTime createdAt) {
        this(id, slug, fullName, specialty, city, state, bio, avatarUrl, verified,
                followersCount, followingCount, following, createdAt, false, false, false, null);
    }
}