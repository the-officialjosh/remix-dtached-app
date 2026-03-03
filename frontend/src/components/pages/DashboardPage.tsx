import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import { formatRole } from '../../lib/utils';
import {
  Trophy,
  Users,
  Calendar,
  Shield,
  UserCircle,
  MailCheck,
  MailWarning,
  Send,
} from 'lucide-react';
import PlayerDashboard from './PlayerDashboard';
import AdminPage from './AdminPage';
import CoachDashboard from '../admin/CoachDashboard';
import type { Player, TeamStandings, Game } from '../../types';
import { fetchTournamentData } from '../../lib/api';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, resendConfirmation, isAdmin, isCoach } = useAuth();
  const [resending, setResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  const [adminSubTab, setAdminSubTab] = useState<any>('teams');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<TeamStandings[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  const isPlayer = user?.role === 'PLAYER';

  const loadData = useCallback(async () => {
    const data = await fetchTournamentData('7v7');
    setPlayers(data.players);
    setTeams(data.teams);
    setGames(data.games);
  }, []);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin, loadData]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendConfirmation();
      setResent(true);
    } catch {
      // Silently handle
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Email confirmation banner */}
      {user && !user.emailConfirmed && (
        <div className="flex items-center gap-4 px-6 py-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <MailWarning className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-400">Please confirm your email</p>
            <p className="text-xs text-zinc-400 mt-0.5">Check your inbox for a confirmation link at <strong className="text-white">{user.email}</strong></p>
          </div>
          <button
            onClick={handleResend}
            disabled={resending || resent}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition-all disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            {resent ? 'Sent!' : resending ? 'Sending...' : 'Resend'}
          </button>
        </div>
      )}

      {user?.emailConfirmed && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl w-fit">
          <MailCheck className="w-4 h-4 text-green-500" />
          <span className="text-xs font-bold text-green-400">Email Confirmed</span>
        </div>
      )}

      {/* Welcome header */}
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
          Welcome, {user?.firstName}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 inline-flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {formatRole(user?.role)}
          </span>
          <span className="text-sm text-zinc-500">{user?.email}</span>
        </div>
      </div>

      {/* Player-specific dashboard */}
      {isPlayer && (
        <div className="mt-4">
          <PlayerDashboard onNavigate={onNavigate} />
        </div>
      )}

      {/* Coach gets focused team dashboard */}
      {isCoach && !isAdmin && (
        <div className="mt-4">
          <CoachDashboard onUpdate={loadData} />
        </div>
      )}

      {/* Admin gets full management console */}
      {isAdmin && (
        <div className="mt-4 space-y-8">
          <AdminPage
            adminSubTab={adminSubTab}
            setAdminSubTab={setAdminSubTab}
            players={players}
            teams={teams}
            games={games}
            onUpdate={loadData}
          />
        </div>
      )}
    </motion.div>
  );
}

