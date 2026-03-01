import type { Player, TeamStandings, Game } from '../types';
import { seedPlayers, seedTeams, seedGames } from '../data/seedData';

export const API_URL = '/api';

export async function fetchTournamentData(tournamentType: '7v7' | 'Flag') {
  try {
    const [pRes, gRes, tRes] = await Promise.all([
      fetch(`/api/leaderboard?type=${tournamentType}`),
      fetch(`/api/games?type=${tournamentType}`),
      fetch(`/api/teams?type=${tournamentType}`)
    ]);

    if (!pRes.ok || !gRes.ok || !tRes.ok) {
      throw new Error(`HTTP error! status: ${pRes.status} ${gRes.status} ${tRes.status}`);
    }

    const players: Player[] = await pRes.json();
    const games: Game[] = await gRes.json();
    const teams: TeamStandings[] = await tRes.json();
    return { players, games, teams };
  } catch (err) {
    console.error("Fetch error:", err);
    // Use fallback seed data when API is unavailable (e.g. static hosting)
    const filteredPlayers = seedPlayers.filter(p => {
      const team = seedTeams.find(t => t.name === p.team_name);
      return team ? team.type === tournamentType : true;
    });
    const filteredTeams = seedTeams.filter(t => t.type === tournamentType);
    const filteredGames = seedGames.filter(g => g.type === tournamentType);
    return { players: filteredPlayers, games: filteredGames, teams: filteredTeams };
  }
}
