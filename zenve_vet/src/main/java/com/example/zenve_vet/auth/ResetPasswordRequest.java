package com.example.zenve_vet.auth;

public record ResetPasswordRequest(String email, String code, String password, String confirmPassword) {
}