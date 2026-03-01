package com.dtached.dtached.repository;

import com.dtached.dtached.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByType(String type);
    List<Game> findByStatus(String status);
    List<Game> findByTypeAndStatus(String type, String status);
    List<Game> findByHomeTeamIdOrAwayTeamId(Long homeTeamId, Long awayTeamId);
}
