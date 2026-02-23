import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { Player } from '../types';

const StatsManagement = ({ players, onUpdate }: { players: Player[]; onUpdate: () => void }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | ''>('');
  const [stats, setStats] = useState({
    yards: 0, touchdowns: 0, catches: 0, interceptions: 0, pass_yards: 0, pass_attempts: 0, pass_completions: 0, sacks: 0
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;
    await fetch('/api/stats/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: selectedPlayerId, game_id: 1, ...stats })
    });
    setStats({ yards: 0, touchdowns: 0, catches: 0, interceptions: 0, pass_yards: 0, pass_attempts: 0, pass_completions: 0, sacks: 0 });
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Update Game Stats</h3>
      <form onSubmit={handleUpdate} className="space-y-6">
        <select 
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-sm text-white"
          value={selectedPlayerId}
          onChange={e => setSelectedPlayerId(parseInt(e.target.value))}
          required
        >
          <option value="">Select Player to Update</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.team_name})</option>)}
        </select>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats).map(([key, val]) => (
            <div key={key}>
              <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">{key.replace('_', ' ')}</label>
              <input 
                type="number"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white font-mono"
                value={val}
                onChange={e => setStats({...stats, [key]: parseInt(e.target.value) || 0})}
              />
            </div>
          ))}
        </div>

        <button type="submit" className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <Save className="w-5 h-5" /> Submit Stats Update
        </button>
      </form>
    </div>
  );
};

export default StatsManagement;
