package com.dtached.dtached.mapper;

import com.dtached.dtached.dto.GameDTO;
import com.dtached.dtached.model.Game;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GameMapper {

    @Mapping(source = "homeTeam.name", target = "homeTeam")
    @Mapping(source = "homeTeam.id", target = "homeTeamId")
    @Mapping(source = "awayTeam.name", target = "awayTeam")
    @Mapping(source = "awayTeam.id", target = "awayTeamId")
    @Mapping(target = "startTime", expression = "java(game.getStartTime() != null ? game.getStartTime().toString() : null)")
    GameDTO toDTO(Game game);

    List<GameDTO> toDTOList(List<Game> games);
}
