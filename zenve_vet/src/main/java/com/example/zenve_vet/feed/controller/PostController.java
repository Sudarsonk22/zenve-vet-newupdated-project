package com.example.zenve_vet.feed.controller;

import com.example.zenve_vet.auth.AppUser;
import com.example.zenve_vet.auth.AuthException;
import com.example.zenve_vet.auth.AuthService;
import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.feed.dto.*;
import com.example.zenve_vet.feed.model.PostType;
import com.example.zenve_vet.feed.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final String TOKEN = "X-Auth-Token";

    private final PostService postService;
    private final AuthService authService;

    public PostController(PostService postService, AuthService authService) {
        this.postService = postService;
        this.authService = authService;
    }

    @GetMapping
    public PageResponse<PostResponse> list(@RequestParam(defaultValue = "for-you") String tab,
                                           @RequestParam(defaultValue = "") String specialty,
                                           @RequestParam(defaultValue = "") String state,
                                           @RequestParam(defaultValue = "") String city,
                                           @RequestParam(required = false) PostType type,
                                           @RequestParam(required = false) Long authorId,
                                           @RequestParam(required = false) Long viewerId,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        return postService.list(tab, specialty, state, city, type, authorId, viewerId, page, size);
    }

    @GetMapping("/stories")
    public List<StoryResponse> stories() {
        return postService.stories();
    }

    @GetMapping("/saved")
    public PageResponse<PostResponse> saved(@RequestHeader(value = TOKEN, required = false) String token,
                                            @RequestParam Long vetId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        authService.requireOwner(token, vetId);
        return postService.savedPosts(vetId, page, size);
    }

    @GetMapping("/{id}")
    public PostResponse get(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        return postService.get(id, viewerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse create(@RequestHeader(value = TOKEN, required = false) String token,
                               @Valid @RequestBody PostRequest request) {
        authService.requireOwner(token, request.authorId());
        return postService.create(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = TOKEN, required = false) String token, @PathVariable Long id) {
        AppUser user = authService.requireUser(token);
        PostResponse post = postService.get(id, null);
        if (user.getVetId() == null || !user.getVetId().equals(post.author().id())) {
            throw new AuthException(HttpStatus.FORBIDDEN, "You can delete only your own posts.");
        }
        postService.delete(id);
    }

    @PostMapping("/{id}/view")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void view(@PathVariable Long id) {
        postService.addView(id);
    }

    @PostMapping("/{id}/appreciate")
    public ReactionResponse appreciate(@RequestHeader(value = TOKEN, required = false) String token,
                                       @PathVariable Long id,
                                       @Valid @RequestBody ReactRequest request) {
        authService.requireOwner(token, request.vetId());
        return postService.appreciate(id, request.vetId());
    }

    @DeleteMapping("/{id}/appreciate")
    public ReactionResponse unappreciate(@RequestHeader(value = TOKEN, required = false) String token,
                                         @PathVariable Long id,
                                         @RequestParam Long vetId) {
        authService.requireOwner(token, vetId);
        return postService.removeAppreciation(id, vetId);
    }

    @PostMapping("/{id}/save")
    public SaveResponse save(@RequestHeader(value = TOKEN, required = false) String token,
                             @PathVariable Long id,
                             @Valid @RequestBody ReactRequest request) {
        authService.requireOwner(token, request.vetId());
        return postService.save(id, request.vetId());
    }

    @DeleteMapping("/{id}/save")
    public SaveResponse unsave(@RequestHeader(value = TOKEN, required = false) String token,
                               @PathVariable Long id,
                               @RequestParam Long vetId) {
        authService.requireOwner(token, vetId);
        return postService.unsave(id, vetId);
    }

    @GetMapping("/{id}/comments")
    public List<CommentResponse> comments(@PathVariable Long id) {
        return postService.comments(id);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(@RequestHeader(value = TOKEN, required = false) String token,
                                      @PathVariable Long id,
                                      @Valid @RequestBody CommentRequest request) {
        authService.requireOwner(token, request.authorId());
        return postService.addComment(id, request);
    }

    @PostMapping("/{id}/share")
    public ShareResponse share(@PathVariable Long id) {
        return postService.share(id);
    }
}