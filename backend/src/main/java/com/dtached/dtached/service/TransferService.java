package com.dtached.dtached.service;

import com.dtached.dtached.model.*;
import com.dtached.dtached.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TeamRequestRepository requestRepo;
    private final PlayerRepository playerRepo;
    private final TeamRepository teamRepo;

    /**
     * Player on Team A requests transfer to Team B using invite code.
     */
    @Transactional
    public TeamRequest requestTransfer(Long playerId, String inviteCode) {
        Player player = playerRepo.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (player.getTeam() == null) {
            throw new IllegalStateException("You are not on a team. Use join instead of transfer.");
        }

        Team targetTeam = teamRepo.findByInviteCode(inviteCode.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid invite code"));

        if (!"APPROVED".equals(targetTeam.getStatus())) {
            throw new IllegalStateException("Target team is not active");
        }

        if (targetTeam.getId().equals(player.getTeam().getId())) {
            throw new IllegalStateException("You are already on this team");
        }

        // Create transfer request
        TeamRequest request = TeamRequest.builder()
                .team(targetTeam)
                .player(player)
                .fromTeam(player.getTeam())
                .direction("PLAYER_TO_TEAM")
                .requestType("TRANSFER")
                .status("PENDING")
                .build();

        // Set player to pending transfer
        player.setStatus("PENDING_TRANSFER");
        playerRepo.save(player);

        return requestRepo.save(request);
    }

    /**
     * Admin approves a transfer — moves player from old team to new team.
     */
    @Transactional
    public void approveTransfer(Long requestId) {
        TeamRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"TRANSFER".equals(request.getRequestType())) {
            throw new IllegalStateException("This is not a transfer request");
        }

        Player player = request.getPlayer();
        Team newTeam = request.getTeam();

        player.setTeam(newTeam);
        player.setStatus("ON_TEAM");
        playerRepo.save(player);

        request.setStatus("APPROVED");
        requestRepo.save(request);
    }

    /**
     * Admin rejects a transfer — player stays on current team.
     */
    @Transactional
    public void rejectTransfer(Long requestId) {
        TeamRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Player player = request.getPlayer();
        player.setStatus("ON_TEAM");
        playerRepo.save(player);

        request.setStatus("REJECTED");
        requestRepo.save(request);
    }

    /** Get all pending transfer requests */
    public List<TeamRequest> getPendingTransfers() {
        return requestRepo.findByRequestTypeAndStatus("TRANSFER", "PENDING");
    }
}
