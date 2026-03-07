import React from 'react';
import { Users, Lock, Unlock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { API_URL as API } from '../../../lib/api';

export default function RosterTab({ team, onUpdate }: { team: any, onUpdate: () => void }) {
  if (!team) return null;

  const rosterCount = team.roster?.length || 0;
  const isLocked = team.rosterLocked || false;

  const token = localStorage.getItem('dtached_token');
  const authJson = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const toggleRosterLock = async () => {
    let confirmMsg = isLocked 
      ? 'Unlock the roster? Players will be able to join via invite code again.'
      : 'Lock the roster? This will block all new joins via invite code and free agent acceptances until unlocked.';
    
    if (!confirm(confirmMsg)) return;

    const endpoint = isLocked ? 'unlock' : 'lock';
    await fetch(`${API}/my/team/roster/${endpoint}`, { method: 'PUT', headers: authJson });
    onUpdate();
  };

  const releasePlayer = async (playerId: number) => {
    if (!confirm('Remove this player from the roster? They will immediately lose access to team features.')) return;
    await fetch(`${API}/my/team/players/${playerId}`, { method: 'DELETE', headers: authJson });
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">
          Team Roster <span className="text-zinc-500 text-sm ml-2">({rosterCount})</span>
        </h3>
        <button
          onClick={toggleRosterLock}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
            isLocked
              ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
          }`}
        >
          {isLocked ? <><Unlock className="w-3.5 h-3.5" /> Unlock Roster</> : <><Lock className="w-3.5 h-3.5" /> Lock Roster</>}
        </button>
      </div>

      {isLocked && (
        <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 px-4 py-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">Roster is locked. No new joins or modifications allowed. Only removals are permitted.</p>
        </div>
      )}

      {rosterCount === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No players on the roster yet.</p>
        </div>
      ) : (
        <div className="bg-zinc-800/20 rounded-xl overflow-hidden border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-800/80 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-widest">
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Pos & Jersey</th>
                  <th className="px-4 py-3">Player Card</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(team.roster || []).map((p: any) => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-white">{p.name || `${p.firstName} ${p.lastName}`}</p>
                      <span className="text-[10px] font-mono text-zinc-500">{p.playerTag}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-300">{p.position || 'N/A'}</span>
                        <span className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                          {p.number || '#'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                          <ShieldCheck className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                          Not Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => releasePlayer(p.id)}
                        className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded hover:bg-red-500/20 transition-all border border-red-500/20"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
