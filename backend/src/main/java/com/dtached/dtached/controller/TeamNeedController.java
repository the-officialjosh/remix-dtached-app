package com.dtached.dtached.controller;

import com.dtached.dtached.model.TeamNeed;
import com.dtached.dtached.service.TeamNeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TeamNeedController {

    private final TeamNeedService teamNeedService;

    /**
     * Admin: get all team needs across all teams.
     */
    @GetMapping("/api/admin/team-needs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeamNeed>> getAllNeeds() {
        return ResponseEntity.ok(teamNeedService.getAllNeeds());
    }

    /**
     * Get needs for a specific team (public — teams advertise what they need).
     */
    @GetMapping("/api/teams/{teamId}/needs")
    public ResponseEntity<List<TeamNeed>> getTeamNeeds(@PathVariable Long teamId) {
        return ResponseEntity.ok(teamNeedService.getTeamNeeds(teamId));
    }

    /**
     * Coach: add a position need for their team.
     */
    @PostMapping("/api/teams/{teamId}/needs")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER')")
    public ResponseEntity<TeamNeed> addNeed(
            @PathVariable Long teamId,
            @RequestBody Map<String, Object> body
    ) {
        String position = (String) body.get("position");
        int count = body.containsKey("count") ? (int) body.get("count") : 1;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamNeedService.addNeed(teamId, position, count));
    }

    /**
     * Remove a need (coach or admin).
     */
    @DeleteMapping("/api/team-needs/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'TEAM_MANAGER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> removeNeed(@PathVariable Long id) {
        teamNeedService.removeNeed(id);
        return ResponseEntity.ok(Map.of("message", "Need removed"));
    }
}
