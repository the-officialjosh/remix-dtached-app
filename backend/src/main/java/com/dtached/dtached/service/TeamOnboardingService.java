package com.dtached.dtached.service;

import com.dtached.dtached.dto.OnboardingResultDTO;
import com.dtached.dtached.dto.TeamOnboardingDTO;
import com.dtached.dtached.model.*;
import com.dtached.dtached.model.enums.TeamStaffRole;
import com.dtached.dtached.model.enums.UserRole;
import com.dtached.dtached.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamOnboardingService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamStaffRepository teamStaffRepository;
    private final TeamOnboardingRequestRepository onboardingRequestRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int MAX_MANAGERS = 5;
    private static final String TEMP_PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    // ─── Admin: Provision a team + coach + managers ───

    @Transactional
    public OnboardingResultDTO provisionTeam(TeamOnboardingDTO dto) {
        // Validate
        if (dto.getTeamName() == null || dto.getTeamName().isBlank()) {
            throw new IllegalArgumentException("Team name is required");
        }
        if (dto.getCoachEmail() == null || dto.getCoachEmail().isBlank()) {
            throw new IllegalArgumentException("Coach email is required");
        }
        if (userRepository.existsByEmail(dto.getCoachEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("Coach email already registered: " + dto.getCoachEmail());
        }

        int managerCount = Math.min(dto.getManagerCount(), MAX_MANAGERS);

        // 1. Create team record
        String teamTag = "DTX-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String inviteCode = dto.getTeamName().substring(0, Math.min(4, dto.getTeamName().length())).toUpperCase()
                + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Team team = teamRepository.save(Team.builder()
                .name(dto.getTeamName().trim())
                .type(dto.getType() != null ? dto.getType() : "7v7")
                .division(dto.getDivision() != null ? dto.getDivision() : "Elite")
                .city(dto.getCity())
                .provinceState(dto.getProvinceState())
                .bio(dto.getBio())
                .teamTag(com.dtached.dtached.util.TagGenerator.generate())
                .inviteCode(inviteCode)
                .status("APPROVED")
                .build());

        // 2. Create coach user + staff link
        String coachTempPassword = generateTempPassword();
        User coachUser = userRepository.save(User.builder()
                .email(dto.getCoachEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(coachTempPassword))
                .firstName(dto.getCoachFirstName() != null ? dto.getCoachFirstName().trim() : "Coach")
                .lastName(dto.getCoachLastName() != null ? dto.getCoachLastName().trim() : "")
                .role(UserRole.COACH)
                .emailConfirmed(true)
                .mustResetPassword(true)
                .build());

        teamStaffRepository.save(TeamStaff.builder()
                .user(coachUser)
                .team(team)
                .role(TeamStaffRole.HEAD_COACH)
                .build());

        log.info("✅ TEAM PROVISIONED: {} | Coach: {} | Invite: {}", team.getName(), coachUser.getEmail(), inviteCode);

        // 3. Create team manager accounts
        List<OnboardingResultDTO.ManagerCredential> managerCredentials = new ArrayList<>();

        if (dto.getManagers() != null) {
            for (int i = 0; i < Math.min(dto.getManagers().size(), managerCount); i++) {
                TeamOnboardingDTO.ManagerDetail mgr = dto.getManagers().get(i);

                if (mgr.getEmail() == null || mgr.getEmail().isBlank()) continue;

                String mgrEmail = mgr.getEmail().toLowerCase().trim();
                if (userRepository.existsByEmail(mgrEmail)) {
                    log.warn("⚠️ Manager email already registered, skipping: {}", mgrEmail);
                    continue;
                }

                String mgrTempPassword = generateTempPassword();
                User mgrUser = userRepository.save(User.builder()
                        .email(mgrEmail)
                        .passwordHash(passwordEncoder.encode(mgrTempPassword))
                        .firstName(mgr.getFirstName() != null ? mgr.getFirstName().trim() : "Manager")
                        .lastName(mgr.getLastName() != null ? mgr.getLastName().trim() : "")
                        .role(UserRole.TEAM_MANAGER)
                        .emailConfirmed(true)
                        .mustResetPassword(true)
                        .build());

                teamStaffRepository.save(TeamStaff.builder()
                        .user(mgrUser)
                        .team(team)
                        .role(TeamStaffRole.TEAM_MANAGER)
                        .build());

                managerCredentials.add(OnboardingResultDTO.ManagerCredential.builder()
                        .email(mgrEmail)
                        .firstName(mgr.getFirstName())
                        .lastName(mgr.getLastName())
                        .tempPassword(mgrTempPassword)
                        .build());

                log.info("✅ TEAM MANAGER PROVISIONED: {} for team {}", mgrEmail, team.getName());
            }
        }

        return OnboardingResultDTO.builder()
                .teamId(team.getId())
                .teamName(team.getName())
                .inviteCode(inviteCode)
                .coachEmail(coachUser.getEmail())
                .coachTempPassword(coachTempPassword)
                .managerCredentials(managerCredentials)
                .build();
    }

    // ─── Public: Submit a team onboarding request ───

    @Transactional
    public TeamOnboardingRequest submitRequest(Map<String, String> data) {
        TeamOnboardingRequest request = TeamOnboardingRequest.builder()
                .teamName(data.getOrDefault("teamName", ""))
                .coachFirstName(data.getOrDefault("coachFirstName", ""))
                .coachLastName(data.getOrDefault("coachLastName", ""))
                .coachEmail(data.getOrDefault("coachEmail", ""))
                .coachPhone(data.get("coachPhone"))
                .city(data.get("city"))
                .provinceState(data.get("provinceState"))
                .division(data.getOrDefault("division", "Elite"))
                .type(data.getOrDefault("type", "7v7"))
                .notes(data.get("notes"))
                .eventInterest(data.get("eventInterest"))
                .requestedManagerCount(Integer.parseInt(data.getOrDefault("requestedManagerCount", "0")))
                .managerDetails(data.get("managerDetails"))
                .status("APPLIED")
                .build();

        request = onboardingRequestRepository.save(request);
        log.info("📋 TEAM ONBOARDING REQUEST submitted: {} by {}", request.getTeamName(), request.getCoachEmail());
        return request;
    }

    // ─── Admin: List / manage requests ───

    public List<TeamOnboardingRequest> getAllRequests() {
        return onboardingRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<TeamOnboardingRequest> getPendingRequests() {
        return onboardingRequestRepository.findByStatus("APPLIED");
    }

    @Transactional
    public void rejectRequest(Long requestId, String adminNotes) {
        TeamOnboardingRequest request = onboardingRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus("REJECTED");
        request.setAdminNotes(adminNotes);
        request.setReviewedAt(LocalDateTime.now());
        onboardingRequestRepository.save(request);

        log.info("❌ TEAM ONBOARDING REQUEST REJECTED: {}", request.getTeamName());
    }

    @Transactional
    public void markRequestApproved(Long requestId, Team team) {
        TeamOnboardingRequest request = onboardingRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus("APPROVED");
        request.setProvisionedTeam(team);
        request.setReviewedAt(LocalDateTime.now());
        onboardingRequestRepository.save(request);
    }

    // ─── Helpers ───

    private String generateTempPassword() {
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(TEMP_PASSWORD_CHARS.charAt(RANDOM.nextInt(TEMP_PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }
}
