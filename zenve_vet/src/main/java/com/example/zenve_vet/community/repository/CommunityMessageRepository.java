package com.example.zenve_vet.community.repository;

import com.example.zenve_vet.community.model.CommunityMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityMessageRepository extends JpaRepository<CommunityMessage, Long> {

    List<CommunityMessage> findTop100ByCommunityIdOrderByIdDesc(Long communityId);

    List<CommunityMessage> findByCommunityIdAndIdGreaterThanOrderByIdAsc(Long communityId, Long id);
}