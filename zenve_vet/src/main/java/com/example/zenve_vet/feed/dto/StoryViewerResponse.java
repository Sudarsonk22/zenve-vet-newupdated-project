package com.example.zenve_vet.feed.dto;

import java.time.LocalDateTime;

public record StoryViewerResponse(Long id, String name, String avatarUrl, String specialty, LocalDateTime viewedAt) {
}