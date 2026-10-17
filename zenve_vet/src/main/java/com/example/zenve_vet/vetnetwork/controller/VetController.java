package com.example.zenve_vet.vetnetwork.controller;

import com.example.zenve_vet.auth.AppUser;
import com.example.zenve_vet.auth.AuthException;
import com.example.zenve_vet.auth.AuthService;
import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.vetnetwork.dto.FollowRequest;
import com.example.zenve_vet.vetnetwork.dto.FollowResponse;
import com.example.zenve_vet.vetnetwork.dto.VetRequest;
import com.example.zenve_vet.vetnetwork.dto.VetResponse;
import com.example.zenve_vet.vetnetwork.service.VetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vets")
public class VetController {

    private static final String TOKEN = "X-Auth-Token";

    private final VetService vetService;
    private final AuthService authService;

    public VetController(VetService vetService, AuthService authService) {
        this.vetService = vetService;
        this.authService = authService;
    }

    @GetMapping
    public PageResponse<VetResponse> list(@RequestParam(required = false) String search,
                                          @RequestParam(required = false) String specialty,
                                          @RequestParam(required = false) String city,
                                          @RequestParam(required = false) String state,
                                          @RequestParam(defaultValue = "false") boolean verifiedOnly,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "12") int size,
                                          @RequestParam(required = false) Long viewerId) {
        return vetService.list(search, specialty, city, state, verifiedOnly, page, size, viewerId);
    }

    @GetMapping("/specialties")
    public List<String> specialties() {
        return vetService.specialties();
    }

    @GetMapping("/cities")
    public List<String> cities() {
        return vetService.cities();
    }

    @GetMapping("/states")
    public List<String> states() {
        return vetService.states();
    }

    @GetMapping("/{slug}")
    public VetResponse get(@PathVariable String slug, @RequestParam(required = false) Long viewerId) {
        return vetService.getBySlug(slug, viewerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VetResponse create(@RequestHeader(value = TOKEN, required = false) String token,
                              @Valid @RequestBody VetRequest request) {
        AppUser user = authService.requireUser(token);
        if (user.getVetId() != null) {
            throw new AuthException(HttpStatus.CONFLICT, "You already have a professional page.");
        }
        VetResponse vet = vetService.create(request);
        authService.linkVet(user, vet.id());
        return vet;
    }

    @PutMapping("/{id}")
    public VetResponse update(@RequestHeader(value = TOKEN, required = false) String token,
                              @PathVariable Long id,
                              @Valid @RequestBody VetRequest request) {
        authService.requireOwner(token, id);
        return vetService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = TOKEN, required = false) String token, @PathVariable Long id) {
        AppUser user = authService.requireOwner(token, id);
        vetService.delete(id);
        authService.unlinkVet(user);
    }

    @PostMapping("/{id}/follow")
    public FollowResponse follow(@RequestHeader(value = TOKEN, required = false) String token,
                                 @PathVariable Long id,
                                 @Valid @RequestBody FollowRequest request) {
        authService.requireOwner(token, request.followerId());
        return vetService.follow(id, request.followerId());
    }

    @DeleteMapping("/{id}/follow")
    public FollowResponse unfollow(@RequestHeader(value = TOKEN, required = false) String token,
                                   @PathVariable Long id,
                                   @RequestParam Long followerId) {
        authService.requireOwner(token, followerId);
        return vetService.unfollow(id, followerId);
    }

    @GetMapping("/{id}/requests")
    public List<VetResponse> requests(@RequestHeader(value = TOKEN, required = false) String token,
                                      @PathVariable Long id) {
        authService.requireOwner(token, id);
        return vetService.requests(id);
    }

    @PostMapping("/{id}/requests/{followerId}/accept")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void accept(@RequestHeader(value = TOKEN, required = false) String token,
                       @PathVariable Long id,
                       @PathVariable Long followerId) {
        authService.requireOwner(token, id);
        vetService.acceptRequest(id, followerId);
    }

    @DeleteMapping("/{id}/requests/{followerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(@RequestHeader(value = TOKEN, required = false) String token,
                       @PathVariable Long id,
                       @PathVariable Long followerId) {
        authService.requireOwner(token, id);
        vetService.rejectRequest(id, followerId);
    }

    @GetMapping("/{id}/followers")
    public List<VetResponse> followers(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        return vetService.followers(id, viewerId);
    }

    @GetMapping("/{id}/following")
    public List<VetResponse> following(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        return vetService.following(id, viewerId);
    }
}