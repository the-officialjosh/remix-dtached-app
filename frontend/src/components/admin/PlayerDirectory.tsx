import React, { useState, useEffect } from 'react';
import { Users, Shield, Search, RefreshCw } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

const STATUSES = ['', 'ON_TEAM', 'FREE_AGENT', 'PENDING_TRANSFER', 'PENDING_MATCH', 'INACTIVE'];
const POSITIONS = ['', 'QB', 'WR', 'RB', 'TE', 'DB', 'LB', 'DL', 'OL', 'K', 'ATH'];

export default function PlayerDirectory() {
  const token = localStorage.getItem('token');
  const [players, setPlayers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    let url = `${API}/admin/players`;
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (positionFilter) params.set('position', positionFilter);
    if (params.toString()) url += '?' + params.toString();

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setPlayers(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, positionFilter]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ON_TEAM: 'bg-green-500/10 text-green-400',
      FREE_AGENT: 'bg-blue-500/10 text-blue-400',
      PENDING_TRANSFER: 'bg-orange-500/10 text-orange-400',
      PENDING_MATCH: 'bg-pink-500/10 text-pink-400',
      INACTIVE: 'bg-zinc-500/10 text-zinc-400',
    };
    return colors[status] || 'bg-zinc-500/10 text-zinc-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Player Directory</h3>
        <button onClick={load} className="text-zinc-500 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select
          value={positionFilter}
          onChange={e => setPositionFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white"
        >
          <option value="">All Positions</option>
          {POSITIONS.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className="text-[10px] text-zinc-500 self-center uppercase font-bold">{players.length} players</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" /></div>
      ) : players.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map((p: any) => (
            <div key={p.id} className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-700 overflow-hidden">
                  <img
                    src={p.photoUrl || p.photo_url || `https://picsum.photos/seed/${p.id}/100/100`}
                    className="w-full h-full object-cover"
                    alt={p.firstName}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{p.firstName} {p.lastName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${statusBadge(p.status)}`}>
                      {(p.status || 'N/A').replace(/_/g, ' ')}
                    </span>
                    {p.position && (
                      <span className="text-[9px] text-yellow-500 font-bold">{p.position}</span>
                    )}
                    {p.isVerified && (
                      <Shield className="w-3 h-3 text-green-400" />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[9px] text-zinc-500 space-y-0.5">
                {p.team && <p><Users className="w-3 h-3 inline mr-1" />{p.team.name}</p>}
                {p.city && <p>{p.city}{p.provinceState ? `, ${p.provinceState}` : ''}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-zinc-800 border-dashed rounded-2xl">
          <Search className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium italic">No players match your filters.</p>
        </div>
      )}
    </div>
  );
}
