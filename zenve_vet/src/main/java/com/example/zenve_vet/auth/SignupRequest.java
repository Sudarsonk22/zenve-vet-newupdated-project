package com.example.zenve_vet.auth;

public record SignupRequest(String username, String email, String password, String confirmPassword) {
}