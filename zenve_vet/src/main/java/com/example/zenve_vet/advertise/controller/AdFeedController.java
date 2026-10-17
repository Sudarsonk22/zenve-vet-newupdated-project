package com.example.zenve_vet.advertise.controller;

import com.example.zenve_vet.advertise.dto.AdFeedDtos.*;
import com.example.zenve_vet.advertise.service.AdFeedService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ads")
public class AdFeedController {

    private final AdFeedService service;

    public AdFeedController(AdFeedService service) {
        this.service = service;
    }

    @GetMapping("/feed")
    public List<AdResponse> feed() {
        return service.feed();
    }

    @PostMapping("/{id}/view")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void view(@PathVariable Long id) {
        service.view(id);
    }

    @PostMapping("/{id}/click")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void click(@PathVariable Long id) {
        service.click(id);
    }

    @GetMapping("/{id}/comments")
    public List<AdCommentResponse> comments(@PathVariable Long id) {
        return service.comments(id);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public AdCommentResponse addComment(@RequestHeader(value = "X-Auth-Token", required = false) String token,
                                        @PathVariable Long id, @RequestBody AdCommentRequest request) {
        return service.addComment(token, id, request.body());
    }
}