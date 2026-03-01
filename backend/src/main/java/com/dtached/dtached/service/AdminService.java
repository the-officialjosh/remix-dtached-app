package com.dtached.dtached.service;

import com.dtached.dtached.dto.*;
import com.dtached.dtached.mapper.PlayerMapper;
import com.dtached.dtached.mapper.TeamMapper;
import com.dtached.dtached.model.Game;
import com.dtached.dtached.model.Player;
import com.dtached.dtached.model.Team;
import com.dtached.dtached.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final GameRepository gameRepository;
    private final TeamMapper teamMapper;
    private final PlayerMapper playerMapper;

    public DashboardStatsDTO getDashboardStats() {
        return DashboardStatsDTO.builder()
                .totalUsers(userRepository.count())
                .totalTeams(teamRepository.count())
                .totalPlayers(playerRepository.count())
                .pendingTeams(teamRepository.findByStatus("PENDING").size())
                .freeAgents(playerRepository.findByStatus("FREE_AGENT").size())
                .activeGames(gameRepository.findByStatus("live").size())
                .build();
    }

    public List<TeamDTO> getAllTeams() {
        return teamMapper.toDTOList(teamRepository.findAll());
    }

    @Transactional
    public TeamDTO approveTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        team.setStatus("APPROVED");

        // Generate invite code if not set
        if (team.getInviteCode() == null || team.getInviteCode().isBlank()) {
            String code = team.getName().substring(0, Math.min(4, team.getName().length())).toUpperCase()
                    + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            team.setInviteCode(code);
        }

        teamRepository.save(team);
        return teamMapper.toDTO(team);
    }

    @Transactional
    public TeamDTO rejectTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        team.setStatus("REJECTED");
        teamRepository.save(team);
        return teamMapper.toDTO(team);
    }

    @Transactional
    public PlayerDTO updatePlayer(Long playerId, UpdateProfileRequest data) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (data.getFirstName() != null) player.setFirstName(data.getFirstName().trim());
        if (data.getLastName() != null) player.setLastName(data.getLastName().trim());
        if (data.getPosition() != null) player.setPosition(data.getPosition());
        if (data.getHeight() != null) player.setHeight(data.getHeight());
        if (data.getWeight() != null) player.setWeight(data.getWeight());
        if (data.getCity() != null) player.setCity(data.getCity());
        if (data.getProvince() != null) player.setProvinceState(data.getProvince());
        if (data.getJerseyNumber() != null) player.setNumber(data.getJerseyNumber());

        playerRepository.save(player);
        return playerMapper.toDTO(player);
    }

    @Transactional
    public GameDTO createOrUpdateGame(GameDTO data) {
        Game game;
        if (data.getId() != null) {
            game = gameRepository.findById(data.getId())
                    .orElseThrow(() -> new RuntimeException("Game not found"));
        } else {
            game = new Game();
        }

        if (data.getHomeTeamId() != null) {
            game.setHomeTeam(teamRepository.findById(data.getHomeTeamId())
                    .orElseThrow(() -> new RuntimeException("Home team not found")));
        }
        if (data.getAwayTeamId() != null) {
            game.setAwayTeam(teamRepository.findById(data.getAwayTeamId())
                    .orElseThrow(() -> new RuntimeException("Away team not found")));
        }
        if (data.getField() != null) game.setField(data.getField());
        if (data.getType() != null) game.setType(data.getType());
        if (data.getStatus() != null) game.setStatus(data.getStatus());
        if (data.getHomeScore() != null) game.setHomeScore(data.getHomeScore());
        if (data.getAwayScore() != null) game.setAwayScore(data.getAwayScore());
        if (game.getStartTime() == null) game.setStartTime(LocalDateTime.now());

        gameRepository.save(game);
        return data; // Return as-is (mapper could be used for richer response)
    }

    @Transactional
    public void updatePlayerStats(Long playerId, java.util.Map<String, Integer> stats) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        stats.forEach((key, value) -> {
            switch (key) {
                case "totalYards" -> player.setTotalYards(value);
                case "totalCatches" -> player.setTotalCatches(value);
                case "totalInterceptions" -> player.setTotalInterceptions(value);
                case "totalTouchdowns" -> player.setTotalTouchdowns(value);
                case "totalPassYards" -> player.setTotalPassYards(value);
                case "totalPassAttempts" -> player.setTotalPassAttempts(value);
                case "totalPassCompletions" -> player.setTotalPassCompletions(value);
                case "totalSacks" -> player.setTotalSacks(value);
            }
        });

        playerRepository.save(player);
    }
}
