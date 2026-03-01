package com.dtached.dtached.controller;

import com.dtached.dtached.model.PlayerInterest;
import com.dtached.dtached.model.Player;
import com.dtached.dtached.model.User;
import com.dtached.dtached.repository.PlayerRepository;
import com.dtached.dtached.repository.UserRepository;
import com.dtached.dtached.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interests")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;
    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;

    /** Coach expresses interest in a free agent */
    @PostMapping("/team/{teamId}/player/{playerId}")
    public ResponseEntity<?> teamLikesPlayer(@PathVariable Long teamId, @PathVariable Long playerId) {
        PlayerInterest interest = matchingService.teamLikesPlayer(teamId, playerId);
        return ResponseEntity.ok(Map.of(
                "message", "Interest expressed",
                "status", interest.getStatus(),
                "id", interest.getId()
        ));
    }

    /** Player expresses interest in a team */
    @PostMapping("/player/team/{teamId}")
    public ResponseEntity<?> playerLikesTeam(@PathVariable Long teamId, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No player profile"));

        PlayerInterest interest = matchingService.playerLikesTeam(player.getId(), teamId);
        return ResponseEntity.ok(Map.of(
                "message", "Interest expressed",
                "status", interest.getStatus(),
                "id", interest.getId()
        ));
    }

    /** Get my interests (sent/received) */
    @GetMapping("/my")
    public ResponseEntity<List<PlayerInterest>> getMyInterests(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No player profile"));

        return ResponseEntity.ok(matchingService.getPlayerInterests(player.getId()));
    }

    /** Get interests for a team (coach view) */
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<PlayerInterest>> getTeamInterests(@PathVariable Long teamId) {
        return ResponseEntity.ok(matchingService.getTeamInterests(teamId));
    }
}
