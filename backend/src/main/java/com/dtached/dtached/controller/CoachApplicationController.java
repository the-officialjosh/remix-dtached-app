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
     * Submit a new coach/team-manager application.
     */
    @PostMapping("/api/coach-applications")
    public ResponseEntity<?> submitApplication(Authentication auth, @RequestBody Map<String, String> form) {
        try {
            CoachApplication app = applicationService.submit(auth.getName(), form);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Application submitted", "id", app.getId()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check own application status.
     */
    @GetMapping("/api/coach-applications/me")
    public ResponseEntity<?> getMyApplication(Authentication auth) {
        return ResponseEntity.ok(applicationService.getMyApplication(auth.getName()));
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
    public ResponseEntity<?> approveApplication(@PathVariable Long id) {
        CoachApplication app = applicationService.approve(id);
        return ResponseEntity.ok(Map.of("message", "Application approved", "id", app.getId()));
    }

    /**
     * Admin: reject an application.
     */
    @PutMapping("/api/admin/coach-applications/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectApplication(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        CoachApplication app = applicationService.reject(id, notes);
        return ResponseEntity.ok(Map.of("message", "Application rejected", "id", app.getId()));
    }
}
