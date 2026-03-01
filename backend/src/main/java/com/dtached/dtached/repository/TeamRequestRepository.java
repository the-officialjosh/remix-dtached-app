package com.dtached.dtached.repository;

import com.dtached.dtached.model.TeamRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRequestRepository extends JpaRepository<TeamRequest, Long> {
    List<TeamRequest> findByTeamIdAndStatus(Long teamId, String status);
    List<TeamRequest> findByPlayerIdAndStatus(Long playerId, String status);
    List<TeamRequest> findByPlayerId(Long playerId);
    List<TeamRequest> findByTeamId(Long teamId);
}
