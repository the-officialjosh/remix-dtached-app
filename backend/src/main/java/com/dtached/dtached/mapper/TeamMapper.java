package com.dtached.dtached.mapper;

import com.dtached.dtached.dto.TeamDTO;
import com.dtached.dtached.model.Team;
import com.dtached.dtached.model.enums.TeamStaffRole;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PlayerMapper.class})
public interface TeamMapper {

    @Mapping(source = "logoUrl", target = "logo")
    @Mapping(target = "coachName", expression = "java(getHeadCoachName(team))")
    @Mapping(target = "coachPhoto", ignore = true)
    @Mapping(source = "players", target = "roster")
    TeamDTO toDTO(Team team);

    List<TeamDTO> toDTOList(List<Team> teams);

    default String getHeadCoachName(Team team) {
        if (team == null || team.getStaff() == null) return null;
        return team.getStaff().stream()
                .filter(s -> s.getRole() == TeamStaffRole.HEAD_COACH)
                .findFirst()
                .map(s -> {
                    if (s.getUser() == null) return null;
                    return s.getUser().getFirstName() + " " + s.getUser().getLastName();
                })
                .orElse(null);
    }
}
