package com.example.zenve_vet.feed.service;

import com.example.zenve_vet.auth.AuthException;
import com.example.zenve_vet.feed.dto.PostResponse;
import com.example.zenve_vet.feed.dto.StoryViewerResponse;
import com.example.zenve_vet.feed.model.StoryView;
import com.example.zenve_vet.feed.repository.StoryViewRepository;
import com.example.zenve_vet.vetnetwork.model.VetProfile;
import com.example.zenve_vet.vetnetwork.repository.FollowRepository;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StoryViewService {

    private final StoryViewRepository views;
    private final PostService postService;
    private final FollowRepository followRepository;
    private final VetRepository vetRepository;

    public StoryViewService(StoryViewRepository views,
                            PostService postService,
                            FollowRepository followRepository,
                            VetRepository vetRepository) {
        this.views = views;
        this.postService = postService;
        this.followRepository = followRepository;
        this.vetRepository = vetRepository;
    }

    @Transactional
    public void record(Long postId, Long viewerId) {
        PostResponse post = postService.get(postId, null);
        Long authorId = post.author().id();

        if (authorId.equals(viewerId)) {
            return;
        }
        if (!followRepository.existsByFollower_IdAndFollowing_Id(viewerId, authorId)) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Follow this doctor to watch their story.");
        }
        if (!views.existsByPostIdAndViewerId(postId, viewerId)) {
            views.save(new StoryView(postId, viewerId));
        }
    }

    @Transactional(readOnly = true)
    public List<StoryViewerResponse> viewers(Long postId) {
        List<StoryView> rows = views.findByPostIdOrderByViewedAtDesc(postId);
        List<Long> ids = rows.stream().map(StoryView::getViewerId).toList();

        Map<Long, VetProfile> byId = new HashMap<>();
        vetRepository.findAllById(ids).forEach(vet -> byId.put(vet.getId(), vet));

        List<StoryViewerResponse> result = new ArrayList<>();
        for (StoryView row : rows) {
            VetProfile vet = byId.get(row.getViewerId());
            if (vet == null) {
                continue;
            }
            result.add(new StoryViewerResponse(
                    vet.getId(), vet.getFullName(), vet.getAvatarUrl(), vet.getSpecialty(), row.getViewedAt()));
        }
        return result;
    }
}