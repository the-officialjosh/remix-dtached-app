package com.dtached.dtached.mapper;

import com.dtached.dtached.dto.PlayerDTO;
import com.dtached.dtached.model.Player;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlayerMapper {

    @Mapping(target = "name", expression = "java(player.getFullName())")
    @Mapping(source = "team.name", target = "teamName")
    @Mapping(source = "photoUrl", target = "photo")
    @Mapping(target = "linkedUserId", expression = "java(player.getUser() != null ? player.getUser().getId().toString() : null)")
    @Mapping(target = "isVerified", expression = "java(player.getIsVerified() ? 1 : 0)")
    @Mapping(target = "jerseyConfirmed", expression = "java(player.getJerseyConfirmed() ? 1 : 0)")
    @Mapping(target = "pendingTeamName", ignore = true)
    @Mapping(target = "pendingCategory", ignore = true)
    PlayerDTO toDTO(Player player);

    List<PlayerDTO> toDTOList(List<Player> players);
}
