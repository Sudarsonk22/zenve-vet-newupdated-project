package com.example.zenve_vet.messaging.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "message_attachments")
public class MessageAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private Message message;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "content_type", length = 120)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long size;


    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected MessageAttachment() {
    }

    public MessageAttachment(String fileName, String contentType, long size, String storagePath) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.size = size;
        this.storagePath = storagePath;
    }

    public Long getId() { return id; }
    public Message getMessage() { return message; }
    public void setMessage(Message message) { this.message = message; }
    public String getFileName() { return fileName; }
    public String getContentType() { return contentType; }
    public long getSize() { return size; }
    public String getStoragePath() { return storagePath; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
