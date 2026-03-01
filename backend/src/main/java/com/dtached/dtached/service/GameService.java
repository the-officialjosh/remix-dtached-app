package com.dtached.dtached.service;

import com.dtached.dtached.dto.GameDTO;
import com.dtached.dtached.mapper.GameMapper;
import com.dtached.dtached.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final GameMapper gameMapper;

    public List<GameDTO> getGamesByType(String type) {
        return gameMapper.toDTOList(gameRepository.findByType(type));
    }
}
