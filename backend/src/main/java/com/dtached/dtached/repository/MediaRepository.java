package com.dtached.dtached.repository;

import com.dtached.dtached.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
    List<Media> findByPlayerId(Long playerId);
    List<Media> findByTeamId(Long teamId);
}
