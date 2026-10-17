package com.example.zenve_vet.shortvideo.dto;


public record CountResponse(long likeCount, long shareCount, boolean liked, boolean saved) {
}
