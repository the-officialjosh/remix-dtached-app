import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

export default function MatchApprovals() {
  const token = localStorage.getItem('token');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(`${API}/admin/matches`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setMatches(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    await fetch(`${API}/admin/matches/${id}/${action}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    setMatches(matches.filter(m => m.id !== id));
  };

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Free Agent Matches</h3>
        <button onClick={load} className="text-zinc-500 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <p className="text-xs text-zinc-500">Only mutual matches appear here — both the team and the player expressed interest in each other.</p>

      {matches.length > 0 ? (
        <div className="space-y-3">
          {matches.map((match: any) => (
            <div key={match.id} className="flex items-center justify-between bg-zinc-800/50 p-5 rounded-2xl border border-zinc-700">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-white font-bold">
                    {match.player?.firstName} {match.player?.lastName}
                    <span className="text-zinc-500 mx-2">↔</span>
                    {match.team?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-[9px] font-bold">
                      {match.player?.position || 'N/A'}
                    </span>
                    <span className="text-[9px] text-zinc-600">
                      {match.direction} • {new Date(match.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(match.id, 'approve')}
                  className="flex items-center gap-1 px-4 py-2 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded-lg hover:bg-green-500/20 transition-all"
                >
                  <CheckCircle className="w-3 h-3" /> Approve
                </button>
                <button
                  onClick={() => handleAction(match.id, 'reject')}
                  className="flex items-center gap-1 px-4 py-2 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded-lg hover:bg-red-500/20 transition-all"
                >
                  <XCircle className="w-3 h-3" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-zinc-800 border-dashed rounded-2xl">
          <Heart className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium italic">No mutual matches awaiting approval.</p>
        </div>
      )}
    </div>
  );
}
