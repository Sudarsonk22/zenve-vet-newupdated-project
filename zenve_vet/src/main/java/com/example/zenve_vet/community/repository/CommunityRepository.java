package com.example.zenve_vet.community.repository;

import com.example.zenve_vet.community.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityRepository extends JpaRepository<Community, Long> {
}