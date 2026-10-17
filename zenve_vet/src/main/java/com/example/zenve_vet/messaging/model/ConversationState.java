package com.example.zenve_vet.messaging.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(
        name = "conversation_states",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_conversation_state",
                columnNames = {"conversation_id", "vet_id"})
)
public class ConversationState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vet_id")
    private VetProfile vet;

    @Column(nullable = false)
    private boolean pinned = false;

    @Column(nullable = false)
    private boolean archived = false;


    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

    protected ConversationState() {
    }

    public ConversationState(Conversation conversation, VetProfile vet) {
        this.conversation = conversation;
        this.vet = vet;
    }

    public Long getId() { return id; }
    public Conversation getConversation() { return conversation; }
    public VetProfile getVet() { return vet; }
    public boolean isPinned() { return pinned; }
    public void setPinned(boolean pinned) { this.pinned = pinned; }
    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }
    public LocalDateTime getLastReadAt() { return lastReadAt; }
    public void setLastReadAt(LocalDateTime lastReadAt) { this.lastReadAt = lastReadAt; }
}
