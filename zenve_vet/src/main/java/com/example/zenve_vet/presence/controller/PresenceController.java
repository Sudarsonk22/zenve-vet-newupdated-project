package com.example.zenve_vet.presence.controller;

import com.example.zenve_vet.presence.service.PresenceService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/presence")
public class PresenceController {

    private final PresenceService service;

    public PresenceController(PresenceService service) {
        this.service = service;
    }

    @PostMapping("/ping")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void ping(@RequestHeader(value = "X-Auth-Token", required = false) String token) {
        service.ping(token);
    }
}