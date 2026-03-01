export interface Player {
  id: number;
  name: string;
  team_name: string;
  number: number;
  position: string;
  photo?: string;
  height?: string;
  weight?: string;
  city?: string;
  province_state?: string;
  instagram?: string;
  total_yards: number;
  total_catches: number;
  total_interceptions: number;
  total_touchdowns: number;
  total_pass_yards?: number;
  total_pass_attempts?: number;
  total_pass_completions?: number;
  total_sacks?: number;
  linked_user_id?: string;
  dob?: string;
  gender?: string;
  is_verified?: number;
  registration_status?: string;
  pending_team_name?: string;
  pending_category?: string;
  jersey_confirmed?: number;
  bio?: string;
  school_club?: string;
  open_to_offers?: boolean;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface TeamStandings {
  id: number;
  name: string;
  type: '7v7' | 'Flag';
  division: 'Elite' | '16U' | '14U';
  logo?: string;
  coach_name?: string;
  coach_photo?: string;
  roster?: Player[];
  gp: number;
  wins: number;
  losses: number;
  ties: number;
  pts: number;
  pf: number;
  pa: number;
  pd: number;
  l5: string;
  city?: string;
  province_state?: string;
  bio?: string;
  banner_url?: string;
  social_links?: string;
  achievements?: string;
}

export interface Game {
  id: number;
  home_team: string;
  away_team: string;
  home_team_id: number;
  away_team_id: number;
  field: string;
  type: '7v7' | 'Flag';
  start_time: string;
  status: 'scheduled' | 'live' | 'finished';
  home_score: number;
  away_score: number;
  possession_team_id?: number;
  current_down?: number;
  distance?: string;
  yard_line?: string;
  stream_url?: string;
}

export interface Media {
  id: number;
  player_id?: number;
  team_id?: number;
  url: string;
  type: 'photo' | 'video';
  is_premium: boolean;
}
