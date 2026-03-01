package com.dtached.dtached.repository;

import com.dtached.dtached.model.PlayerInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerInterestRepository extends JpaRepository<PlayerInterest, Long> {

    List<PlayerInterest> findByTeamIdAndDirection(Long teamId, String direction);

    List<PlayerInterest> findByPlayerIdAndDirection(Long playerId, String direction);

    Optional<PlayerInterest> findByTeamIdAndPlayerIdAndDirection(Long teamId, Long playerId, String direction);

    List<PlayerInterest> findByStatus(String status);

    /** Find players where both sides expressed interest (mutual matches) */
    @Query("""
        SELECT i FROM PlayerInterest i
        WHERE i.status = 'PENDING'
        AND EXISTS (
            SELECT 1 FROM PlayerInterest j
            WHERE j.team = i.team AND j.player = i.player
            AND j.direction <> i.direction
            AND j.status = 'PENDING'
        )
    """)
    List<PlayerInterest> findMutualMatches();

    /** All interests involving a player */
    List<PlayerInterest> findByPlayerId(Long playerId);

    /** All interests from a team */
    List<PlayerInterest> findByTeamId(Long teamId);
}
