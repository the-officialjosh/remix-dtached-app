package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private String type = "7v7";

    @Column(nullable = false)
    @Builder.Default
    private String division = "Elite";

    @Column(name = "logo_url")
    private String logoUrl;

    private String city;

    @Column(name = "province_state")
    private String provinceState;

    private String bio;

    @Column(name = "invite_code", unique = true)
    private String inviteCode;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "roster_locked", nullable = false)
    @Builder.Default
    private Boolean rosterLocked = false;

    @Column(name = "team_tag", unique = true)
    private String teamTag;

    @Column(nullable = false) @Builder.Default private Integer gp = 0;
    @Column(nullable = false) @Builder.Default private Integer wins = 0;
    @Column(nullable = false) @Builder.Default private Integer losses = 0;
    @Column(nullable = false) @Builder.Default private Integer ties = 0;
    @Column(nullable = false) @Builder.Default private Integer pts = 0;
    @Column(nullable = false) @Builder.Default private Integer pf = 0;
    @Column(nullable = false) @Builder.Default private Integer pa = 0;
    @Column(nullable = false) @Builder.Default private Integer pd = 0;

    @Builder.Default
    private String l5 = "";

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "social_links", columnDefinition = "TEXT")
    private String socialLinks;

    @Column(columnDefinition = "TEXT")
    private String achievements;

    // Relationships
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Player> players = new ArrayList<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TeamStaff> staff = new ArrayList<>();
}
