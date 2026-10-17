package com.example.zenve_vet.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private record ResetCode(String code, LocalDateTime expiresAt, int tries) {
    }

    private final AppUserRepository users;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();
    private final Map<String, ResetCode> resetCodes = new ConcurrentHashMap<>();

    public AuthService(AppUserRepository users) {
        this.users = users;
    }

    public AuthResponse signup(SignupRequest request) {
        String username = clean(request.username());
        String email = clean(request.email()).toLowerCase();
        String password = request.password() == null ? "" : request.password();
        String confirmPassword = request.confirmPassword() == null ? "" : request.confirmPassword();

        if (username.isEmpty()) {
            throw new IllegalArgumentException("Please enter a username.");
        }
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Please enter a valid email.");
        }
        checkPassword(password);
        if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match.");
        }
        if (users.existsByEmail(email)) {
            throw new IllegalArgumentException("This email is already registered.");
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));
        user.setToken(newToken());
        users.save(user);

        return toResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = clean(request.email()).toLowerCase();
        String password = request.password() == null ? "" : request.password();

        AppUser user = users.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!encoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        if (user.getToken() == null) {
            user.setToken(newToken());
            users.save(user);
        }

        return toResponse(user);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        String email = clean(request.email()).toLowerCase();

        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Please enter a valid email.");
        }

        if (users.findByEmail(email).isPresent()) {
            String code = String.format("%06d", random.nextInt(1000000));
            resetCodes.put(email, new ResetCode(code, LocalDateTime.now().plusMinutes(10), 0));

            System.out.println("=========== PASSWORD RESET ===========");
            System.out.println("Email      : " + email);
            System.out.println("Reset code : " + code + "  (valid for 10 minutes)");
            System.out.println("======================================");
        }
    }

    public void resetPassword(ResetPasswordRequest request) {
        String email = clean(request.email()).toLowerCase();
        String code = clean(request.code());
        String password = request.password() == null ? "" : request.password();
        String confirmPassword = request.confirmPassword() == null ? "" : request.confirmPassword();

        ResetCode saved = resetCodes.get(email);
        if (saved == null || saved.expiresAt().isBefore(LocalDateTime.now())) {
            resetCodes.remove(email);
            throw new IllegalArgumentException("This reset code has expired. Please ask for a new one.");
        }
        if (saved.tries() >= 5) {
            resetCodes.remove(email);
            throw new IllegalArgumentException("Too many wrong attempts. Please ask for a new code.");
        }
        if (!saved.code().equals(code)) {
            resetCodes.put(email, new ResetCode(saved.code(), saved.expiresAt(), saved.tries() + 1));
            throw new IllegalArgumentException("The reset code is not correct.");
        }

        checkPassword(password);
        if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        AppUser user = users.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("This email is not registered."));
        user.setPasswordHash(encoder.encode(password));
        user.setToken(newToken());
        users.save(user);
        resetCodes.remove(email);
    }

    public AuthResponse me(String token) {
        return toResponse(requireUser(token));
    }

    public AppUser requireUser(String token) {
        if (token == null || token.isBlank()) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Please sign in to continue.");
        }
        return users.findByToken(token)
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Please sign in again."));
    }

    public AppUser requireOwner(String token, Long vetId) {
        AppUser user = requireUser(token);
        if (user.getVetId() == null) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Create your professional page first.");
        }
        if (!user.getVetId().equals(vetId)) {
            throw new AuthException(HttpStatus.FORBIDDEN, "You can only do this as yourself.");
        }
        return user;
    }

    public void linkVet(AppUser user, Long vetId) {
        user.setVetId(vetId);
        users.save(user);
    }

    public void unlinkVet(AppUser user) {
        user.setVetId(null);
        users.save(user);
    }

    private void checkPassword(String password) {
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must have at least one uppercase letter.");
        }
        if (!password.matches(".*[^A-Za-z0-9].*")) {
            throw new IllegalArgumentException("Password must have at least one symbol, like @ # $ % !");
        }
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    }

    private String newToken() {
        return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private AuthResponse toResponse(AppUser user) {
        return new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), user.getVetId(), user.getToken());
    }
}