package com.dtached.dtached.controller;

import com.dtached.dtached.dto.GameDTO;
import com.dtached.dtached.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping("/games")
    public List<GameDTO> getGames(@RequestParam(defaultValue = "7v7") String type) {
        return gameService.getGamesByType(type);
    }
}
