package com.example.zenve_vet.search;

import com.example.zenve_vet.feed.dto.PostResponse;
import com.example.zenve_vet.vetnetwork.dto.VetResponse;

import java.util.List;


public record SearchResponse(
        String query,
        Counts counts,
        List<VetResponse> doctors,
        List<PostResponse> posts,
        int page,
        int size,
        long totalElements,
        int totalPages
) {


    public record Counts(long all, long doctors, long cases, long storiesAndVideos, long posts) {
    }
}
