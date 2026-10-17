package com.example.zenve_vet.messaging.repository;

import com.example.zenve_vet.messaging.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {


    @Query("""
            select c from Conversation c
            where c.vetLow.id = :low and c.vetHigh.id = :high
            """)
    Optional<Conversation> findByPair(@Param("low") Long low, @Param("high") Long high);


    @Query("""
            select distinct c from Conversation c
            join fetch c.vetLow
            join fetch c.vetHigh
            where c.vetLow.id = :vetId or c.vetHigh.id = :vetId
            order by c.lastMessageAt desc
            """)
    List<Conversation> findForVet(@Param("vetId") Long vetId);
}
