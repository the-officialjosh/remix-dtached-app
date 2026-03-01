package com.dtached.dtached.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pricing_tiers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PricingTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_cents", nullable = false)
    private Integer priceCents;

    @Column(length = 3, nullable = false)
    @Builder.Default
    private String currency = "CAD";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
