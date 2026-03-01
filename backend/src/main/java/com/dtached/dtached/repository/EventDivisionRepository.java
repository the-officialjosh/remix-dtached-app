package com.dtached.dtached.repository;

import com.dtached.dtached.model.EventDivision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventDivisionRepository extends JpaRepository<EventDivision, Long> {
    List<EventDivision> findByEventId(Long eventId);
}
