package com.dtached.dtached.service;

import com.dtached.dtached.dto.PlayerDTO;
import com.dtached.dtached.dto.PlayerRegistrationRequest;
import com.dtached.dtached.dto.PlayerSummaryDTO;
import com.dtached.dtached.mapper.PlayerMapper;
import com.dtached.dtached.model.Player;
import com.dtached.dtached.model.Team;
import com.dtached.dtached.model.User;
import com.dtached.dtached.repository.PlayerRepository;
import com.dtached.dtached.repository.TeamRepository;
import com.dtached.dtached.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final PlayerMapper playerMapper;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    public List<PlayerDTO> getLeaderboard(String type) {
        return playerMapper.toDTOList(playerRepository.findByTeamType(type));
    }

    @Transactional
    public PlayerDTO registerPlayer(String email, PlayerRegistrationRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has a player profile
        if (playerRepository.findByUserId(user.getId()).isPresent()) {
            throw new IllegalStateException("You already have a player profile");
        }

        Player.PlayerBuilder builder = Player.builder()
                .user(user)
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .dob(request.getDob())
                .gender(request.getGender())
                .position(request.getPosition())
                .height(request.getHeight())
                .weight(request.getWeight())
                .city(request.getCity())
                .provinceState(request.getProvince())
                .eventType(request.getEventType())
                .planPackage(request.getPlanPackage())
                .jerseySize(request.getJerseySize())
                .shortsSize(request.getShortsSize())
                .status("FREE_AGENT");

        // Join team via invite code
        if (request.getInviteCode() != null && !request.getInviteCode().isBlank()) {
            Team team = teamRepository.findByInviteCode(request.getInviteCode().trim().toUpperCase())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid invite code"));

            if (!"APPROVED".equals(team.getStatus())) {
                throw new IllegalStateException("This team is not accepting players");
            }

            builder.team(team).status("ON_TEAM");
        }

        Player player = playerRepository.save(builder.build());
        return playerMapper.toDTO(player);
    }

    public PlayerDTO getMyPlayer(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No player profile found. Register as a player first."));

        return playerMapper.toDTO(player);
    }

    public List<PlayerSummaryDTO> getFreeAgents(String position) {
        List<Player> agents;
        if (position != null && !position.isBlank()) {
            agents = playerRepository.findByStatusAndPosition("FREE_AGENT", position.toUpperCase());
        } else {
            agents = playerRepository.findByStatus("FREE_AGENT");
        }

        return agents.stream()
                .map(p -> PlayerSummaryDTO.builder()
                        .id(p.getId())
                        .firstName(p.getFirstName())
                        .lastName(p.getLastName())
                        .position(p.getPosition())
                        .height(p.getHeight())
                        .weight(p.getWeight())
                        .city(p.getCity())
                        .province(p.getProvinceState())
                        .photoUrl(p.getPhotoUrl())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Verify a player's identity. Admin can verify any player by ID.
     * A player can verify themselves (playerId = null → uses own profile).
     */
    @Transactional
    public void verifyPlayer(String email, Long playerId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Player player;
        if (playerId != null) {
            // Admin verifying a specific player
            player = playerRepository.findById(playerId)
                    .orElseThrow(() -> new RuntimeException("Player not found"));
        } else {
            // Self-verification
            player = playerRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("No player profile found"));
        }

        player.setIsVerified(true);
        playerRepository.save(player);
    }
}
