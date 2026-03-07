import React from 'react';
import { Users, UserPlus, Lock, Unlock, Check, Clock, ChevronRight, Copy, Calendar } from 'lucide-react';

export default function OverviewTab({ team, pendingJoins, onNavigate }: { team: any, pendingJoins: any[], onNavigate: (tab: any) => void }) {
  if (!team) return null;

  const rosterCount = team.roster?.length || 0;
  const isLocked = team.rosterLocked || false;
  const teamStatus = team.status || 'PENDING';

  const copyInviteCode = () => {
    const code = team.inviteCode || '';
    if (code) {
      navigator.clipboard.writeText(code);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Team Overview</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Roster" value={rosterCount} icon={Users} color="text-blue-400" />
        <StatCard label="Pending" value={pendingJoins.length} icon={UserPlus} color="text-yellow-500" />
        <StatCard
          label="Roster Status"
          value={isLocked ? 'Locked' : 'Open'}
          icon={isLocked ? Lock : Unlock}
          color={isLocked ? 'text-red-400' : 'text-green-400'}
        />
        <StatCard
          label="Team Status"
          value={teamStatus}
          icon={teamStatus === 'APPROVED' ? Check : Clock}
          color={teamStatus === 'APPROVED' ? 'text-green-400' : 'text-orange-400'}
        />
      </div>

      <div className="space-y-3">
        <InfoRow label="Team Name" value={team.name || ''} />
        <InfoRow label="Team Tag" value={team.teamTag || ''} mono />
        <InfoRow label="Division" value={team.division || 'N/A'} />
        <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Invite Code</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-yellow-500">{team.inviteCode || 'N/A'}</span>
            {team.inviteCode && (
              <button onClick={copyInviteCode} className="p-1 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors" title="Copy invite code">
                <Copy className="w-3 h-3 text-zinc-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Roster breakdown */}
      {team.roster && team.roster.length > 0 && (
        <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-4 space-y-2">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Roster Breakdown</p>
          <div className="flex gap-4 text-sm">
            <span className="text-green-400 font-bold">
              {team.roster.filter((p: any) => p.is_verified || p.isVerified).length} Verified
            </span>
            <span className="text-zinc-400">·</span>
            <span className="text-red-400 font-bold">
              {team.roster.filter((p: any) => !p.is_verified && !p.isVerified).length} Not Verified
            </span>
          </div>
        </div>
      )}

      {pendingJoins.length > 0 && (
        <button
          onClick={() => onNavigate('requests')}
          className="w-full flex items-center justify-between bg-blue-500/5 border border-blue-500/20 px-4 py-3 rounded-xl hover:bg-blue-500/10 transition-all"
        >
          <span className="text-sm text-blue-400 font-bold">
            {pendingJoins.length} pending join request{pendingJoins.length !== 1 ? 's' : ''} awaiting your review
          </span>
          <ChevronRight className="w-4 h-4 text-blue-400" />
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button onClick={() => onNavigate('roster')} className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-white uppercase tracking-widest hover:bg-zinc-700 transition-colors flex items-center gap-2 justify-center">
          <Users className="w-4 h-4" /> View Roster
        </button>
        <button onClick={() => onNavigate('events')} className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-white uppercase tracking-widest hover:bg-zinc-700 transition-colors flex items-center gap-2 justify-center">
          <Calendar className="w-4 h-4" /> View Events
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-4 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-1.5 ${color}`} />
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">{label}</p>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{label}</span>
      <span className={`text-sm font-bold ${mono ? 'font-mono text-yellow-500' : 'text-white'}`}>{value}</span>
    </div>
  );
}

