package com.dtached.dtached.controller;

import com.dtached.dtached.dto.MediaDTO;
import com.dtached.dtached.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasAnyRole('ADMIN', 'COACH', 'TEAM_MANAGER')")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    /**
     * Update livestream URL and live scores for a game.
     */
    @PutMapping("/games/{id}/livestream")
    public ResponseEntity<Map<String, String>> updateLivestream(
            @PathVariable Long id,
            @RequestBody Map<String, Object> data
    ) {
        staffService.updateLivestream(id, data);
        return ResponseEntity.ok(Map.of("message", "Livestream updated"));
    }

    /**
     * Upload media (photo/video URL) for a player or team.
     */
    @PostMapping("/media")
    public ResponseEntity<MediaDTO> uploadMedia(
            Authentication auth,
            @RequestBody Map<String, Object> data
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(staffService.uploadMedia(auth.getName(), data));
    }
}
