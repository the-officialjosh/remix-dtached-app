package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "fields")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private TournamentEvent event;

    private String location;

    @Column(name = "gps_lat")
    private BigDecimal gpsLat;

    @Column(name = "gps_lng")
    private BigDecimal gpsLng;

    private Integer capacity;

    @Column(name = "surface_type")
    @Builder.Default
    private String surfaceType = "GRASS";

    @Column(nullable = false)
    @Builder.Default
    private String status = "AVAILABLE";
}
