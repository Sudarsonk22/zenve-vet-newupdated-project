package com.example.zenve_vet.feed.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "story_views",
        uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "viewer_id"}))
public class StoryView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "viewer_id", nullable = false)
    private Long viewerId;

    private LocalDateTime viewedAt = LocalDateTime.now();

    public StoryView() {
    }

    public StoryView(Long postId, Long viewerId) {
        this.postId = postId;
        this.viewerId = viewerId;
    }

    public Long getId() { return id; }
    public Long getPostId() { return postId; }
    public Long getViewerId() { return viewerId; }
    public LocalDateTime getViewedAt() { return viewedAt; }
}