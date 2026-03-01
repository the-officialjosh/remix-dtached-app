package com.dtached.dtached.service;

import com.dtached.dtached.dto.TeamDTO;
import com.dtached.dtached.dto.TeamRegistrationRequest;
import com.dtached.dtached.mapper.TeamMapper;
import com.dtached.dtached.model.Team;
import com.dtached.dtached.model.TeamStaff;
import com.dtached.dtached.model.User;
import com.dtached.dtached.model.enums.TeamStaffRole;
import com.dtached.dtached.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamStaffRepository teamStaffRepository;
    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final TeamMapper teamMapper;

    public List<TeamDTO> getTeamsByType(String type) {
        return teamMapper.toDTOList(teamRepository.findByType(type));
    }

    @Transactional
    public TeamDTO registerTeam(String email, TeamRegistrationRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Team team = teamRepository.save(Team.builder()
                .name(request.getName().trim())
                .type(request.getType())
                .division(request.getDivision() != null ? request.getDivision() : "Elite")
                .city(request.getCity())
                .provinceState(request.getProvince())
                .bio(request.getBio())
                .status("PENDING") // Needs admin approval
                .build());

        // Link the coach as HEAD_COACH
        teamStaffRepository.save(TeamStaff.builder()
                .user(user)
                .team(team)
                .role(TeamStaffRole.HEAD_COACH)
                .build());

        return teamMapper.toDTO(team);
    }

    public TeamDTO getMyTeam(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamStaff staff = teamStaffRepository.findByUserId(user.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("You are not on any team's staff"));

        return teamMapper.toDTO(staff.getTeam());
    }

    @Transactional
    public void lockRoster(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamStaff staff = teamStaffRepository.findByUserId(user.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("You are not on any team's staff"));

        List<com.dtached.dtached.model.Player> players = playerRepository.findByTeamId(staff.getTeam().getId());
        players.forEach(p -> p.setRosterLocked(true));
        playerRepository.saveAll(players);
    }

    @Transactional
    public void confirmJersey(String email, Long playerId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamStaff staff = teamStaffRepository.findByUserId(user.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("You are not on any team's staff"));

        com.dtached.dtached.model.Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        // Only confirm jersey for your own team's player
        if (player.getTeam() == null || !player.getTeam().getId().equals(staff.getTeam().getId())) {
            throw new IllegalStateException("Player is not on your team");
        }

        player.setJerseyConfirmed(true);
        playerRepository.save(player);
    }
}
