package com.dtached.dtached.service;

import com.dtached.dtached.model.*;
import com.dtached.dtached.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InviteService {

    private final TeamInviteRepository teamInviteRepository;
    private final TeamStaffRepository teamStaffRepository;
    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final TeamRequestRepository teamRequestRepository;

    /**
     * Coach sends an invite to a specific email for their team.
     */
    @Transactional
    public TeamInvite sendInvite(String coachEmail, Long teamId, String playerEmail) {
        User coach = userRepository.findByEmail(coachEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamStaff staff = teamStaffRepository.findByUserId(coach.getId())
                .stream()
                .filter(s -> s.getTeam().getId().equals(teamId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("You are not staff on this team"));

        Team team = staff.getTeam();
        if (!"APPROVED".equals(team.getStatus())) {
            throw new IllegalStateException("Team must be approved before sending invites");
        }

        String code = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        TeamInvite invite = teamInviteRepository.save(TeamInvite.builder()
                .team(team)
                .inviteCode(code)
                .email(playerEmail != null ? playerEmail.trim().toLowerCase() : null)
                .status("PENDING")
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build());

        System.out.println("[INVITE] Code: " + code + " | Team: " + team.getName()
                + " | Email: " + playerEmail);

        return invite;
    }

    /**
     * Player accepts an invite code — creates a PENDING request for admin approval.
     * If player is already on a team, creates a TRANSFER request instead.
     */
    @Transactional
    public String acceptInvite(String playerEmail, String code) {
        TeamInvite invite = teamInviteRepository.findByInviteCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        if (!"PENDING".equals(invite.getStatus())) {
            throw new IllegalStateException("This invite has already been " + invite.getStatus().toLowerCase());
        }

        if (invite.getExpiresAt() != null && invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            invite.setStatus("EXPIRED");
            teamInviteRepository.save(invite);
            throw new IllegalStateException("This invite has expired");
        }

        if (invite.getEmail() != null && !invite.getEmail().equalsIgnoreCase(playerEmail)) {
            throw new IllegalStateException("This invite is not for your email");
        }

        User user = userRepository.findByEmail(playerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("You need a player profile first. Register as a player."));

        Team targetTeam = invite.getTeam();

        // Check roster lock
        if (Boolean.TRUE.equals(targetTeam.getRosterLocked())) {
            throw new IllegalStateException("This team's roster is locked. No new players can join.");
        }

        // Determine if this is a JOIN or TRANSFER
        boolean isTransfer = player.getTeam() != null;
        String requestType = isTransfer ? "TRANSFER" : "JOIN";

        TeamRequest request = TeamRequest.builder()
                .team(targetTeam)
                .player(player)
                .fromTeam(isTransfer ? player.getTeam() : null)
                .direction("PLAYER_TO_TEAM")
                .requestType(requestType)
                .status("PENDING")
                .build();

        teamRequestRepository.save(request);

        if (isTransfer) {
            player.setStatus("PENDING_TRANSFER");
            playerRepository.save(player);
        }

        invite.setStatus("USED");
        teamInviteRepository.save(invite);

        return "Request submitted for " + targetTeam.getName() + ". Awaiting coach approval.";
    }

    /**
     * Get all invites for a team (coach view).
     */
    public List<TeamInvite> getTeamInvites(String coachEmail, Long teamId) {
        User coach = userRepository.findByEmail(coachEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        teamStaffRepository.findByUserId(coach.getId())
                .stream()
                .filter(s -> s.getTeam().getId().equals(teamId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("You are not staff on this team"));

        return teamInviteRepository.findByTeamId(teamId);
    }
}
