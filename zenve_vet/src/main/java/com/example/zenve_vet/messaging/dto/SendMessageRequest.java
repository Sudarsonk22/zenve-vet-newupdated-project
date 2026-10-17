package com.example.zenve_vet.messaging.dto;

import jakarta.validation.constraints.Size;

import java.util.List;


public record SendMessageRequest(
        @Size(max = 4000) String content,
        Long replyToId,
        List<Long> attachmentIds
) {
}
