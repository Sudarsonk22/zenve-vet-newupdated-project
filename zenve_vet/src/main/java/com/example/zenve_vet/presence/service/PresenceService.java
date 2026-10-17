package com.example.zenve_vet.presence.service;

import com.example.zenve_vet.auth.AppUser;
import com.example.zenve_vet.auth.AuthService;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PresenceService {

    private final AuthService auth;
    private final VetRepository vets;

    public PresenceService(AuthService auth, VetRepository vets) {
        this.auth = auth;
        this.vets = vets;
    }

    @Transactional
    public void ping(String token) {
        AppUser user = auth.requireUser(token);
        if (user.getVetId() == null) {
            return;
        }
        vets.findById(user.getVetId()).ifPresent(vet -> {
            vet.setLastSeenAt(LocalDateTime.now());
            vets.save(vet);
        });
    }
}