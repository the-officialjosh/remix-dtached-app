import React from 'react';
import { cn } from '../../lib/utils';
import type { Player, TeamStandings, Game } from '../../types';
import ManagementAuth from '../admin/ManagementAuth';
import TeamManagement from '../admin/TeamManagement';
import PlayerManagement from '../admin/PlayerManagement';
import StatsManagement from '../admin/StatsManagement';
import GameManagement from '../admin/GameManagement';
import CoachDashboard from '../admin/CoachDashboard';

interface AdminPageProps {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  adminSubTab: 'teams' | 'players' | 'stats' | 'matchups';
  setAdminSubTab: (tab: 'teams' | 'players' | 'stats' | 'matchups') => void;
  players: Player[];
  teams: TeamStandings[];
  games: Game[];
  onUpdate: () => void;
}

export default function AdminPage({
  isAdmin, setIsAdmin, adminSubTab, setAdminSubTab, players, teams, games, onUpdate
}: AdminPageProps) {
  if (!isAdmin) {
    return <ManagementAuth onAuthorize={() => setIsAdmin(true)} />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Management Console</h2>
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">
            Authorized Access
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
