package com.dtached.dtached.mapper;

import com.dtached.dtached.dto.TeamDTO;
import com.dtached.dtached.model.Team;
import com.dtached.dtached.model.TeamStaff;
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
        if (team.getStaff() == null) return null;
        return team.getStaff().stream()
                .filter(s -> s.getRole().name().equals("HEAD_COACH"))
                .findFirst()
                .map(s -> s.getUser().getFirstName() + " " + s.getUser().getLastName())
                .orElse(null);
    }
}
