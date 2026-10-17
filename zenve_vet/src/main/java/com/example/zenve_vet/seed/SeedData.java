package com.example.zenve_vet.seed;

import java.util.List;


final class SeedData {

    private SeedData() {
    }

    record VetRow(
            String slug,
            String fullName,
            String specialty,
            String city,
            String state,
            String bio,
            String avatarUrl,
            boolean verified,
            long daysAgo
    ) {
    }

    record ClinicRow(
            String vetSlug,
            String name,
            String location,
            String address,
            String phone,
            String openingHours,
            String services,
            String about,
            String photoUrl
    ) {
    }

    record PostRow(
            String ref,
            String authorSlug,
            String type,
            String category,
            String body,
            String mediaUrl,
            boolean consentReviewed,
            String takeaways,
            String topic,
            int viewCount,
            int appreciationCount,
            int commentCount,
            int shareCount,
            long hoursAgo
    ) {
    }

    record FollowRow(String followerSlug, String followingSlug) {
    }

    record CommentRow(String postRef, String authorSlug, String body, long hoursAgo) {
    }

    record AppreciationRow(String postRef, List<String> vetSlugs) {
    }


    record ConversationRow(
            List<String> participants,
            List<String> pinnedBy,
            List<String> archivedBy,
            List<String> readUpToBy,
            List<MessageRow> messages
    ) {
    }

    record MessageRow(String from, String content, long hoursAgo) {
    }


    record VideoRow(
            String creatorSlug,
            String title,
            String description,
            String videoUrl,
            String thumbnailUrl,
            Integer durationSeconds,
            String category,
            String specialty,
            String animalType,
            String caseType,
            List<String> hashtags,
            int viewCount,
            int shareCount,
            long hoursAgo
    ) {
    }
}
