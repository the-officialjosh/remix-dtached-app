package com.dtached.dtached.controller;

import com.dtached.dtached.dto.*;
import com.dtached.dtached.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/teams")
    public ResponseEntity<List<TeamDTO>> getAllTeams() {
        return ResponseEntity.ok(adminService.getAllTeams());
    }

    @PutMapping("/teams/{id}/approve")
    public ResponseEntity<TeamDTO> approveTeam(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveTeam(id));
    }

    @PutMapping("/teams/{id}/reject")
    public ResponseEntity<TeamDTO> rejectTeam(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rejectTeam(id));
    }

    @PutMapping("/players/{id}")
    public ResponseEntity<PlayerDTO> editPlayer(
            @PathVariable Long id,
            @RequestBody UpdateProfileRequest data
    ) {
        return ResponseEntity.ok(adminService.updatePlayer(id, data));
    }

    @PostMapping("/games")
    public ResponseEntity<GameDTO> createGame(@RequestBody GameDTO data) {
        return ResponseEntity.ok(adminService.createOrUpdateGame(data));
    }

    @PostMapping("/stats/update")
    public ResponseEntity<Map<String, String>> updateStats(@RequestBody Map<String, Object> body) {
        Long playerId = Long.valueOf(body.get("playerId").toString());
        @SuppressWarnings("unchecked")
        Map<String, Integer> stats = (Map<String, Integer>) body.get("stats");
        adminService.updatePlayerStats(playerId, stats);
        return ResponseEntity.ok(Map.of("message", "Stats updated"));
    }
}
