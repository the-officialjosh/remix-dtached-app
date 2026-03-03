package com.dtached.dtached.controller;

import com.dtached.dtached.dto.PlayerSummaryDTO;
import com.dtached.dtached.dto.TeamDTO;
import com.dtached.dtached.model.TeamRequest;
import com.dtached.dtached.service.PlayerService;
import com.dtached.dtached.service.TeamRequestService;
import com.dtached.dtached.service.TeamService;
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
public class CoachController {

    private final TeamService teamService;
    private final PlayerService playerService;
    private final TeamRequestService teamRequestService;

    // ---- Team management ----
    // Teams are now provisioned by admin, not self-registered by coaches

    @GetMapping("/api/my/team")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<TeamDTO> getMyTeam(Authentication auth) {
        return ResponseEntity.ok(teamService.getMyTeam(auth.getName()));
    }

    @PutMapping("/api/my/team/roster/lock")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<Map<String, String>> lockRoster(Authentication auth) {
        teamService.lockRoster(auth.getName());
        return ResponseEntity.ok(Map.of("message", "Roster locked"));
    }

    @PostMapping("/api/players/confirm-jersey")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<Map<String, String>> confirmJersey(
            Authentication auth,
            @RequestBody Map<String, Long> body
    ) {
        Long playerId = body.get("playerId");
        if (playerId == null) throw new IllegalArgumentException("playerId is required");
        teamService.confirmJersey(auth.getName(), playerId);
        return ResponseEntity.ok(Map.of("message", "Jersey confirmed"));
    }

    // ---- Free agents ----

    @GetMapping("/api/free-agents")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<List<PlayerSummaryDTO>> getFreeAgents(
            @RequestParam(required = false) String position
    ) {
        return ResponseEntity.ok(playerService.getFreeAgents(position));
    }

    // ---- Team requests ----

    @PostMapping("/api/team-requests/{playerId}")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<Map<String, String>> sendRequest(
            Authentication auth,
            @PathVariable Long playerId
    ) {
        teamRequestService.sendRequest(auth.getName(), playerId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Request sent"));
    }

    // ---- Player request handling (player endpoints) ----

    @GetMapping("/api/my/requests")
    public ResponseEntity<List<TeamRequest>> getMyRequests(Authentication auth) {
        return ResponseEntity.ok(teamRequestService.getPlayerRequests(auth.getName()));
    }

    @PutMapping("/api/team-requests/{id}/accept")
    public ResponseEntity<Map<String, String>> acceptRequest(
            Authentication auth,
            @PathVariable Long id
    ) {
        teamRequestService.acceptRequest(auth.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Request accepted — you're on the team!"));
    }

    @PutMapping("/api/team-requests/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectRequest(
            Authentication auth,
            @PathVariable Long id
    ) {
        teamRequestService.rejectRequest(auth.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Request rejected"));
    }

    // ---- Player release ----

    @DeleteMapping("/api/my/team/players/{playerId}")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<Map<String, String>> releasePlayer(
            Authentication auth,
            @PathVariable Long playerId
    ) {
        playerService.releasePlayer(auth.getName(), playerId);
        return ResponseEntity.ok(Map.of("message", "Player released from roster"));
    }

    // ---- Roster unlock ----

    @PutMapping("/api/my/team/roster/unlock")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<Map<String, String>> unlockRoster(Authentication auth) {
        teamService.unlockRoster(auth.getName());
        return ResponseEntity.ok(Map.of("message", "Roster unlocked"));
    }

    // ---- Coach pending join requests (from invite codes) ----

    @GetMapping("/api/my/team/requests")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<List<TeamRequest>> getCoachPendingRequests(Authentication auth) {
        return ResponseEntity.ok(teamRequestService.getCoachPendingRequests(auth.getName()));
    }

    @PutMapping("/api/my/team/requests/{id}/approve")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<Map<String, String>> coachApproveRequest(
            Authentication auth,
            @PathVariable Long id
    ) {
        teamRequestService.coachApproveRequest(auth.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Player approved and added to roster"));
    }

    @PutMapping("/api/my/team/requests/{id}/reject")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<Map<String, String>> coachRejectRequest(
            Authentication auth,
            @PathVariable Long id
    ) {
        teamRequestService.coachRejectRequest(auth.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Join request rejected"));
    }

    // ---- Player football profile editing (permission-split) ----

    @PutMapping("/api/my/team/players/{playerId}/football-profile")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<Map<String, String>> editPlayerFootballProfile(
            Authentication auth,
            @PathVariable Long playerId,
            @RequestBody Map<String, String> body
    ) {
        playerService.updateFootballProfile(auth.getName(), playerId, body);
        return ResponseEntity.ok(Map.of("message", "Player football profile updated"));
    }
}

