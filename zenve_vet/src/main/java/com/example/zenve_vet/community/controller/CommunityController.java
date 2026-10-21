package com.example.zenve_vet.community.controller;

import com.example.zenve_vet.community.dto.CommunityDtos.*;
import com.example.zenve_vet.community.service.CommunityService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    private static final String TOKEN = "X-Auth-Token";

    private final CommunityService service;

    public CommunityController(CommunityService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommunityResponse create(@RequestHeader(value = TOKEN, required = false) String token,
                                    @RequestBody CreateRequest request) {
        return service.create(token, request);
    }

    @GetMapping
    public List<CommunityResponse> list(@RequestHeader(value = TOKEN, required = false) String token) {
        return service.list(token);
    }

    @GetMapping("/requests")
    public List<RequestResponse> requests(@RequestHeader(value = TOKEN, required = false) String token) {
        return service.requests(token);
    }

    @GetMapping("/invite-link/{code}")
    public CommunityResponse linkPreview(@RequestHeader(value = TOKEN, required = false) String token,
                                         @PathVariable String code) {
        return service.linkPreview(token, code);
    }

    @PostMapping("/invite-link/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void joinByLink(@RequestHeader(value = TOKEN, required = false) String token,
                           @PathVariable String code) {
        service.joinByLink(token, code);
    }

    @GetMapping("/{id}")
    public DetailResponse detail(@RequestHeader(value = TOKEN, required = false) String token,
                                 @PathVariable Long id) {
        return service.detail(token, id);
    }

    @PostMapping("/{id}/join")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void join(@RequestHeader(value = TOKEN, required = false) String token, @PathVariable Long id) {
        service.join(token, id);
    }

    @PostMapping("/{id}/requests/{vetId}/accept")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void acceptRequest(@RequestHeader(value = TOKEN, required = false) String token,
                              @PathVariable Long id, @PathVariable Long vetId) {
        service.answerRequest(token, id, vetId, true);
    }

    @PostMapping("/{id}/requests/{vetId}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rejectRequest(@RequestHeader(value = TOKEN, required = false) String token,
                              @PathVariable Long id, @PathVariable Long vetId) {
        service.answerRequest(token, id, vetId, false);
    }

    @PostMapping("/{id}/invite")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void invite(@RequestHeader(value = TOKEN, required = false) String token,
                       @PathVariable Long id, @RequestBody InviteRequest request) {
        service.invite(token, id, request.vetId());
    }

    @PostMapping("/{id}/accept")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void accept(@RequestHeader(value = TOKEN, required = false) String token, @PathVariable Long id) {
        service.accept(token, id);
    }

    @PostMapping("/{id}/decline")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void decline(@RequestHeader(value = TOKEN, required = false) String token, @PathVariable Long id) {
        service.decline(token, id);
    }

    @PostMapping("/{id}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leave(@RequestHeader(value = TOKEN, required = false) String token, @PathVariable Long id) {
        service.leave(token, id);
    }

    @GetMapping("/{id}/messages")
    public List<MessageResponse> messages(@RequestHeader(value = TOKEN, required = false) String token,
                                          @PathVariable Long id,
                                          @RequestParam(defaultValue = "0") Long after) {
        return service.messages(token, id, after);
    }

    @PostMapping("/{id}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse send(@RequestHeader(value = TOKEN, required = false) String token,
                                @PathVariable Long id, @RequestBody MessageRequest request) {
        return service.send(token, id, request.body());
    }
}