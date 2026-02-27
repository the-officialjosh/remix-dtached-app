import React, { useState } from 'react';
import { Plus, Save, Edit2 } from 'lucide-react';
import type { TeamStandings } from '../../types';

const TeamManagement = ({ teams, onUpdate }: { teams: TeamStandings[]; onUpdate: () => void }) => {
  const [editingTeam, setEditingTeam] = useState<Partial<TeamStandings> | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingTeam)
    });
    setEditingTeam(null);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Team Management</h3>
        <button 
          onClick={() => setEditingTeam({ name: '', type: '7v7', division: 'Elite' })}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-full text-xs hover:bg-yellow-400 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Team
        </button>
      </div>

      {editingTeam && (
        <form onSubmit={handleSave} className="bg-zinc-800/50 p-6 rounded-3xl border border-zinc-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              placeholder="Team Name" 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingTeam.name || ''}
              onChange={e => setEditingTeam({...editingTeam, name: e.target.value})}
              required
            />
            <select 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingTeam.division || 'Elite'}
              onChange={e => setEditingTeam({...editingTeam, division: e.target.value as any})}
            >
              <option value="Elite">Elite</option>
              <option value="16U">16U</option>
              <option value="14U">14U</option>
            </select>
            <input 
              placeholder="City" 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingTeam.city || ''}
              onChange={e => setEditingTeam({...editingTeam, city: e.target.value})}
            />
            <input 
              placeholder="Coach Name" 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingTeam.coach_name || ''}
              onChange={e => setEditingTeam({...editingTeam, coach_name: e.target.value})}
            />
          </div>
          <textarea 
            placeholder="Team Bio" 
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white h-24"
            value={editingTeam.bio || ''}
            onChange={e => setEditingTeam({...editingTeam, bio: e.target.value})}
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditingTeam(null)} className="px-6 py-2 text-zinc-500 font-bold text-xs uppercase">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-full text-xs uppercase flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Team
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team.id} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center group">
            <div>
              <p className="text-white font-bold">{team.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">{team.division} • {team.city || 'No City'}</p>
            </div>
            <button onClick={() => setEditingTeam(team)} className="p-2 text-zinc-500 hover:text-yellow-500 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamManagement;
