package com.example.zenve_vet.community.service;

import com.example.zenve_vet.auth.AppUser;
import com.example.zenve_vet.auth.AuthException;
import com.example.zenve_vet.auth.AuthService;
import com.example.zenve_vet.community.dto.CommunityDtos.*;
import com.example.zenve_vet.community.model.Community;
import com.example.zenve_vet.community.model.CommunityMember;
import com.example.zenve_vet.community.model.CommunityMessage;
import com.example.zenve_vet.community.repository.CommunityMemberRepository;
import com.example.zenve_vet.community.repository.CommunityMessageRepository;
import com.example.zenve_vet.community.repository.CommunityRepository;
import com.example.zenve_vet.vetnetwork.model.VetProfile;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class CommunityService {

    private final CommunityRepository communities;
    private final CommunityMemberRepository members;
    private final CommunityMessageRepository messages;
    private final VetRepository vets;
    private final AuthService auth;

    public CommunityService(CommunityRepository communities, CommunityMemberRepository members,
                            CommunityMessageRepository messages, VetRepository vets, AuthService auth) {
        this.communities = communities;
        this.members = members;
        this.messages = messages;
        this.vets = vets;
        this.auth = auth;
    }

    public CommunityResponse create(String token, CreateRequest req) {
        Long me = meId(token);
        String name = req.name() == null ? "" : req.name().trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Please enter a community name.");
        }

        Community community = new Community();
        community.setName(name);
        community.setCategory(req.category() == null ? "" : req.category().trim());
        community.setDescription(req.description() == null ? "" : req.description().trim());
        community.setImageUrl(req.imageUrl());
        community.setCreatorId(me);
        communities.save(community);

        CommunityMember admin = new CommunityMember();
        admin.setCommunityId(community.getId());
        admin.setVetId(me);
        admin.setRole("ADMIN");
        admin.setStatus("JOINED");
        members.save(admin);

        return toResponse(community, me);
    }

    // every community, each one with my own status (JOINED, REQUESTED, INVITED or NONE)
    public List<CommunityResponse> list(String token) {
        Long me = meId(token);
        List<CommunityResponse> list = new ArrayList<>();
        for (Community c : communities.findAll()) {
            list.add(toResponse(c, me));
        }
        Collections.reverse(list);
        return list;
    }

    public DetailResponse detail(String token, Long id) {
        Long me = meId(token);
        requireJoined(id, me);
        Community community = find(id);

        List<MemberResponse> list = new ArrayList<>();
        for (CommunityMember m : members.findByCommunityIdAndStatus(id, "JOINED")) {
            vets.findById(m.getVetId()).ifPresent(v ->
                    list.add(new MemberResponse(v.getId(), v.getFullName(), v.getSpecialty(),
                            v.getAvatarUrl(), m.getRole(), v.isOnline())));
        }
        return new DetailResponse(toResponse(community, me), list);
    }

    // a doctor asks to join
    public void join(String token, Long id) {
        Long me = meId(token);
        find(id);
        if (members.findByCommunityIdAndVetId(id, me).isPresent()) {
            throw new IllegalArgumentException("You already have a request or invite for this community.");
        }
        CommunityMember m = new CommunityMember();
        m.setCommunityId(id);
        m.setVetId(me);
        m.setRole("MEMBER");
        m.setStatus("REQUESTED");
        members.save(m);
    }

    // join requests waiting for me, for the communities where I am admin
    public List<RequestResponse> requests(String token) {
        Long me = meId(token);
        List<RequestResponse> list = new ArrayList<>();
        for (CommunityMember mine : members.findByVetIdAndStatus(me, "JOINED")) {
            if (!"ADMIN".equals(mine.getRole())) continue;
            Community c = find(mine.getCommunityId());
            for (CommunityMember m : members.findByCommunityIdAndStatus(c.getId(), "REQUESTED")) {
                vets.findById(m.getVetId()).ifPresent(v ->
                        list.add(new RequestResponse(c.getId(), c.getName(), v.getId(), v.getFullName(),
                                v.getSpecialty(), v.getAvatarUrl(), m.getCreatedAt())));
            }
        }
        return list;
    }

    public void answerRequest(String token, Long id, Long vetId, boolean accept) {
        Long me = meId(token);
        requireAdmin(id, me);
        CommunityMember m = members.findByCommunityIdAndVetId(id, vetId)
                .filter(x -> "REQUESTED".equals(x.getStatus()))
                .orElseThrow(() -> new IllegalArgumentException("Request not found."));
        if (accept) {
            m.setStatus("JOINED");
            members.save(m);
        } else {
            members.delete(m);
        }
    }

    // admin invites a doctor
    public void invite(String token, Long id, Long vetId) {
        Long me = meId(token);
        requireAdmin(id, me);
        if (vetId == null || !vets.existsById(vetId)) {
            throw new IllegalArgumentException("Doctor not found.");
        }
        if (members.findByCommunityIdAndVetId(id, vetId).isPresent()) {
            throw new IllegalArgumentException("This doctor is already invited or a member.");
        }

        CommunityMember invited = new CommunityMember();
        invited.setCommunityId(id);
        invited.setVetId(vetId);
        invited.setRole("MEMBER");
        invited.setStatus("INVITED");
        members.save(invited);
    }

    // the invited doctor accepts
    public void accept(String token, Long id) {
        Long me = meId(token);
        CommunityMember m = members.findByCommunityIdAndVetId(id, me)
                .filter(x -> "INVITED".equals(x.getStatus()))
                .orElseThrow(() -> new IllegalArgumentException("No invite found."));
        m.setStatus("JOINED");
        members.save(m);
    }

    // the invited doctor declines, or a doctor cancels his own join request
    public void decline(String token, Long id) {
        Long me = meId(token);
        members.findByCommunityIdAndVetId(id, me)
                .filter(x -> !"JOINED".equals(x.getStatus()))
                .ifPresent(members::delete);
    }

    public void leave(String token, Long id) {
        Long me = meId(token);
        CommunityMember m = requireJoined(id, me);
        if ("ADMIN".equals(m.getRole())) {
            throw new IllegalArgumentException("The admin cannot leave the community.");
        }
        members.delete(m);
    }

    public List<MessageResponse> messages(String token, Long id, Long after) {
        Long me = meId(token);
        requireJoined(id, me);

        List<CommunityMessage> list;
        if (after == null || after <= 0) {
            list = new ArrayList<>(messages.findTop100ByCommunityIdOrderByIdDesc(id));
            Collections.reverse(list);
        } else {
            list = messages.findByCommunityIdAndIdGreaterThanOrderByIdAsc(id, after);
        }

        List<MessageResponse> result = new ArrayList<>();
        for (CommunityMessage m : list) {
            result.add(toMessage(m));
        }
        return result;
    }

    public MessageResponse send(String token, Long id, String body) {
        Long me = meId(token);
        requireJoined(id, me);
        String text = body == null ? "" : body.trim();
        if (text.isEmpty()) {
            throw new IllegalArgumentException("Type a message first.");
        }

        CommunityMessage m = new CommunityMessage();
        m.setCommunityId(id);
        m.setSenderId(me);
        m.setBody(text);
        messages.save(m);
        return toMessage(m);
    }

    private Long meId(String token) {
        AppUser user = auth.requireUser(token);
        if (user.getVetId() == null) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Create your professional page first.");
        }
        return user.getVetId();
    }

    private Community find(Long id) {
        return communities.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Community not found."));
    }

    private CommunityMember requireJoined(Long id, Long vetId) {
        return members.findByCommunityIdAndVetId(id, vetId)
                .filter(m -> "JOINED".equals(m.getStatus()))
                .orElseThrow(() -> new AuthException(HttpStatus.FORBIDDEN, "You are not a member of this community."));
    }

    private void requireAdmin(Long id, Long vetId) {
        CommunityMember m = requireJoined(id, vetId);
        if (!"ADMIN".equals(m.getRole())) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Only the community admin can do this.");
        }
    }

    private CommunityResponse toResponse(Community c, Long me) {
        List<CommunityMember> joined = members.findByCommunityIdAndStatus(c.getId(), "JOINED");
        int online = 0;
        for (CommunityMember m : joined) {
            if (vets.findById(m.getVetId()).map(VetProfile::isOnline).orElse(false)) {
                online++;
            }
        }

        String status = "NONE";
        String role = "";
        CommunityMember mine = members.findByCommunityIdAndVetId(c.getId(), me).orElse(null);
        if (mine != null) {
            status = mine.getStatus();
            role = mine.getRole();
        }
        String creator = vets.findById(c.getCreatorId()).map(VetProfile::getFullName).orElse("Doctor");
        return new CommunityResponse(c.getId(), c.getName(), c.getCategory(), c.getDescription(),
                c.getImageUrl(), joined.size(), creator, status, role, online);
    }

    private MessageResponse toMessage(CommunityMessage m) {
        VetProfile v = vets.findById(m.getSenderId()).orElse(null);
        String name = v == null ? "Doctor" : v.getFullName();
        String image = v == null ? "" : v.getAvatarUrl();
        return new MessageResponse(m.getId(), m.getSenderId(), name, image, m.getBody(), m.getCreatedAt());
    }
}