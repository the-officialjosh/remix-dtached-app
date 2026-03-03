package com.dtached.dtached.controller;

import com.dtached.dtached.model.CoachApplication;
import com.dtached.dtached.service.CoachApplicationService;
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
public class CoachApplicationController {

    private final CoachApplicationService applicationService;

    /**
     * Submit a coach/team-manager application.
     */
    @PostMapping("/api/coach-applications")
    public ResponseEntity<Map<String, String>> submitApplication(
            Authentication auth,
            @RequestBody Map<String, String> body
    ) {
        applicationService.submitApplication(auth.getName(), body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Application submitted! We will review it and contact you."));
    }

    /**
     * Check own application status.
     */
    @GetMapping("/api/coach-applications/me")
    public ResponseEntity<?> getMyApplication(Authentication auth) {
        CoachApplication app = applicationService.getMyApplication(auth.getName());
        if (app == null) {
            return ResponseEntity.ok(Map.of("status", "NONE"));
        }
        return ResponseEntity.ok(Map.of(
                "id", app.getId(),
                "status", app.getStatus(),
                "teamName", app.getTeamName() != null ? app.getTeamName() : "",
                "createdAt", app.getCreatedAt().toString(),
                "adminNotes", app.getAdminNotes() != null ? app.getAdminNotes() : ""
        ));
    }

    /**
     * Admin: list all applications.
     */
    @GetMapping("/api/admin/coach-applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CoachApplication>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    /**
     * Admin: approve an application.
     */
    @PutMapping("/api/admin/coach-applications/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> approveApplication(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String role = body != null ? body.getOrDefault("role", "COACH") : "COACH";
        applicationService.approveApplication(id, role);
        return ResponseEntity.ok(Map.of("message", "Application approved — coach access granted"));
    }

    /**
     * Admin: reject an application.
     */
    @PutMapping("/api/admin/coach-applications/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> rejectApplication(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String notes = body != null ? body.getOrDefault("notes", "") : "";
        applicationService.rejectApplication(id, notes);
        return ResponseEntity.ok(Map.of("message", "Application rejected"));
    }
}
