package com.example.zenve_vet.messaging.dto;


public record ReactionResponse(String emoji, long count, boolean reactedByMe) {
}
