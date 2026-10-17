package com.example.zenve_vet.community.repository;

import com.example.zenve_vet.community.model.CommunityMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {

    Optional<CommunityMember> findByCommunityIdAndVetId(Long communityId, Long vetId);

    List<CommunityMember> findByVetIdAndStatus(Long vetId, String status);

    List<CommunityMember> findByCommunityIdAndStatus(Long communityId, String status);

    int countByCommunityIdAndStatus(Long communityId, String status);
}