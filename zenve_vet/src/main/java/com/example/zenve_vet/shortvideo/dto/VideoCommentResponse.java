package com.example.zenve_vet.shortvideo.dto;

import java.time.LocalDateTime;


public record VideoCommentResponse(
        Long id,
        String content,
        LocalDateTime createdAt,
        VideoCreator author
) {
}
