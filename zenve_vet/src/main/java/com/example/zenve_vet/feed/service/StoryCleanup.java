package com.example.zenve_vet.feed.service;

import com.example.zenve_vet.feed.model.Post;
import com.example.zenve_vet.feed.model.PostType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class StoryCleanup {

    private static final String FILE_PREFIX = "/api/videos/files/";

    @PersistenceContext
    private EntityManager entityManager;

    private final Path uploadsRoot;

    public StoryCleanup(@Value("${app.uploads.dir:./uploads}") String uploadsDir) {
        this.uploadsRoot = Paths.get(uploadsDir).toAbsolutePath().normalize();
    }

    // runs 10 seconds after start, then every hour
    @Scheduled(initialDelay = 10000, fixedRate = 3600000)
    @Transactional
    public void removeExpiredStories() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);

        List<Post> expired = entityManager
                .createQuery("select p from Post p where p.type = :type and p.createdAt < :cutoff", Post.class)
                .setParameter("type", PostType.STORY)
                .setParameter("cutoff", cutoff)
                .getResultList();

        for (Post story : expired) {
            String mediaUrl = story.getMediaUrl();
            entityManager.remove(story);
            entityManager.flush();
            deleteFile(mediaUrl);
        }

        if (!expired.isEmpty()) {
            System.out.println("Deleted " + expired.size() + " expired stories");
        }
    }

    private void deleteFile(String mediaUrl) {
        if (mediaUrl == null || !mediaUrl.startsWith(FILE_PREFIX)) {
            return;
        }
        try {
            Path file = uploadsRoot.resolve(mediaUrl.substring(FILE_PREFIX.length())).normalize();
            if (file.startsWith(uploadsRoot)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException e) {
            System.out.println("Could not delete story file: " + e.getMessage());
        }
    }
}