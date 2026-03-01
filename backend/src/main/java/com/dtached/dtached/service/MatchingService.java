package com.dtached.dtached.service;

import com.dtached.dtached.model.*;
import com.dtached.dtached.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final PlayerInterestRepository interestRepo;
    private final PlayerRepository playerRepo;
    private final TeamRepository teamRepo;

    /**
     * Coach expresses interest in a free agent.
     */
    @Transactional
    public PlayerInterest teamLikesPlayer(Long teamId, Long playerId) {
        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        Player player = playerRepo.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (!"FREE_AGENT".equals(player.getStatus())) {
            throw new IllegalStateException("Player is not a free agent");
        }

        if (!Boolean.TRUE.equals(player.getIsVerified())) {
            throw new IllegalStateException("Player is not verified — must have a Player Card");
        }

        // Check if interest already exists
        if (interestRepo.findByTeamIdAndPlayerIdAndDirection(teamId, playerId, "TEAM_TO_PLAYER").isPresent()) {
            throw new IllegalStateException("Interest already expressed");
        }

        PlayerInterest interest = PlayerInterest.builder()
                .team(team)
                .player(player)
                .direction("TEAM_TO_PLAYER")
                .status("PENDING")
                .build();

        interest = interestRepo.save(interest);

        // Check if this creates a mutual match
        checkAndMarkMutual(teamId, playerId);

        return interest;
    }

    /**
     * Player expresses interest in a team.
     */
    @Transactional
    public PlayerInterest playerLikesTeam(Long playerId, Long teamId) {
        Player player = playerRepo.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));
        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!"FREE_AGENT".equals(player.getStatus())) {
            throw new IllegalStateException("Player is not a free agent");
        }

        if (!Boolean.TRUE.equals(player.getIsVerified())) {
            throw new IllegalStateException("Player is not verified — must have a Player Card");
        }

        if (interestRepo.findByTeamIdAndPlayerIdAndDirection(teamId, playerId, "PLAYER_TO_TEAM").isPresent()) {
            throw new IllegalStateException("Interest already expressed");
        }

        PlayerInterest interest = PlayerInterest.builder()
                .team(team)
                .player(player)
                .direction("PLAYER_TO_TEAM")
                .status("PENDING")
                .build();

        interest = interestRepo.save(interest);

        checkAndMarkMutual(teamId, playerId);

        return interest;
    }

    /**
     * If both sides have expressed interest, mark both as MATCHED.
     */
    private void checkAndMarkMutual(Long teamId, Long playerId) {
        var teamSide = interestRepo.findByTeamIdAndPlayerIdAndDirection(teamId, playerId, "TEAM_TO_PLAYER");
        var playerSide = interestRepo.findByTeamIdAndPlayerIdAndDirection(teamId, playerId, "PLAYER_TO_TEAM");

        if (teamSide.isPresent() && playerSide.isPresent()) {
            PlayerInterest t = teamSide.get();
            PlayerInterest p = playerSide.get();
            if ("PENDING".equals(t.getStatus()) && "PENDING".equals(p.getStatus())) {
                t.setStatus("MATCHED");
                p.setStatus("MATCHED");
                interestRepo.save(t);
                interestRepo.save(p);

                // Update player status
                Player player = playerRepo.findById(playerId).orElseThrow();
                player.setStatus("PENDING_MATCH");
                playerRepo.save(player);
            }
        }
    }

    /**
     * Admin approves a mutual match — player joins the team.
     */
    @Transactional
    public void adminApproveMatch(Long interestId) {
        PlayerInterest interest = interestRepo.findById(interestId)
                .orElseThrow(() -> new RuntimeException("Interest not found"));

        if (!"MATCHED".equals(interest.getStatus())) {
            throw new IllegalStateException("This interest is not a mutual match");
        }

        Player player = interest.getPlayer();
        Team team = interest.getTeam();

        // Assign player to team
        player.setTeam(team);
        player.setStatus("ON_TEAM");
        playerRepo.save(player);

        // Update both interest records
        var other = interestRepo.findByTeamIdAndPlayerIdAndDirection(
                team.getId(), player.getId(),
                "TEAM_TO_PLAYER".equals(interest.getDirection()) ? "PLAYER_TO_TEAM" : "TEAM_TO_PLAYER"
        );

        interest.setStatus("APPROVED");
        interestRepo.save(interest);
        other.ifPresent(o -> {
            o.setStatus("APPROVED");
            interestRepo.save(o);
        });
    }

    /**
     * Admin rejects a match.
     */
    @Transactional
    public void adminRejectMatch(Long interestId) {
        PlayerInterest interest = interestRepo.findById(interestId)
                .orElseThrow(() -> new RuntimeException("Interest not found"));

        Player player = interest.getPlayer();
        if ("PENDING_MATCH".equals(player.getStatus())) {
            player.setStatus("FREE_AGENT");
            playerRepo.save(player);
        }

        var other = interestRepo.findByTeamIdAndPlayerIdAndDirection(
                interest.getTeam().getId(), player.getId(),
                "TEAM_TO_PLAYER".equals(interest.getDirection()) ? "PLAYER_TO_TEAM" : "TEAM_TO_PLAYER"
        );

        interest.setStatus("REJECTED");
        interestRepo.save(interest);
        other.ifPresent(o -> {
            o.setStatus("REJECTED");
            interestRepo.save(o);
        });
    }

    /** Get all mutual matches for admin review */
    public List<PlayerInterest> getMutualMatches() {
        return interestRepo.findByStatus("MATCHED");
    }

    /** Get interests sent/received by a player */
    public List<PlayerInterest> getPlayerInterests(Long playerId) {
        return interestRepo.findByPlayerId(playerId);
    }

    /** Get interests sent by a team */
    public List<PlayerInterest> getTeamInterests(Long teamId) {
        return interestRepo.findByTeamId(teamId);
    }
}
