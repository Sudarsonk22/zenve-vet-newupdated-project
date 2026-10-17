package com.example.zenve_vet.feed.controller;

import com.example.zenve_vet.auth.AppUser;
import com.example.zenve_vet.auth.AuthException;
import com.example.zenve_vet.auth.AuthService;
import com.example.zenve_vet.feed.dto.StoryViewerResponse;
import com.example.zenve_vet.feed.service.PostService;
import com.example.zenve_vet.feed.service.StoryViewService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{id}/story-views")
public class StoryViewController {

    private static final String TOKEN = "X-Auth-Token";

    private final StoryViewService storyViewService;
    private final PostService postService;
    private final AuthService authService;

    public StoryViewController(StoryViewService storyViewService,
                               PostService postService,
                               AuthService authService) {
        this.storyViewService = storyViewService;
        this.postService = postService;
        this.authService = authService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void record(@RequestHeader(value = TOKEN, required = false) String token, @PathVariable Long id) {
        AppUser user = authService.requireUser(token);
        if (user.getVetId() == null) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Create your professional page first.");
        }
        storyViewService.record(id, user.getVetId());
    }

    @GetMapping
    public List<StoryViewerResponse> viewers(@RequestHeader(value = TOKEN, required = false) String token,
                                             @PathVariable Long id) {
        AppUser user = authService.requireUser(token);
        Long authorId = postService.get(id, null).author().id();
        if (user.getVetId() == null || !user.getVetId().equals(authorId)) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Only the owner can see who watched this story.");
        }
        return storyViewService.viewers(id);
    }
}