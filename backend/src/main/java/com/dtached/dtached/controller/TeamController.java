package com.dtached.dtached.controller;

import com.dtached.dtached.dto.TeamDTO;
import com.dtached.dtached.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping("/teams")
    public List<TeamDTO> getTeams(@RequestParam(defaultValue = "7v7") String type) {
        return teamService.getTeamsByType(type);
    }
}
