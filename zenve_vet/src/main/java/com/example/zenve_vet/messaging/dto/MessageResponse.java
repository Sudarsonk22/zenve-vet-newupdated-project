package com.example.zenve_vet.messaging.dto;

import java.time.LocalDateTime;
import java.util.List;


public record MessageResponse(
        Long id,
        Long conversationId,
        String content,
        LocalDateTime createdAt,
        Long senderId,
        String senderName,
        boolean mine,
        String status,
        List<AttachmentResponse> attachments,
        ReplyPreview replyTo,
        List<ReactionResponse> reactions
) {
}
