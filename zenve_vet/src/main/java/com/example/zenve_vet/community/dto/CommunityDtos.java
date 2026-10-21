package com.example.zenve_vet.community.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CommunityDtos {

    public record CreateRequest(String name, String category, String description, String imageUrl) {}

    public record InviteRequest(Long vetId) {}

    public record MessageRequest(String body) {}

    // status is JOINED, REQUESTED, INVITED or NONE (my relation to this community)
    // inviteCode is filled only for the admin
    public record CommunityResponse(Long id, String name, String category, String description, String imageUrl,
                                    int memberCount, String creatorName, String status, String role,
                                    int onlineCount, String inviteCode) {}

    public record MemberResponse(Long vetId, String name, String specialty, String imageUrl, String role,
                                 boolean online) {}

    public record DetailResponse(CommunityResponse community, List<MemberResponse> members) {}

    public record RequestResponse(Long communityId, String communityName, Long vetId, String name,
                                  String specialty, String imageUrl, LocalDateTime createdAt) {}

    public record MessageResponse(Long id, Long senderId, String senderName, String senderImage,
                                  String body, LocalDateTime createdAt) {}
}