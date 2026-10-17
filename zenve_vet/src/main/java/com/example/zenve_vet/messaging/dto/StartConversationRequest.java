package com.example.zenve_vet.messaging.dto;

import jakarta.validation.constraints.NotNull;


public record StartConversationRequest(@NotNull Long participantId) {
}
