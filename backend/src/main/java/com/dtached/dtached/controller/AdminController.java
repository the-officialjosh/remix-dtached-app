package com.dtached.dtached.controller;

import com.dtached.dtached.dto.*;
import com.dtached.dtached.model.PlayerInterest;
import com.dtached.dtached.model.TeamOnboardingRequest;
import com.dtached.dtached.model.TeamRequest;
import com.dtached.dtached.repository.PlayerRepository;
import com.dtached.dtached.repository.TeamRequestRepository;
import com.dtached.dtached.service.AdminService;
import com.dtached.dtached.service.MatchingService;
import com.dtached.dtached.service.PaymentService;
import com.dtached.dtached.service.TeamOnboardingService;
import com.dtached.dtached.service.TransferService;
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
    private final TeamRequestRepository teamRequestRepository;
    private final PlayerRepository playerRepository;
    private final com.dtached.dtached.repository.UserRepository userRepository;
    private final MatchingService matchingService;
    private final TransferService transferService;
    private final TeamOnboardingService teamOnboardingService;
    private final PaymentService paymentService;

    // ─── Dashboard ───
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ─── Team Management ───
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

    // ─── Player Management ───
    @PutMapping("/players/{id}")
    public ResponseEntity<PlayerDTO> editPlayer(
            @PathVariable Long id,
            @RequestBody UpdateProfileRequest data
    ) {
        return ResponseEntity.ok(adminService.updatePlayer(id, data));
    }

    /** All players with optional filters */
    @GetMapping("/players")
    public ResponseEntity<?> getAllPlayers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String position
    ) {
        List<com.dtached.dtached.model.Player> players;
        if (status != null && position != null) {
            players = playerRepository.findByStatusAndPosition(status, position);
        } else if (status != null) {
            players = playerRepository.findByStatus(status);
        } else {
            players = playerRepository.findAll();
        }
        return ResponseEntity.ok(players);
    }

    // ─── Games & Stats ───
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

    // ─── Request Approvals (JOIN + TRANSFER) ───
    /** All pending requests */
    @GetMapping("/requests")
    public ResponseEntity<List<TeamRequest>> getPendingRequests() {
        return ResponseEntity.ok(teamRequestRepository.findByStatus("PENDING"));
    }

    /** Approve a join or transfer request */
    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        TeamRequest request = teamRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if ("TRANSFER".equals(request.getRequestType())) {
            transferService.approveTransfer(id);
        } else {
            // JOIN request — assign player to team
            var player = request.getPlayer();
            player.setTeam(request.getTeam());
            player.setStatus("ON_TEAM");
            playerRepository.save(player);
            request.setStatus("APPROVED");
            teamRequestRepository.save(request);
        }
        return ResponseEntity.ok(Map.of("message", "Request approved"));
    }

    /** Reject a request */
    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        TeamRequest request = teamRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if ("TRANSFER".equals(request.getRequestType())) {
            transferService.rejectTransfer(id);
        } else {
            request.setStatus("REJECTED");
            teamRequestRepository.save(request);
        }
        return ResponseEntity.ok(Map.of("message", "Request rejected"));
    }

    // ─── Match Approvals ───
    /** All mutual matches waiting for admin */
    @GetMapping("/matches")
    public ResponseEntity<List<PlayerInterest>> getMutualMatches() {
        return ResponseEntity.ok(matchingService.getMutualMatches());
    }

    /** Approve a mutual match — player joins team */
    @PutMapping("/matches/{id}/approve")
    public ResponseEntity<?> approveMatch(@PathVariable Long id) {
        matchingService.adminApproveMatch(id);
        return ResponseEntity.ok(Map.of("message", "Match approved — player assigned to team"));
    }

    /** Reject a mutual match */
    @PutMapping("/matches/{id}/reject")
    public ResponseEntity<?> rejectMatch(@PathVariable Long id) {
        matchingService.adminRejectMatch(id);
        return ResponseEntity.ok(Map.of("message", "Match rejected"));
    }

    // ─── Team Onboarding ───

    /** Provision a new team with coach + manager accounts */
    @PostMapping("/teams/onboard")
    public ResponseEntity<OnboardingResultDTO> provisionTeam(@RequestBody TeamOnboardingDTO dto) {
        return ResponseEntity.status(201).body(teamOnboardingService.provisionTeam(dto));
    }

    /** List all onboarding requests */
    @GetMapping("/onboarding-requests")
    public ResponseEntity<List<TeamOnboardingRequest>> getOnboardingRequests() {
        return ResponseEntity.ok(teamOnboardingService.getAllRequests());
    }

    /** Reject an onboarding request */
    @PutMapping("/onboarding-requests/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectOnboardingRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String notes = body != null ? body.getOrDefault("notes", "") : "";
        teamOnboardingService.rejectRequest(id, notes);
        return ResponseEntity.ok(Map.of("message", "Onboarding request rejected"));
    }

    /** Team-level payment summary */
    @GetMapping("/teams/{id}/payment-summary")
    public ResponseEntity<Map<String, Object>> getTeamPaymentSummary(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getTeamPaymentSummary(id));
    }

    // ========== USER MANAGEMENT ==========

    /** List all users with optional role and search filters */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search
    ) {
        com.dtached.dtached.model.enums.UserRole roleEnum = null;
        if (role != null && !role.isBlank()) {
            try {
                roleEnum = com.dtached.dtached.model.enums.UserRole.valueOf(role);
            } catch (IllegalArgumentException ignored) {}
        }
        String searchTerm = (search != null && !search.isBlank()) ? search : null;
        var users = userRepository.searchUsers(roleEnum, searchTerm);
        return ResponseEntity.ok(users);
    }

    /** Deactivate a user account */
    @PutMapping("/users/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User deactivated"));
    }

    /** Activate a user account */
    @PutMapping("/users/{userId}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User activated"));
    }
}
