import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { Player } from '../../types';
import { API_URL as API } from '../../lib/api';

const StatsManagement = ({ players, onUpdate }: { players: Player[]; onUpdate: () => void }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | ''>('');
  const [stats, setStats] = useState({
    totalYards: 0, totalTouchdowns: 0, totalCatches: 0, totalInterceptions: 0,
    totalPassYards: 0, totalPassAttempts: 0, totalPassCompletions: 0, totalSacks: 0
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const token = localStorage.getItem('token');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`${API}/admin/stats/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ playerId: selectedPlayerId, stats })
      });
      if (res.ok) {
        setSaved(true);
        setStats({ totalYards: 0, totalTouchdowns: 0, totalCatches: 0, totalInterceptions: 0, totalPassYards: 0, totalPassAttempts: 0, totalPassCompletions: 0, totalSacks: 0 });
        onUpdate();
      }
    } finally {
      setSaving(false);
    }
  };

  const statLabels: Record<string, string> = {
    totalYards: 'Yards', totalTouchdowns: 'TDs', totalCatches: 'Catches', totalInterceptions: 'INTs',
    totalPassYards: 'Pass Yds', totalPassAttempts: 'Pass Att', totalPassCompletions: 'Pass Comp', totalSacks: 'Sacks'
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
              <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">{statLabels[key] || key}</label>
              <input 
                type="number"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white font-mono"
                value={val}
                onChange={e => setStats({...stats, [key]: parseInt(e.target.value) || 0})}
              />
            </div>
          ))}
        </div>

        {saved && (
          <div className="text-green-400 text-sm text-center">Stats updated successfully!</div>
        )}

        <button type="submit" disabled={saving} className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          <Save className="w-5 h-5" /> {saving ? 'Updating...' : 'Submit Stats Update'}
        </button>
      </form>
    </div>
  );
};

export default StatsManagement;
