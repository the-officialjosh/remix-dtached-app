package com.dtached.dtached.repository;

import com.dtached.dtached.model.TournamentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<TournamentEvent, Long> {
    List<TournamentEvent> findByStatusOrderByStartDateAsc(String status);
    List<TournamentEvent> findAllByOrderByStartDateDesc();
}
