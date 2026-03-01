package com.dtached.dtached.mapper;

import com.dtached.dtached.dto.MediaDTO;
import com.dtached.dtached.model.Media;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MediaMapper {

    @Mapping(source = "player.id", target = "playerId")
    @Mapping(source = "team.id", target = "teamId")
    MediaDTO toDTO(Media media);

    List<MediaDTO> toDTOList(List<Media> mediaList);
}
