import React, { useState, useEffect } from 'react';
import { Plus, Save, Edit2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { TeamStandings } from '../../types';

const API = import.meta.env.VITE_API_URL || '/api';

const TeamManagement = ({ teams, onUpdate }: { teams: TeamStandings[]; onUpdate: () => void }) => {
  const [editingTeam, setEditingTeam] = useState<Partial<TeamStandings> | null>(null);
  const [adminTeams, setAdminTeams] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Load all teams from admin endpoint (includes status)
  useEffect(() => {
    fetch(`${API}/admin/teams`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(setAdminTeams)
      .catch(() => setAdminTeams(teams as any[]));
  }, [teams, token]);

  const handleApprove = async (teamId: number) => {
    await fetch(`${API}/admin/teams/${teamId}/approve`, {
      method: 'PUT',
      headers: authHeaders,
    });
    onUpdate();
    // Refresh admin teams
    fetch(`${API}/admin/teams`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(setAdminTeams);
  };

  const handleReject = async (teamId: number) => {
    await fetch(`${API}/admin/teams/${teamId}/reject`, {
      method: 'PUT',
      headers: authHeaders,
    });
    onUpdate();
    fetch(`${API}/admin/teams`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(setAdminTeams);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API}/admin/games`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(editingTeam)
    });
    setEditingTeam(null);
    onUpdate();
  };

  const statusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'REJECTED': return <XCircle className="w-3 h-3 text-red-500" />;
      default: return <Clock className="w-3 h-3 text-yellow-500" />;
    }
  };

  const displayTeams = adminTeams.length > 0 ? adminTeams : teams;

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
        {displayTeams.map((team: any) => (
          <div key={team.id} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-white font-bold">{team.name}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">{team.division} • {team.city || 'No City'}</p>
              </div>
              <div className="flex items-center gap-1">
                {statusIcon(team.status)}
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  team.status === 'APPROVED' ? 'text-green-500' : team.status === 'REJECTED' ? 'text-red-500' : 'text-yellow-500'
                )}>{team.status || 'PENDING'}</span>
              </div>
            </div>
            {team.invite_code && (
              <p className="text-[10px] text-zinc-600 font-mono mb-2">Code: {team.invite_code || team.inviteCode}</p>
            )}
            {(!team.status || team.status === 'PENDING') && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleApprove(team.id)} className="flex-1 py-1.5 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded-lg hover:bg-green-500/20 transition-all">
                  Approve
                </button>
                <button onClick={() => handleReject(team.id)} className="flex-1 py-1.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded-lg hover:bg-red-500/20 transition-all">
                  Reject
                </button>
              </div>
            )}
            <button onClick={() => setEditingTeam(team)} className="mt-2 p-2 text-zinc-500 hover:text-yellow-500 transition-colors w-full flex items-center justify-center gap-1 text-[10px] uppercase font-bold">
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamManagement;
