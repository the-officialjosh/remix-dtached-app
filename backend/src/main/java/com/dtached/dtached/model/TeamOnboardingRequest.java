package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_onboarding_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TeamOnboardingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_name", nullable = false)
    private String teamName;

    @Column(name = "coach_first_name", nullable = false)
    private String coachFirstName;

    @Column(name = "coach_last_name", nullable = false)
    private String coachLastName;

    @Column(name = "coach_email", nullable = false)
    private String coachEmail;

    @Column(name = "coach_phone")
    private String coachPhone;

    private String city;

    @Column(name = "province_state")
    private String provinceState;

    @Column(nullable = false)
    @Builder.Default
    private String division = "Elite";

    @Column(nullable = false)
    @Builder.Default
    private String type = "7v7";

    @Column(name = "requested_manager_count", nullable = false)
    @Builder.Default
    private Integer requestedManagerCount = 0;

    /** JSON array of {firstName, lastName, email} */
    @Column(name = "manager_details", columnDefinition = "TEXT")
    private String managerDetails;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "event_interest", columnDefinition = "TEXT")
    private String eventInterest;

    @Column(nullable = false)
    @Builder.Default
    private String status = "APPLIED";

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    /** Set when the request is approved and team is provisioned */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provisioned_team_id")
    private Team provisionedTeam;
}
