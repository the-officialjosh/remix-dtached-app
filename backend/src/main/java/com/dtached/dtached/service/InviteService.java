package com.dtached.dtached.service;

import com.dtached.dtached.model.Player;
import com.dtached.dtached.model.Team;
import com.dtached.dtached.model.TeamInvite;
import com.dtached.dtached.model.TeamStaff;
import com.dtached.dtached.model.User;
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

    /**
     * Coach sends an invite to a specific email for their team.
     */
    @Transactional
    public TeamInvite sendInvite(String coachEmail, Long teamId, String playerEmail) {
        User coach = userRepository.findByEmail(coachEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify coach is on this team's staff
        TeamStaff staff = teamStaffRepository.findByUserId(coach.getId())
                .stream()
                .filter(s -> s.getTeam().getId().equals(teamId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("You are not staff on this team"));

        Team team = staff.getTeam();
        if (!"APPROVED".equals(team.getStatus())) {
            throw new IllegalStateException("Team must be approved before sending invites");
        }

        // Generate unique invite code
        String code = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        TeamInvite invite = teamInviteRepository.save(TeamInvite.builder()
                .team(team)
                .inviteCode(code)
                .email(playerEmail != null ? playerEmail.trim().toLowerCase() : null)
                .status("PENDING")
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build());

        // TODO: Send email via SendGrid when configured
        System.out.println("[INVITE] Code: " + code + " | Team: " + team.getName()
                + " | Email: " + playerEmail);

        return invite;
    }

    /**
     * Player accepts an invite code — joins the team.
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

        // If invite has an email, verify it matches
        if (invite.getEmail() != null && !invite.getEmail().equalsIgnoreCase(playerEmail)) {
            throw new IllegalStateException("This invite is not for your email");
        }

        User user = userRepository.findByEmail(playerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("You need a player profile first. Register as a player."));

        if (player.getTeam() != null) {
            throw new IllegalStateException("You are already on a team");
        }

        // Join the team
        player.setTeam(invite.getTeam());
        player.setStatus("ON_TEAM");
        playerRepository.save(player);

        invite.setStatus("ACCEPTED");
        teamInviteRepository.save(invite);

        return invite.getTeam().getName();
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
