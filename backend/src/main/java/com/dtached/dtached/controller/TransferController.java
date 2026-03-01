package com.dtached.dtached.controller;

import com.dtached.dtached.model.Player;
import com.dtached.dtached.model.TeamRequest;
import com.dtached.dtached.model.User;
import com.dtached.dtached.repository.PlayerRepository;
import com.dtached.dtached.repository.UserRepository;
import com.dtached.dtached.service.TransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;
    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;

    /** Player submits transfer request with invite code */
    @PostMapping
    public ResponseEntity<?> requestTransfer(@RequestBody Map<String, String> body, Authentication auth) {
        String inviteCode = body.get("inviteCode");
        if (inviteCode == null || inviteCode.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invite code is required"));
        }

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No player profile"));

        TeamRequest request = transferService.requestTransfer(player.getId(), inviteCode);
        return ResponseEntity.ok(Map.of(
                "message", "Transfer request submitted. Awaiting admin approval.",
                "id", request.getId(),
                "targetTeam", request.getTeam().getName()
        ));
    }
}
