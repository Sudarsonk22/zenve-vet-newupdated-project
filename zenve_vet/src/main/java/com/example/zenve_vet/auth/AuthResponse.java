package com.example.zenve_vet.auth;

public record AuthResponse(Long id, String username, String email, Long vetId, String token) {
}