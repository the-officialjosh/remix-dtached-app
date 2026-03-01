package com.dtached.dtached.service;

import com.dtached.dtached.dto.TeamDTO;
import com.dtached.dtached.mapper.TeamMapper;
import com.dtached.dtached.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMapper teamMapper;

    public List<TeamDTO> getTeamsByType(String type) {
        return teamMapper.toDTOList(teamRepository.findByType(type));
    }
}
