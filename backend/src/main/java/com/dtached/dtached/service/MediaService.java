package com.dtached.dtached.service;

import com.dtached.dtached.dto.MediaDTO;
import com.dtached.dtached.mapper.MediaMapper;
import com.dtached.dtached.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaRepository mediaRepository;
    private final MediaMapper mediaMapper;

    public List<MediaDTO> getByPlayerId(Long playerId) {
        return mediaMapper.toDTOList(mediaRepository.findByPlayerId(playerId));
    }

    public List<MediaDTO> getByTeamId(Long teamId) {
        return mediaMapper.toDTOList(mediaRepository.findByTeamId(teamId));
    }
}
