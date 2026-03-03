package com.dtached.dtached.service;

import com.dtached.dtached.model.Player;
import com.dtached.dtached.model.Team;
import com.dtached.dtached.model.TeamRequest;
import com.dtached.dtached.model.TeamStaff;
import com.dtached.dtached.model.User;
import com.dtached.dtached.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamRequestService {

    private final TeamRequestRepository teamRequestRepository;
    private final TeamStaffRepository teamStaffRepository;
    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;

    /**
     * Coach sends a request to a free-agent player (secondary channel).
     */
    @Transactional
    public TeamRequest sendRequest(String coachEmail, Long playerId) {
        User coach = userRepository.findByEmail(coachEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamStaff staff = teamStaffRepository.findByUserId(coach.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("You are not on any team's staff"));

        Team team = staff.getTeam();

        // Check roster lock
        if (Boolean.TRUE.equals(team.getRosterLocked())) {
            throw new IllegalStateException("Your roster is locked. Unlock it before recruiting.");
        }

        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (!"FREE_AGENT".equals(player.getStatus())) {
            throw new IllegalStateException("Player is already on a team");
        }

        return teamRequestRepository.save(TeamRequest.builder()
                .team(team)
                .player(player)
                .direction("TEAM_TO_PLAYER")
                .status("PENDING")
                .build());
    }

    // ---- Player-facing methods ----

    /**
     * Player views incoming requests (from coaches).
     */
    public List<TeamRequest> getPlayerRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No player profile"));

        return teamRequestRepository.findByPlayerIdAndStatus(player.getId(), "PENDING");
    }

    /**
     * Player accepts a coach-initiated team request — joins the team.
     */
    @Transactional
    public void acceptRequest(String email, Long requestId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No player profile"));

        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getPlayer().getId().equals(player.getId())) {
            throw new IllegalStateException("This request is not for you");
        }

        // Check roster lock
        if (Boolean.TRUE.equals(request.getTeam().getRosterLocked())) {
            throw new IllegalStateException("This team's roster is locked");
        }

        // Accept: join team
        player.setTeam(request.getTeam());
        player.setStatus("ON_TEAM");
        playerRepository.save(player);

        request.setStatus("ACCEPTED");
        teamRequestRepository.save(request);

        // Reject all other pending requests for this player
        teamRequestRepository.findByPlayerIdAndStatus(player.getId(), "PENDING")
                .forEach(r -> {
                    r.setStatus("REJECTED");
                    teamRequestRepository.save(r);
                });
    }

    /**
     * Player rejects a team request.
     */
    @Transactional
    public void rejectRequest(String email, Long requestId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No player profile"));

        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getPlayer().getId().equals(player.getId())) {
            throw new IllegalStateException("This request is not for you");
        }

        request.setStatus("REJECTED");
        teamRequestRepository.save(request);
    }

    // ---- Coach-facing methods (for invite code join approvals) ----

    /**
     * Coach views pending join requests for their team (from invite codes).
     */
    public List<TeamRequest> getCoachPendingRequests(String coachEmail) {
        User coach = userRepository.findByEmail(coachEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamStaff staff = teamStaffRepository.findByUserId(coach.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("You are not on any team's staff"));

        return teamRequestRepository.findByTeamIdAndStatus(staff.getTeam().getId(), "PENDING");
    }

    /**
     * Coach approves a join request — player joins the team.
     */
    @Transactional
    public void coachApproveRequest(String coachEmail, Long requestId) {
        User coach = userRepository.findByEmail(coachEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamStaff staff = teamStaffRepository.findByUserId(coach.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("You are not on any team's staff"));

        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Ensure this request is for the coach's team
        if (!request.getTeam().getId().equals(staff.getTeam().getId())) {
            throw new IllegalStateException("This request is not for your team");
        }

        Player player = request.getPlayer();

        // Set player onto team
        player.setTeam(request.getTeam());
        player.setStatus("ON_TEAM");
        playerRepository.save(player);

        request.setStatus("ACCEPTED");
        teamRequestRepository.save(request);

        // Reject all other pending requests for this player
        teamRequestRepository.findByPlayerIdAndStatus(player.getId(), "PENDING")
                .forEach(r -> {
                    r.setStatus("REJECTED");
                    teamRequestRepository.save(r);
                });
    }

    /**
     * Coach rejects a join request.
     */
    @Transactional
    public void coachRejectRequest(String coachEmail, Long requestId) {
        User coach = userRepository.findByEmail(coachEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamStaff staff = teamStaffRepository.findByUserId(coach.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("You are not on any team's staff"));

        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getTeam().getId().equals(staff.getTeam().getId())) {
            throw new IllegalStateException("This request is not for your team");
        }

        request.setStatus("REJECTED");
        teamRequestRepository.save(request);
    }
}

