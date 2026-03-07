import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LayoutDashboard, Users, UserPlus, CalendarCheck, Settings, Search, CreditCard, Shield, ChevronDown, Bell } from 'lucide-react';
import { API_URL as API } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

// Import split tabs
import OverviewTab from './tabs/OverviewTab';
import TeamTab from './tabs/TeamTab';
import RosterTab from './tabs/RosterTab';
import RequestsTab from './tabs/RequestsTab';
import FreeAgentsTab from './tabs/FreeAgentsTab';
import EventsTab from './tabs/EventsTab';
import PaymentsTab from './tabs/PaymentsTab';
import SettingsTab from './tabs/SettingsTab';

export type CoachTab = 'overview' | 'team' | 'roster' | 'requests' | 'freeagents' | 'events' | 'payments' | 'settings';

const TABS: { key: CoachTab; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'team', label: 'Team', icon: Shield },
  { key: 'roster', label: 'Roster', icon: Users },
  { key: 'requests', label: 'Requests', icon: UserPlus },
  { key: 'freeagents', label: 'Free Agents', icon: Search },
  { key: 'events', label: 'Events', icon: CalendarCheck },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function CoachDashboardRefactored({ onUpdate }: { onUpdate: () => void }) {
  const { user } = useAuth();
  const token = localStorage.getItem('dtached_token');
  const [tab, setTab] = useState<CoachTab>('overview');

  // Multi-team state
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Scoped team data
  const [team, setTeam] = useState<any>(null);
  const [pendingJoins, setPendingJoins] = useState<any[]>([]);

  // Memoize auth headers so they don't cause infinite re-renders
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // Load teams once on mount
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API}/my/teams`, { headers: authHeaders });
        if (res.ok) {
          const tms = await res.json();
          if (!cancelled) {
            setTeams(tms);
            if (tms.length > 0) setSelectedTeamId(prev => prev || tms[0].id);
          }
        } else {
          // Fallback for single team backend
          const singleRes = await fetch(`${API}/my/team`, { headers: authHeaders });
          if (singleRes.ok) {
            const t = await singleRes.json();
            if (!cancelled) {
              setTeams([t]);
              setSelectedTeamId(t.id);
            }
          }
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [token, authHeaders]);

  // Load selected team data when selectedTeamId changes
  const loadSelectedTeamData = useCallback(async () => {
    if (!selectedTeamId || !token) return;
    try {
      const res = await fetch(`${API}/my/team`, { headers: authHeaders });
      if (res.ok) setTeam(await res.json());

      const reqRes = await fetch(`${API}/my/team/requests`, { headers: authHeaders });
      if (reqRes.ok) setPendingJoins(await reqRes.json());
    } catch { /* ignore */ }
  }, [selectedTeamId, token, authHeaders]);

  useEffect(() => {
    loadSelectedTeamData();
  }, [loadSelectedTeamData]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <Shield className="w-16 h-16 text-zinc-700 mx-auto" />
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">No Team Assigned</h2>
        <p className="text-zinc-400">
          Your coach connection has been approved, but no team has been provisioned for you yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Multi-team Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700">
            {team?.logoUrl ? (
              <img src={team.logoUrl} alt="Team Logo" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <Shield className="w-6 h-6 text-yellow-500/50" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{user?.firstName} {user?.lastName}</h2>
              <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                COACH
              </span>
            </div>
            {teams.length > 1 ? (
              <div className="relative mt-1 group">
                <select
                  value={selectedTeamId || ''}
                  onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                  className="appearance-none bg-zinc-800 border border-zinc-700 text-sm text-white font-bold px-3 py-1 pr-8 rounded-lg outline-none cursor-pointer hover:border-zinc-600 transition-colors"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            ) : (
              <p className="text-sm font-bold text-zinc-400 mt-1">{team?.name}</p>
            )}
          </div>
        </div>

        {/* Global Notification/Status chips */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 items-end">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
              team?.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
            }`}>
              Team: {team?.status || 'PENDING'}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
              team?.rosterLocked ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}>
              Roster: {team?.rosterLocked ? 'LOCKED' : 'OPEN'}
            </span>
          </div>
          <button className="relative w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700">
            <Bell className="w-5 h-5 text-zinc-400" />
            {pendingJoins.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-zinc-900">
                {pendingJoins.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-zinc-900 p-1 rounded-2xl border border-zinc-800 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              tab === t.key ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.key === 'requests' && pendingJoins.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-[9px] rounded-full">{pendingJoins.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 min-h-[500px]">
        {tab === 'overview' && <OverviewTab team={team} pendingJoins={pendingJoins} onNavigate={setTab} />}
        {tab === 'team' && <TeamTab team={team} onUpdate={loadSelectedTeamData} />}
        {tab === 'roster' && <RosterTab team={team} onUpdate={loadSelectedTeamData} />}
        {tab === 'requests' && <RequestsTab team={team} pendingJoins={pendingJoins} onUpdate={loadSelectedTeamData} />}
        {tab === 'freeagents' && <FreeAgentsTab team={team} />}
        {tab === 'events' && <EventsTab team={team} />}
        {tab === 'payments' && <PaymentsTab team={team} />}
        {tab === 'settings' && <SettingsTab team={team} />}
      </div>
    </div>
  );
}
