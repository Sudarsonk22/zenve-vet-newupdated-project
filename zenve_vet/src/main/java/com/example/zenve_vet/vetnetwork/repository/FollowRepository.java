package com.example.zenve_vet.vetnetwork.repository;

import com.example.zenve_vet.vetnetwork.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollower_IdAndFollowing_Id(Long followerId, Long followingId);

    void deleteByFollower_IdOrFollowing_Id(Long followerId, Long followingId);

    @Query("select count(f) > 0 from Follow f where f.follower.id = :followerId and f.following.id = :followingId "
            + "and (f.status is null or f.status = 'ACCEPTED')")
    boolean existsByFollower_IdAndFollowing_Id(@Param("followerId") Long followerId,
                                               @Param("followingId") Long followingId);

    @Query("select count(f) from Follow f where f.following.id = :vetId and (f.status is null or f.status = 'ACCEPTED')")
    long countByFollowing_Id(@Param("vetId") Long vetId);

    @Query("select count(f) from Follow f where f.follower.id = :vetId and (f.status is null or f.status = 'ACCEPTED')")
    long countByFollower_Id(@Param("vetId") Long vetId);

    @Query("select f from Follow f where f.following.id = :vetId and (f.status is null or f.status = 'ACCEPTED')")
    List<Follow> findByFollowing_Id(@Param("vetId") Long vetId);

    @Query("select f from Follow f where f.follower.id = :vetId and (f.status is null or f.status = 'ACCEPTED')")
    List<Follow> findByFollower_Id(@Param("vetId") Long vetId);

    @Query("select count(f) > 0 from Follow f where f.follower.id = :followerId and f.following.id = :followingId "
            + "and f.status = 'PENDING'")
    boolean hasPendingRequest(@Param("followerId") Long followerId, @Param("followingId") Long followingId);

    @Query("select f from Follow f where f.following.id = :vetId and f.status = 'PENDING'")
    List<Follow> findPendingRequests(@Param("vetId") Long vetId);

    @Query("select count(f) > 0 from Follow f where ((f.follower.id = :a and f.following.id = :b) "
            + "or (f.follower.id = :b and f.following.id = :a)) and (f.status is null or f.status = 'ACCEPTED')")
    boolean areConnected(@Param("a") Long a, @Param("b") Long b);
}