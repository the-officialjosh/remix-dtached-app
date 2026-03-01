import React, { useState, useEffect } from 'react';
import { cn, formatRole } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';
import type { Player, TeamStandings, Game } from '../../types';
import TeamManagement from '../admin/TeamManagement';
import PlayerManagement from '../admin/PlayerManagement';
import StatsManagement from '../admin/StatsManagement';
import GameManagement from '../admin/GameManagement';
import CoachDashboard from '../admin/CoachDashboard';
import StaffPanel from '../admin/StaffPanel';
import { Shield, ShieldAlert, Users, Trophy, UserCheck, Clock, Zap, Briefcase, Video } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

type SubTab = 'teams' | 'players' | 'stats' | 'matchups' | 'needs' | 'staff';

interface AdminPageProps {
  adminSubTab: 'teams' | 'players' | 'stats' | 'matchups';
  setAdminSubTab: (tab: any) => void;
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
  const [teamNeeds, setTeamNeeds] = useState<any[]>([]);
  const token = localStorage.getItem('token');
  const currentTab = adminSubTab as SubTab;

  useEffect(() => {
    if (isAdmin && token) {
      fetch(`${API}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : null)
        .then(setDashStats)
        .catch(() => {});

      fetch(`${API}/admin/team-needs`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : [])
        .then(setTeamNeeds)
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

  const tabs: { key: SubTab; label: string; adminOnly?: boolean }[] = [
    { key: 'teams', label: 'Teams' },
    { key: 'players', label: 'Players' },
    { key: 'stats', label: 'Stats' },
    { key: 'matchups', label: 'Matchups' },
    { key: 'needs', label: 'Needs', adminOnly: true },
    { key: 'staff', label: 'Staff', adminOnly: false },
  ];

  const visibleTabs = tabs.filter(t => !t.adminOnly || isAdmin);

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Management Console</h2>
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 inline-flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {formatRole(user?.role)}
          </span>
        </div>
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-full border border-zinc-800">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setAdminSubTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                currentTab === tab.key ? "bg-yellow-500 text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              {tab.label}
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
        {currentTab === 'teams' && (
          <TeamManagement teams={teams} onUpdate={onUpdate} />
        )}
        {currentTab === 'players' && (
          <PlayerManagement players={players} teams={teams} onUpdate={onUpdate} />
        )}
        {currentTab === 'stats' && (
          <StatsManagement players={players} onUpdate={onUpdate} />
        )}
        {currentTab === 'matchups' && (
          <GameManagement teams={teams} games={games} onUpdate={onUpdate} />
        )}
        {currentTab === 'needs' && isAdmin && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-yellow-500" /> All Team Position Needs
            </h3>
            {teamNeeds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamNeeds.map((need: any) => (
                  <div key={need.id} className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4">
                    <p className="text-white font-bold">{need.team?.name || `Team #${need.team?.id}`}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-[10px] font-bold">{need.position}</span>
                      <span className="text-xs text-zinc-400">×{need.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-zinc-800 border-dashed rounded-2xl">
                <p className="text-zinc-500 italic">No team needs submitted yet.</p>
              </div>
            )}
          </div>
        )}
        {currentTab === 'staff' && (
          <StaffPanel games={games} onUpdate={onUpdate} />
        )}

        <div className="mt-12 border-t border-zinc-800 pt-12">
          <CoachDashboard onUpdate={onUpdate} players={players} />
        </div>
      </div>
    </>
  );
}
