package com.dtached.dtached.repository;

import com.dtached.dtached.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    Optional<Player> findByUserId(Long userId);

    List<Player> findByTeamId(Long teamId);

    List<Player> findByStatus(String status);

    // Free agents filtered by position
    List<Player> findByStatusAndPosition(String status, String position);

    // Verified free agents only (for coach search)
    List<Player> findByStatusAndIsVerifiedAndOpenToOffers(String status, Boolean isVerified, Boolean openToOffers);
    List<Player> findByStatusAndIsVerifiedAndOpenToOffersAndPosition(String status, Boolean isVerified, Boolean openToOffers, String position);

    // Leaderboard: players on teams of a given tournament type
    @Query("SELECT p FROM Player p JOIN p.team t WHERE t.type = :type")
    List<Player> findByTeamType(@Param("type") String type);
}
