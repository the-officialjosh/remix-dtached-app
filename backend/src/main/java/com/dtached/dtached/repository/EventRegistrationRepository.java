package com.dtached.dtached.repository;

import com.dtached.dtached.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByEventId(Long eventId);
    List<EventRegistration> findByTeamId(Long teamId);
    Optional<EventRegistration> findByEventIdAndTeamId(Long eventId, Long teamId);
    List<EventRegistration> findByEventIdAndStatus(Long eventId, String status);
    long countByEventId(Long eventId);
}
