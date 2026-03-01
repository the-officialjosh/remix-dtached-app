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
}
