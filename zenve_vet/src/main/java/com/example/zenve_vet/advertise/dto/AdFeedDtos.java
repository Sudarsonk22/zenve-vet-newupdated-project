package com.example.zenve_vet.advertise.dto;

import java.time.LocalDateTime;

public class AdFeedDtos {

    public record AdResponse(Long id, String brandName, String headline, String buttonText,
                             String destinationUrl, String posterUrl, int commentCount) {}

    public record AdCommentRequest(String body) {}

    public record AdCommentResponse(Long id, Long vetId, String name, String image,
                                    String body, LocalDateTime createdAt) {}
}