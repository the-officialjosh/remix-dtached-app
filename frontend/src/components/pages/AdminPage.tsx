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
import RequestApprovals from '../admin/RequestApprovals';
import MatchApprovals from '../admin/MatchApprovals';
import PlayerDirectory from '../admin/PlayerDirectory';
import { Shield, ShieldAlert, Users, Trophy, UserCheck, Clock, Zap, Heart, ClipboardList, BookUser, Video, Briefcase } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

type SubTab = 'teams' | 'players' | 'stats' | 'matchups' | 'requests' | 'matches' | 'directory' | 'needs' | 'staff';

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
  const token = localStorage.getItem('token');
  const currentTab = adminSubTab as SubTab;

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

  const tabs: { key: SubTab; label: string; icon: any; adminOnly?: boolean }[] = [
    { key: 'teams', label: 'Teams', icon: Trophy },
    { key: 'requests', label: 'Requests', icon: ClipboardList, adminOnly: true },
    { key: 'matches', label: 'Matches', icon: Heart, adminOnly: true },
    { key: 'directory', label: 'Directory', icon: BookUser, adminOnly: true },
    { key: 'players', label: 'Roster', icon: UserCheck },
    { key: 'stats', label: 'Stats', icon: Zap },
    { key: 'matchups', label: 'Games', icon: Shield },
    { key: 'staff', label: 'Staff', icon: Video },
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
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-zinc-900 p-1 rounded-2xl border border-zinc-800 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setAdminSubTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              currentTab === tab.key ? "bg-yellow-500 text-black" : "text-zinc-500 hover:text-white"
            )}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Admin Dashboard Stats */}
      {isAdmin && dashStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
        {currentTab === 'teams' && <TeamManagement teams={teams} onUpdate={onUpdate} />}
        {currentTab === 'players' && <PlayerManagement players={players} teams={teams} onUpdate={onUpdate} />}
        {currentTab === 'stats' && <StatsManagement players={players} onUpdate={onUpdate} />}
        {currentTab === 'matchups' && <GameManagement teams={teams} games={games} onUpdate={onUpdate} />}
        {currentTab === 'requests' && isAdmin && <RequestApprovals />}
        {currentTab === 'matches' && isAdmin && <MatchApprovals />}
        {currentTab === 'directory' && isAdmin && <PlayerDirectory />}
        {currentTab === 'staff' && <StaffPanel games={games} onUpdate={onUpdate} />}

        {(currentTab === 'teams' || currentTab === 'players' || currentTab === 'matchups') && (
          <div className="mt-12 border-t border-zinc-800 pt-12">
            <CoachDashboard onUpdate={onUpdate} players={players} />
          </div>
        )}
      </div>
    </>
  );
}
