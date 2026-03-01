package com.dtached.dtached.service;

import com.dtached.dtached.dto.PlayerDTO;
import com.dtached.dtached.mapper.PlayerMapper;
import com.dtached.dtached.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final PlayerMapper playerMapper;

    public List<PlayerDTO> getLeaderboard(String type) {
        return playerMapper.toDTOList(playerRepository.findByTeamType(type));
    }
}
