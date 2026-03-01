import React, { useState, useEffect } from 'react';
import { cn, formatRole } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';
import type { Player, TeamStandings, Game } from '../../types';
import TeamManagement from '../admin/TeamManagement';
import PlayerManagement from '../admin/PlayerManagement';
import StatsManagement from '../admin/StatsManagement';
import GameManagement from '../admin/GameManagement';
import CoachDashboard from '../admin/CoachDashboard';
import { Shield, ShieldAlert, Users, Trophy, Gamepad2, UserCheck, Clock, Zap } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

interface AdminPageProps {
  adminSubTab: 'teams' | 'players' | 'stats' | 'matchups';
  setAdminSubTab: (tab: 'teams' | 'players' | 'stats' | 'matchups') => void;
  players: Player[];
  teams: TeamStandings[];
  games: Game[];
  onUpdate: () => void;
}

export default function AdminPage({
  adminSubTab, setAdminSubTab, players, teams, games, onUpdate
}: AdminPageProps) {
  const { isAdmin, isCoach, user } = useAuth();
  const [dashStats, setDashStats] = useState<any>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isAdmin && token) {
      fetch(`${API}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : null)
        .then(setDashStats)
        .catch(() => {});
    }
  }, [isAdmin, token]);

  if (!isAdmin && !isCoach) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500/50 mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">Access Denied</h2>
        <p className="text-zinc-500">You need Admin or Coach permissions to access this page.</p>
      </div>
    );
  }

  const statCards = dashStats ? [
    { label: 'Users', value: dashStats.total_users ?? dashStats.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Teams', value: dashStats.total_teams ?? dashStats.totalTeams, icon: Trophy, color: 'text-yellow-500' },
    { label: 'Players', value: dashStats.total_players ?? dashStats.totalPlayers, icon: UserCheck, color: 'text-green-400' },
    { label: 'Pending', value: dashStats.pending_teams ?? dashStats.pendingTeams, icon: Clock, color: 'text-orange-400' },
    { label: 'Free Agents', value: dashStats.free_agents ?? dashStats.freeAgents, icon: Users, color: 'text-purple-400' },
    { label: 'Live Games', value: dashStats.active_games ?? dashStats.activeGames, icon: Zap, color: 'text-red-400' },
  ] : [];

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Management Console</h2>
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 inline-flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {formatRole(user?.role)}
          </span>
        </div>
        <div className="flex gap-2 bg-zinc-900 p-1 rounded-full border border-zinc-800">
          {(['teams', 'players', 'stats', 'matchups'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setAdminSubTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                adminSubTab === tab ? "bg-yellow-500 text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Dashboard Stats */}
      {isAdmin && dashStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <Icon className={cn("w-5 h-5 mx-auto mb-1", color)} />
              <p className="text-2xl font-black text-white">{value ?? 0}</p>
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        {adminSubTab === 'teams' && (
          <TeamManagement teams={teams} onUpdate={onUpdate} />
        )}
        {adminSubTab === 'players' && (
          <PlayerManagement players={players} teams={teams} onUpdate={onUpdate} />
        )}
        {adminSubTab === 'stats' && (
          <StatsManagement players={players} onUpdate={onUpdate} />
        )}
        {adminSubTab === 'matchups' && (
          <GameManagement teams={teams} games={games} onUpdate={onUpdate} />
        )}
        <div className="mt-12 border-t border-zinc-800 pt-12">
          <CoachDashboard onUpdate={onUpdate} players={players} />
        </div>
      </div>
    </>
  );
}

