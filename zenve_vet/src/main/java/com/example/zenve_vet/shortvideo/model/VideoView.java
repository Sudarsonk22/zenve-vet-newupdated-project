package com.example.zenve_vet.shortvideo.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(
        name = "short_video_views",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_video_view", columnNames = {"video_id", "vet_id"})
)
public class VideoView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "video_id")
    private ShortVideo video;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vet_id")
    private VetProfile vet;

    @Column(name = "watched_at", nullable = false)
    private LocalDateTime watchedAt = LocalDateTime.now();

    protected VideoView() {
    }

    public VideoView(ShortVideo video, VetProfile vet) {
        this.video = video;
        this.vet = vet;
    }

    public Long getId() { return id; }
    public ShortVideo getVideo() { return video; }
    public VetProfile getVet() { return vet; }
    public LocalDateTime getWatchedAt() { return watchedAt; }
    public void setWatchedAt(LocalDateTime watchedAt) { this.watchedAt = watchedAt; }
}
