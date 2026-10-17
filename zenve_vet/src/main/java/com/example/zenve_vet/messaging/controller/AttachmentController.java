package com.example.zenve_vet.messaging.controller;

import com.example.zenve_vet.common.exception.BadRequestException;
import com.example.zenve_vet.messaging.dto.AttachmentResponse;
import com.example.zenve_vet.messaging.model.MessageAttachment;
import com.example.zenve_vet.messaging.service.MessagingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;


@RestController
@RequestMapping("/api/messages/attachments")
public class AttachmentController {


    private static final Set<String> ALLOWED = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif",
            "application/pdf", "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    private final MessagingService messagingService;
    private final Path uploadsRoot;

    public AttachmentController(MessagingService messagingService,
                                @Value("${app.uploads.dir:./uploads}") String uploadsDir) {
        this.messagingService = messagingService;
        this.uploadsRoot = Paths.get(uploadsDir).toAbsolutePath().normalize();
    }

    @PostMapping
    public AttachmentResponse upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was uploaded.");
        }

        String contentType = file.getContentType() == null
                ? "application/octet-stream"
                : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED.contains(contentType)) {
            throw new BadRequestException("That file type is not allowed: " + contentType);
        }

        String original = StringUtils.getFilename(file.getOriginalFilename());
        String label = original == null || original.isBlank() ? "attachment" : original;
        String extension = StringUtils.getFilenameExtension(label);


        String folder = "messages/" + LocalDate.now();
        String stored = UUID.randomUUID() + (extension == null ? "" : "." + extension.toLowerCase(Locale.ROOT));
        String relative = folder + "/" + stored;

        try {
            Path target = uploadsRoot.resolve(relative).normalize();

            if (!target.startsWith(uploadsRoot)) {
                throw new BadRequestException("Invalid upload path.");
            }
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not store the attachment", e);
        }

        MessageAttachment saved = messagingService.saveAttachment(
                new MessageAttachment(label, contentType, file.getSize(), relative));

        return new AttachmentResponse(
                saved.getId(),
                "/api/messages/attachments/" + saved.getId(),
                saved.getFileName(),
                saved.getContentType(),
                saved.getSize()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        MessageAttachment attachment = messagingService.attachment(id);
        Path file = uploadsRoot.resolve(attachment.getStoragePath()).normalize();

        if (!file.startsWith(uploadsRoot) || !Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }

        MediaType type = attachment.getContentType() == null
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType(attachment.getContentType());

        return ResponseEntity.ok()
                .contentType(type)

                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + attachment.getFileName().replace("\"", "") + "\"")
                .body(new FileSystemResource(file));
    }
}
