import type { Player, TeamStandings, Game } from '../types';

export const seedPlayers: Player[] = [
  {
    id: 1, name: 'John Doe', team_name: 'Titans', number: 12, position: 'QB',
    height: '6\'2"', weight: '210 lbs', city: 'Toronto', province_state: 'ON',
    instagram: '@johndoe_qb', linked_user_id: 'user_123',
    total_yards: 0, total_catches: 0, total_interceptions: 0, total_touchdowns: 3,
    total_pass_yards: 250, total_pass_attempts: 30, total_pass_completions: 22, total_sacks: 0,
    is_verified: 1, jersey_confirmed: 1, dob: '2008-03-15', gender: 'Boy',
  },
  {
    id: 2, name: 'Mike Smith', team_name: 'Titans', number: 88, position: 'WR',
    height: '6\'0"', weight: '195 lbs', city: 'Hamilton', province_state: 'ON',
    instagram: '@mikesmith_wr',
    total_yards: 180, total_catches: 12, total_interceptions: 0, total_touchdowns: 2,
    total_pass_yards: 0, total_pass_attempts: 0, total_pass_completions: 0, total_sacks: 0,
    is_verified: 1, jersey_confirmed: 1, dob: '2009-07-22', gender: 'Boy',
  },
  {
    id: 3, name: 'Sarah Connor', team_name: 'Valkyries', number: 7, position: 'DB',
    height: '5\'9"', weight: '160 lbs', city: 'Ottawa', province_state: 'ON',
    instagram: '@sarah_db',
    total_yards: 45, total_catches: 3, total_interceptions: 2, total_touchdowns: 1,
    total_pass_yards: 0, total_pass_attempts: 0, total_pass_completions: 0, total_sacks: 4,
    is_verified: 1, jersey_confirmed: 0, dob: '2008-11-10', gender: 'Girl',
  },
  {
    id: 4, name: 'Jane Doe', team_name: 'Sirens', number: 10, position: 'WR',
    height: '5\'7"', weight: '145 lbs', city: 'Toronto', province_state: 'ON',
    instagram: '@janedoe_flag',
    total_yards: 120, total_catches: 8, total_interceptions: 0, total_touchdowns: 2,
    total_pass_yards: 0, total_pass_attempts: 0, total_pass_completions: 0, total_sacks: 0,
    is_verified: 0, jersey_confirmed: 0, dob: '2010-05-03', gender: 'Girl',
  },
];

const titansRoster = seedPlayers.filter(p => p.team_name === 'Titans');
const valkyriesRoster = seedPlayers.filter(p => p.team_name === 'Valkyries');
const sirensRoster = seedPlayers.filter(p => p.team_name === 'Sirens');

export const seedTeams: TeamStandings[] = [
  {
    id: 1, name: 'Titans', type: '7v7', division: 'Elite',
    coach_name: 'Coach Carter', coach_photo: 'https://picsum.photos/seed/coach1/200/200',
    gp: 5, wins: 4, losses: 1, ties: 0, pts: 8, pf: 120, pa: 85, pd: 35,
    l5: 'W-W-L-W-W', city: 'Toronto', province_state: 'ON',
    bio: 'The Titans are a premier 7v7 program focused on developing elite skill position players.',
    roster: titansRoster,
  },
  {
    id: 2, name: 'Warriors', type: '7v7', division: '16U',
    coach_name: 'Coach Prime', coach_photo: 'https://picsum.photos/seed/coach2/200/200',
    gp: 5, wins: 3, losses: 2, ties: 0, pts: 6, pf: 110, pa: 95, pd: 15,
    l5: 'L-W-W-L-W', city: 'Hamilton', province_state: 'ON',
    bio: 'Building champions on and off the field through discipline and hard work.',
    roster: [],
  },
  {
    id: 3, name: 'Valkyries', type: 'Flag', division: 'Elite',
    coach_name: 'Coach Sarah', coach_photo: 'https://picsum.photos/seed/coach3/200/200',
    gp: 4, wins: 4, losses: 0, ties: 0, pts: 8, pf: 90, pa: 20, pd: 70,
    l5: 'W-W-W-W', city: 'Ottawa', province_state: 'ON',
    bio: 'The Valkyries represent the next generation of female athletes in competitive flag football.',
    roster: valkyriesRoster,
  },
  {
    id: 4, name: 'Sirens', type: 'Flag', division: '14U',
    coach_name: 'Coach Kelly', coach_photo: 'https://picsum.photos/seed/coach4/200/200',
    gp: 4, wins: 2, losses: 2, ties: 0, pts: 4, pf: 60, pa: 65, pd: -5,
    l5: 'L-W-L-W', city: 'Toronto', province_state: 'ON',
    bio: 'Fast, agile, and determined. The Sirens are making waves in the 14U division.',
    roster: sirensRoster,
  },
];

export const seedGames: Game[] = [
  {
    id: 1, home_team: 'Titans', away_team: 'Warriors',
    home_team_id: 1, away_team_id: 2, field: 'Field 1', type: '7v7',
    start_time: new Date().toISOString(), status: 'live',
    home_score: 14, away_score: 7,
    possession_team_id: 1, current_down: 2, distance: '7', yard_line: 'Opp 35',
  },
  {
    id: 2, home_team: 'Valkyries', away_team: 'Sirens',
    home_team_id: 3, away_team_id: 4, field: 'Field 3', type: 'Flag',
    start_time: new Date(Date.now() + 3600000).toISOString(), status: 'scheduled',
    home_score: 0, away_score: 0,
  },
];
