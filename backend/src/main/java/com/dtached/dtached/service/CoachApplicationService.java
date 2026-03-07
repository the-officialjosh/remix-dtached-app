package com.dtached.dtached.service;

import com.dtached.dtached.model.CoachApplication;
import com.dtached.dtached.model.User;
import com.dtached.dtached.model.enums.UserRole;
import com.dtached.dtached.repository.CoachApplicationRepository;
import com.dtached.dtached.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CoachApplicationService {

    private final CoachApplicationRepository applicationRepo;
    private final UserRepository userRepo;

    /**
     * Submit a new coach/team-manager application.
     */
    @Transactional
    public CoachApplication submit(String email, Map<String, String> form) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already applied
        applicationRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
                .ifPresent(existing -> {
                    if (!"REJECTED".equals(existing.getStatus())) {
                        throw new IllegalStateException("You already have a pending or approved application.");
                    }
                });

        CoachApplication app = CoachApplication.builder()
                .user(user)
                .fullName(form.getOrDefault("fullName", user.getFirstName() + " " + user.getLastName()))
                .email(form.getOrDefault("email", user.getEmail()))
                .phone(form.get("phone"))
                .teamName(form.get("teamName"))
                .leagueOrOrg(form.get("leagueOrOrg"))
                .city(form.get("city"))
                .socialOrWebsite(form.get("socialOrWebsite"))
                .notes(form.get("notes"))
                .status("APPLIED")
                .build();

        return applicationRepo.save(app);
    }

    /**
     * Get a user's latest application.
     */
    public Map<String, Object> getMyApplication(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return applicationRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
                .map(app -> Map.<String, Object>of(
                        "id", app.getId(),
                        "status", app.getStatus(),
                        "teamName", app.getTeamName() != null ? app.getTeamName() : "",
                        "adminNotes", app.getAdminNotes() != null ? app.getAdminNotes() : "",
                        "createdAt", app.getCreatedAt().toString()
                ))
                .orElse(Map.of("status", "NONE"));
    }

    /**
     * Admin: get all applications.
     */
    public List<CoachApplication> getAllApplications() {
        return applicationRepo.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Admin: approve an application — upgrades the user to COACH role.
     */
    @Transactional
    public CoachApplication approve(Long applicationId) {
        CoachApplication app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus("APPROVED");
        app.setReviewedAt(LocalDateTime.now());
        applicationRepo.save(app);

        // Upgrade user role to COACH
        User user = app.getUser();
        if (user != null) {
            user.setRole(UserRole.COACH);
            userRepo.save(user);
        }

        return app;
    }

    /**
     * Admin: reject an application.
     */
    @Transactional
    public CoachApplication reject(Long applicationId, String adminNotes) {
        CoachApplication app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus("REJECTED");
        app.setAdminNotes(adminNotes);
        app.setReviewedAt(LocalDateTime.now());
        return applicationRepo.save(app);
    }
}
