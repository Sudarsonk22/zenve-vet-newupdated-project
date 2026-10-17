package com.example.zenve_vet.advertise.repository;

import com.example.zenve_vet.advertise.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AdFeedRepository extends JpaRepository<Campaign, Long> {

    // approved by the team and running right now
    @Query("select c from Campaign c where c.status = 'APPROVED' "
            + "and c.startsAt <= :now and (c.endsAt is null or c.endsAt > :now) "
            + "order by c.createdAt desc")
    List<Campaign> findLive(@Param("now") LocalDateTime now);

    @Modifying
    @Query("update Campaign c set c.views = c.views + 1 where c.id = :id")
    int addView(@Param("id") Long id);

    @Modifying
    @Query("update Campaign c set c.clicks = c.clicks + 1 where c.id = :id")
    int addClick(@Param("id") Long id);
}