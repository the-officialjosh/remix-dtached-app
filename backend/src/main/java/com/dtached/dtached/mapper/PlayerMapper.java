package com.dtached.dtached.mapper;

import com.dtached.dtached.dto.PlayerDTO;
import com.dtached.dtached.model.Player;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlayerMapper {

    @Mapping(target = "name", expression = "java(player.getFullName())")
    @Mapping(target = "teamName", expression = "java(player.getTeam() != null ? player.getTeam().getName() : null)")
    @Mapping(source = "photoUrl", target = "photo")
    @Mapping(target = "linkedUserId", expression = "java(player.getUser() != null ? player.getUser().getId().toString() : null)")
    @Mapping(target = "isVerified", expression = "java(Boolean.TRUE.equals(player.getIsVerified()) ? 1 : 0)")
    @Mapping(target = "jerseyConfirmed", expression = "java(Boolean.TRUE.equals(player.getJerseyConfirmed()) ? 1 : 0)")
    @Mapping(target = "instagram", ignore = true)
    @Mapping(target = "pendingTeamName", ignore = true)
    @Mapping(target = "pendingCategory", ignore = true)
    PlayerDTO toDTO(Player player);

    List<PlayerDTO> toDTOList(List<Player> players);
}
