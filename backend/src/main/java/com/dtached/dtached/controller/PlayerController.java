package com.dtached.dtached.controller;

import com.dtached.dtached.dto.PlayerDTO;
import com.dtached.dtached.dto.PlayerRegistrationRequest;
import com.dtached.dtached.dto.PlayerSummaryDTO;
import com.dtached.dtached.service.PlayerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    /**
     * Register as a player. Optionally include an invite code to join a team.
     * Public endpoint but links to user if authenticated.
     */
    @PostMapping("/register")
    public ResponseEntity<PlayerDTO> registerPlayer(
            Authentication authentication,
            @Valid @RequestBody PlayerRegistrationRequest request
    ) {
        String email = authentication != null ? authentication.getName() : null;
        if (email == null) {
            throw new IllegalStateException("You must be logged in to register as a player");
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(playerService.registerPlayer(email, request));
    }

    /**
     * Get current user's player profile.
     */
    @GetMapping("/me")
    public ResponseEntity<PlayerDTO> getMyPlayer(Authentication authentication) {
        return ResponseEntity.ok(playerService.getMyPlayer(authentication.getName()));
    }

    /**
     * Browse free agents. Optionally filter by position.
     */
    @GetMapping("/free-agents")
    public ResponseEntity<List<PlayerSummaryDTO>> getFreeAgents(
            @RequestParam(required = false) String position
    ) {
        return ResponseEntity.ok(playerService.getFreeAgents(position));
    }

    /**
     * Verify a player's identity (admin or self).
     */
    @PostMapping("/verify")
    public ResponseEntity<java.util.Map<String, String>> verifyPlayer(
            Authentication authentication,
            @RequestBody java.util.Map<String, Object> body
    ) {
        Long playerId = body.containsKey("playerId")
                ? Long.valueOf(body.get("playerId").toString())
                : null;
        playerService.verifyPlayer(authentication.getName(), playerId);
        return ResponseEntity.ok(java.util.Map.of("message", "Player verified"));
    }

    /**
     * Toggle free agent market visibility.
     * Only verified players without a team can toggle.
     */
    @PutMapping("/me/free-agent")
    public ResponseEntity<java.util.Map<String, Object>> toggleFreeAgent(Authentication authentication) {
        boolean newState = playerService.toggleFreeAgentVisibility(authentication.getName());
        return ResponseEntity.ok(java.util.Map.of(
                "message", newState ? "Now visible on the market" : "Hidden from the market",
                "openToOffers", newState
        ));
    }
}
