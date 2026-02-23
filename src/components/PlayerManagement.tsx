import React, { useState } from 'react';
import { Plus, Save, Shield, Edit2 } from 'lucide-react';
import type { Player, TeamStandings } from '../types';

const PlayerManagement = ({ players, teams, onUpdate }: { players: Player[]; teams: TeamStandings[]; onUpdate: () => void }) => {
  const [editingPlayer, setEditingPlayer] = useState<Partial<Player> | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingPlayer)
    });
    setEditingPlayer(null);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Player Profiles</h3>
        <button 
          onClick={() => setEditingPlayer({ name: '', number: 0, position: 'WR', team_name: teams[0]?.name })}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-full text-xs hover:bg-yellow-400 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Profile
        </button>
      </div>

      {editingPlayer && (
        <form onSubmit={handleSave} className="bg-zinc-800/50 p-6 rounded-3xl border border-zinc-700 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input 
              placeholder="Player Name" 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingPlayer.name || ''}
              onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})}
              required
            />
            <input 
              type="number"
              placeholder="Number" 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingPlayer.number ?? ''}
              onChange={e => setEditingPlayer({...editingPlayer, number: parseInt(e.target.value)})}
            />
            <select 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingPlayer.position || 'WR'}
              onChange={e => setEditingPlayer({...editingPlayer, position: e.target.value})}
            >
              <option value="QB">QB</option>
              <option value="WR">WR</option>
              <option value="RB">RB</option>
              <option value="DB">DB</option>
              <option value="LB">LB</option>
            </select>
            <select 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={teams.find(t => t.name === editingPlayer.team_name)?.id || ''}
              onChange={e => {
                const team = teams.find(t => t.id === parseInt(e.target.value));
                setEditingPlayer({...editingPlayer, team_name: team?.name, team_id: team?.id} as any);
              }}
            >
              <option value="">Select Team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input 
              type="date"
              placeholder="DOB" 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingPlayer.dob || ''}
              onChange={e => setEditingPlayer({...editingPlayer, dob: e.target.value})}
            />
            <select 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingPlayer.gender || 'Boy'}
              onChange={e => setEditingPlayer({...editingPlayer, gender: e.target.value})}
            >
              <option value="Boy">Boy</option>
              <option value="Girl">Girl</option>
            </select>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl p-3">
              <input 
                type="checkbox"
                id="jersey_confirmed"
                checked={editingPlayer.jersey_confirmed === 1}
                onChange={e => setEditingPlayer({...editingPlayer, jersey_confirmed: e.target.checked ? 1 : 0})}
                className="w-4 h-4 accent-yellow-500"
              />
              <label htmlFor="jersey_confirmed" className="text-sm text-zinc-400 cursor-pointer">Jersey Confirmed</label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditingPlayer(null)} className="px-6 py-2 text-zinc-500 font-bold text-xs uppercase">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-full text-xs uppercase flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {players.map(player => (
          <div key={player.id} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden">
                <img src={player.photo || `https://picsum.photos/seed/${player.id}/100/100`} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-bold text-xs">{player.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[9px] text-zinc-500 uppercase font-bold">{player.team_name} • #{player.number}</p>
                  {player.jersey_confirmed === 1 && (
                    <Shield className="w-2 h-2 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setEditingPlayer(player)} className="p-2 text-zinc-500 hover:text-yellow-500 transition-colors">
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerManagement;
