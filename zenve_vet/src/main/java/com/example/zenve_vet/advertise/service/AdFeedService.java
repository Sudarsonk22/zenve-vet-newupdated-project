package com.example.zenve_vet.advertise.service;

import com.example.zenve_vet.advertise.dto.AdFeedDtos.*;
import com.example.zenve_vet.advertise.model.AdComment;
import com.example.zenve_vet.advertise.model.Campaign;
import com.example.zenve_vet.advertise.repository.AdCommentRepository;
import com.example.zenve_vet.advertise.repository.AdFeedRepository;
import com.example.zenve_vet.auth.AppUser;
import com.example.zenve_vet.auth.AuthException;
import com.example.zenve_vet.auth.AuthService;
import com.example.zenve_vet.vetnetwork.model.VetProfile;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class AdFeedService {

    private final AdFeedRepository ads;
    private final AdCommentRepository comments;
    private final VetRepository vets;
    private final AuthService auth;

    public AdFeedService(AdFeedRepository ads, AdCommentRepository comments,
                         VetRepository vets, AuthService auth) {
        this.ads = ads;
        this.comments = comments;
        this.vets = vets;
        this.auth = auth;
    }

    public List<AdResponse> feed() {
        List<AdResponse> list = new ArrayList<>();
        for (Campaign c : ads.findLive(LocalDateTime.now())) {
            list.add(new AdResponse(c.getId(), c.getAdvertiser().getBrandName(), c.getHeadline(),
                    c.getButtonText(), c.getDestinationUrl(), c.getPosterUrl(),
                    comments.countByCampaignId(c.getId())));
        }
        return list;
    }

    public void view(Long id) {
        ads.addView(id);
    }

    public void click(Long id) {
        ads.addClick(id);
    }

    public List<AdCommentResponse> comments(Long id) {
        requireAd(id);
        List<AdCommentResponse> list = new ArrayList<>();
        for (AdComment c : comments.findByCampaignIdOrderByIdAsc(id)) {
            list.add(toResponse(c));
        }
        return list;
    }

    public AdCommentResponse addComment(String token, Long id, String body) {
        AppUser user = auth.requireUser(token);
        if (user.getVetId() == null) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Create your professional page first.");
        }
        requireAd(id);

        String text = body == null ? "" : body.trim();
        if (text.isEmpty()) {
            throw new IllegalArgumentException("Write a comment first.");
        }

        AdComment comment = new AdComment();
        comment.setCampaignId(id);
        comment.setVetId(user.getVetId());
        comment.setBody(text);
        comments.save(comment);
        return toResponse(comment);
    }

    private void requireAd(Long id) {
        if (!ads.existsById(id)) {
            throw new IllegalArgumentException("Ad not found.");
        }
    }

    private AdCommentResponse toResponse(AdComment c) {
        VetProfile v = vets.findById(c.getVetId()).orElse(null);
        String name = v == null ? "Doctor" : v.getFullName();
        String image = v == null ? "" : v.getAvatarUrl();
        return new AdCommentResponse(c.getId(), c.getVetId(), name, image, c.getBody(), c.getCreatedAt());
    }
}