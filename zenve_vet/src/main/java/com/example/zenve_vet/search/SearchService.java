package com.example.zenve_vet.search;

import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.feed.dto.PostResponse;
import com.example.zenve_vet.feed.model.PostType;
import com.example.zenve_vet.feed.service.PostService;
import com.example.zenve_vet.vetnetwork.dto.VetResponse;
import com.example.zenve_vet.vetnetwork.service.VetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class SearchService {


    private static final List<Topic> TOPICS = List.of(
            new Topic("Dermatology", List.of("Veterinary Dermatology")),
            new Topic("Surgery", List.of("Veterinary Surgery")),
            new Topic("Livestock", List.of("Livestock Health", "Large Animal Medicine")),
            new Topic("Equine", List.of("Equine Medicine")),
            new Topic("Imaging", List.of("Diagnostic Imaging", "Veterinary Radiology")),
            new Topic("Nutrition", List.of("Animal Nutrition")),
            new Topic("Wildlife", List.of("Wildlife Medicine", "Wildlife & Exotics")),
            new Topic("Preventive", List.of("Preventive Medicine"))
    );

    private final VetService vetService;
    private final PostService postService;

    public SearchService(VetService vetService, PostService postService) {
        this.vetService = vetService;
        this.postService = postService;
    }

    public List<String> topics() {
        return TOPICS.stream().map(Topic::label).toList();
    }

    @Transactional(readOnly = true)
    public SearchResponse search(String q, String topic, String state, boolean verifiedOnly,
                                 boolean hasTakeaways, String tab, Long viewerId,
                                 int page, int size) {
        String activeTab = tab == null || tab.isBlank() ? "all" : tab.trim().toLowerCase();


        String doctorSpecialty = specialtyFor(topic);

        PageResponse<VetResponse> doctors = vetService.list(
                blank(q), doctorSpecialty, null, state, verifiedOnly,
                0, doctorPageSize(activeTab, size), viewerId);

        long doctorCount = doctors.totalItems();
        long caseCount = postService.countPosts(q, topic, state, hasTakeaways,
                List.of(PostType.CLINICAL_CASE));
        long storyVideoCount = postService.countPosts(q, topic, state, hasTakeaways,
                List.of(PostType.STORY, PostType.SHORT_VIDEO));
        long plainPostCount = postService.countPosts(q, topic, state, hasTakeaways,
                List.of(PostType.POST));
        long allPostCount = caseCount + storyVideoCount + plainPostCount;

        SearchResponse.Counts counts = new SearchResponse.Counts(
                doctorCount + allPostCount, doctorCount, caseCount, storyVideoCount, plainPostCount);


        PageResponse<PostResponse> posts = activeTab.equals("doctors")
                ? new PageResponse<>(List.of(), page, size, 0, 0)
                : postService.searchPosts(q, topic, state, hasTakeaways,
                        typesFor(activeTab), viewerId, page, size);

        return new SearchResponse(
                q == null ? "" : q,
                counts,
                doctors.items(),
                posts.items(),
                posts.page(),
                posts.size(),
                posts.totalItems(),
                posts.totalPages()
        );
    }


    private int doctorPageSize(String tab, int size) {
        return tab.equals("doctors") ? Math.min(Math.max(size, 1), 50) : 6;
    }


    private List<PostType> typesFor(String tab) {
        return switch (tab) {
            case "cases" -> List.of(PostType.CLINICAL_CASE);
            case "stories", "videos", "stories-videos" -> List.of(PostType.STORY, PostType.SHORT_VIDEO);
            default -> List.of();
        };
    }


    private String specialtyFor(String topic) {
        if (topic == null || topic.isBlank()) {
            return null;
        }
        return TOPICS.stream()
                .filter(t -> t.label().equalsIgnoreCase(topic.trim()))
                .findFirst()
                .map(t -> t.specialties().get(0))
                .orElse(null);
    }

    private String blank(String value) {
        return value == null ? null : value.trim();
    }

    private record Topic(String label, List<String> specialties) {
    }
}
