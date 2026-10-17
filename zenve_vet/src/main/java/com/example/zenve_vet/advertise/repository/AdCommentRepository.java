package com.example.zenve_vet.advertise.repository;

import com.example.zenve_vet.advertise.model.AdComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdCommentRepository extends JpaRepository<AdComment, Long> {

    List<AdComment> findByCampaignIdOrderByIdAsc(Long campaignId);

    int countByCampaignId(Long campaignId);
}