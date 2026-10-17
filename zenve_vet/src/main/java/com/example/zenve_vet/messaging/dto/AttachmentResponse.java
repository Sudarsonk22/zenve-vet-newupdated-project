package com.example.zenve_vet.messaging.dto;


public record AttachmentResponse(
        Long id,
        String url,
        String fileName,
        String contentType,
        long size
) {
}
