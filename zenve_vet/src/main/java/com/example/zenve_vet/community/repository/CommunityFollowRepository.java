package com.example.zenve_vet.community.repository;

import com.example.zenve_vet.vetnetwork.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommunityFollowRepository extends JpaRepository<Follow, Long> {

    @Query("select count(f) > 0 from Follow f "
            + "where ((f.follower.id = :a and f.following.id = :b) or (f.follower.id = :b and f.following.id = :a)) "
            + "and (f.status is null or f.status = 'ACCEPTED')")
    boolean connected(@Param("a") Long a, @Param("b") Long b);
}