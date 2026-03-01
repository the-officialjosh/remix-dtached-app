package com.dtached.dtached.service;

import com.dtached.dtached.model.Player;
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
     * Coach sends a request to a free-agent player.
     */
    @Transactional
    public TeamRequest sendRequest(String coachEmail, Long playerId) {
        User coach = userRepository.findByEmail(coachEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamStaff staff = teamStaffRepository.findByUserId(coach.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("You are not on any team's staff"));

        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (!"FREE_AGENT".equals(player.getStatus())) {
            throw new IllegalStateException("Player is already on a team");
        }

        return teamRequestRepository.save(TeamRequest.builder()
                .team(staff.getTeam())
                .player(player)
                .direction("TEAM_TO_PLAYER")
                .status("PENDING")
                .build());
    }

    /**
     * Player views incoming requests.
     */
    public List<TeamRequest> getPlayerRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No player profile"));

        return teamRequestRepository.findByPlayerIdAndStatus(player.getId(), "PENDING");
    }

    /**
     * Player accepts a team request — joins the team.
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
}
