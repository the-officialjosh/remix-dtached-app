package com.dtached.dtached.controller;

import com.dtached.dtached.dto.PlayerDTO;
import com.dtached.dtached.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LeaderboardController {

    private final PlayerService playerService;

    @GetMapping("/leaderboard")
    public List<PlayerDTO> getLeaderboard(@RequestParam(defaultValue = "7v7") String type) {
        return playerService.getLeaderboard(type);
    }
}
