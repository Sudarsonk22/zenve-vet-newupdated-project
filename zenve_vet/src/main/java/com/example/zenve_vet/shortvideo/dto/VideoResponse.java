package com.example.zenve_vet.shortvideo.dto;

import java.time.LocalDateTime;
import java.util.List;


public record VideoResponse(
        Long id,
        String title,
        String description,
        String videoUrl,
        String thumbnailUrl,
        Integer durationSeconds,
        String category,
        String specialty,
        String animalType,
        String caseType,
        String visibility,
        List<String> hashtags,
        int viewCount,
        int likeCount,
        int commentCount,
        int shareCount,
        boolean liked,
        boolean saved,
        boolean owner,
        VideoCreator creator,
        LocalDateTime createdAt
) {
}
