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
import java.util.UUID;

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

        String teamTag = "DTX-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Team team = teamRepository.save(Team.builder()
                .name(request.getName().trim())
                .type(request.getType())
                .division(request.getDivision() != null ? request.getDivision() : "Elite")
                .city(request.getCity())
                .provinceState(request.getProvince())
                .bio(request.getBio())
                .teamTag(teamTag)
                .inviteCode(inviteCode)
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

        Team team = staff.getTeam();
        team.setRosterLocked(true);
        teamRepository.save(team);
    }

    @Transactional
    public void unlockRoster(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamStaff staff = teamStaffRepository.findByUserId(user.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("You are not on any team's staff"));

        Team team = staff.getTeam();
        team.setRosterLocked(false);
        teamRepository.save(team);
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
