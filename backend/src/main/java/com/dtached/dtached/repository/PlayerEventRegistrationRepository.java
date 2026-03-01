package com.dtached.dtached.repository;

import com.dtached.dtached.model.PlayerEventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerEventRegistrationRepository extends JpaRepository<PlayerEventRegistration, Long> {
    List<PlayerEventRegistration> findByEventId(Long eventId);
    List<PlayerEventRegistration> findByUserId(Long userId);
    Optional<PlayerEventRegistration> findByEventIdAndUserId(Long eventId, Long userId);
    long countByEventId(Long eventId);
}
