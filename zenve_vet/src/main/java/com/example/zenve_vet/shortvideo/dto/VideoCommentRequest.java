package com.example.zenve_vet.shortvideo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public record VideoCommentRequest(@NotBlank @Size(max = 1000) String content) {
}
