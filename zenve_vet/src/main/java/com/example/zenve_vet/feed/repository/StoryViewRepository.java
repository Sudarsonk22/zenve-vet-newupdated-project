package com.example.zenve_vet.feed.repository;

import com.example.zenve_vet.feed.model.StoryView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoryViewRepository extends JpaRepository<StoryView, Long> {

    boolean existsByPostIdAndViewerId(Long postId, Long viewerId);

    List<StoryView> findByPostIdOrderByViewedAtDesc(Long postId);
}