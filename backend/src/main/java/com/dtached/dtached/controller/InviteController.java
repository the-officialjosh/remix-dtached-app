package com.dtached.dtached.controller;

import com.dtached.dtached.model.TeamInvite;
import com.dtached.dtached.service.InviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class InviteController {

    private final InviteService inviteService;

    /**
     * Coach sends an invite to a player's email.
     */
    @PostMapping("/api/teams/{teamId}/invite")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<Map<String, String>> sendInvite(
            Authentication auth,
            @PathVariable Long teamId,
            @RequestBody Map<String, String> body
    ) {
        String email = body.get("email");
        TeamInvite invite = inviteService.sendInvite(auth.getName(), teamId, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Invite sent",
                "inviteCode", invite.getInviteCode()
        ));
    }

    /**
     * Player accepts an invite code.
     */
    @GetMapping("/api/invites/{code}/accept")
    public ResponseEntity<Map<String, String>> acceptInvite(
            Authentication auth,
            @PathVariable String code
    ) {
        String teamName = inviteService.acceptInvite(auth.getName(), code);
        return ResponseEntity.ok(Map.of("message", "You have joined " + teamName));
    }

    /**
     * Coach views all invites for their team.
     */
    @GetMapping("/api/teams/{teamId}/invites")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<List<TeamInvite>> getTeamInvites(
            Authentication auth,
            @PathVariable Long teamId
    ) {
        return ResponseEntity.ok(inviteService.getTeamInvites(auth.getName(), teamId));
    }
}
