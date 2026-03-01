package com.dtached.dtached.service;

import com.dtached.dtached.model.TeamNeed;
import com.dtached.dtached.repository.TeamNeedRepository;
import com.dtached.dtached.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TeamNeedService {

    private final TeamNeedRepository teamNeedRepository;
    private final TeamRepository teamRepository;

    /**
     * Get all needs for a specific team.
     */
    public List<TeamNeed> getTeamNeeds(Long teamId) {
        return teamNeedRepository.findByTeamId(teamId);
    }

    /**
     * Get all team needs across all teams (admin view).
     */
    public List<TeamNeed> getAllNeeds() {
        return teamNeedRepository.findAll();
    }

    /**
     * Coach submits a position need for their team.
     */
    @Transactional
    public TeamNeed addNeed(Long teamId, String position, int count) {
        var team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        return teamNeedRepository.save(TeamNeed.builder()
                .team(team)
                .position(position.toUpperCase())
                .count(count)
                .build());
    }

    /**
     * Remove a need (fulfilled or no longer needed).
     */
    @Transactional
    public void removeNeed(Long needId) {
        teamNeedRepository.deleteById(needId);
    }
}
