package com.dtached.dtached.service;

import com.dtached.dtached.model.CoachApplication;
import com.dtached.dtached.model.User;
import com.dtached.dtached.model.enums.UserRole;
import com.dtached.dtached.repository.CoachApplicationRepository;
import com.dtached.dtached.repository.UserRepository;
import com.dtached.dtached.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoachApplicationService {

    private final CoachApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    /**
     * Submit a coach/team-manager application.
     */
    @Transactional
    public CoachApplication submitApplication(String email, Map<String, String> data) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already applied
        if (applicationRepository.findByUserId(user.getId()).isPresent()) {
            throw new IllegalStateException("You have already submitted an application");
        }

        // Check if already a coach
        if (user.getRole() == UserRole.COACH || user.getRole() == UserRole.TEAM_MANAGER) {
            throw new IllegalStateException("You already have coach/team manager access");
        }

        CoachApplication app = CoachApplication.builder()
                .user(user)
                .fullName(data.getOrDefault("fullName", user.getFirstName() + " " + user.getLastName()))
                .email(data.getOrDefault("email", email))
                .phone(data.get("phone"))
                .teamName(data.get("teamName"))
                .leagueOrOrg(data.get("leagueOrOrg"))
                .city(data.get("city"))
                .socialOrWebsite(data.get("socialOrWebsite"))
                .notes(data.get("notes"))
                .status("APPLIED")
                .build();

        app = applicationRepository.save(app);
        log.info("📋 COACH APPLICATION submitted by {} — Team: {}", email, data.get("teamName"));
        return app;
    }

    /**
     * Get the current user's application status.
     */
    public CoachApplication getMyApplication(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.findByUserId(user.getId()).orElse(null);
    }

    /**
     * Admin: get all applications.
     */
    public List<CoachApplication> getAllApplications() {
        return applicationRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Admin: approve an application — upgrades user to COACH role.
     */
    @Transactional
    public void approveApplication(Long applicationId, String role) {
        CoachApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if ("APPROVED".equals(app.getStatus())) {
            throw new IllegalStateException("Application already approved");
        }

        // Determine role (default COACH)
        UserRole targetRole = "TEAM_MANAGER".equalsIgnoreCase(role) ? UserRole.TEAM_MANAGER : UserRole.COACH;

        // Upgrade user role
        User user = app.getUser();
        user.setRole(targetRole);
        userRepository.save(user);

        app.setStatus("APPROVED");
        app.setReviewedAt(LocalDateTime.now());
        applicationRepository.save(app);

        log.info("✅ COACH APPLICATION APPROVED: {} → role={}", user.getEmail(), targetRole);
    }

    /**
     * Admin: reject an application.
     */
    @Transactional
    public void rejectApplication(Long applicationId, String adminNotes) {
        CoachApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus("REJECTED");
        app.setAdminNotes(adminNotes);
        app.setReviewedAt(LocalDateTime.now());
        applicationRepository.save(app);

        log.info("❌ COACH APPLICATION REJECTED: {}", app.getEmail());
    }
}
