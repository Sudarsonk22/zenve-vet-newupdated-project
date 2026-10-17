package com.example.zenve_vet.shortvideo.controller;

import com.example.zenve_vet.shortvideo.service.ShortVideoService;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import com.example.zenve_vet.vetnetwork.service.VetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api")
public class MetaController {

    private final ShortVideoService videoService;
    private final VetRepository vetRepository;
    private final VetService vetService;

    public MetaController(ShortVideoService videoService, VetRepository vetRepository, VetService vetService) {
        this.videoService = videoService;
        this.vetRepository = vetRepository;
        this.vetService = vetService;
    }

    @GetMapping("/meta/specialties")
    public List<String> specialties() {
        return vetRepository.findSpecialties();
    }

    @GetMapping("/meta/animal-types")
    public List<String> animalTypes() {
        return videoService.animalTypes();
    }


    @PostMapping("/users/{id}/follow")
    public void follow(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        vetService.follow(id, viewerId);
    }

    @DeleteMapping("/users/{id}/follow")
    public void unfollow(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        vetService.unfollow(id, viewerId);
    }
}
