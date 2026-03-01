import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

export default function TransferQueue() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API}/admin/transfers`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setTransfers)
      .catch(() => setTransfers([]))
      .finally(() => setLoading(false));
  }, [token]);

  const handleTransfer = async (id: number, action: 'approve' | 'reject') => {
    await fetch(`${API}/admin/transfers/${id}/${action}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    setTransfers(transfers.filter(t => t.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white italic uppercase tracking-tighter flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-yellow-500" /> Transfer Queue
        </h3>
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{transfers.length} Pending</span>
      </div>

      {transfers.length > 0 ? (
        <div className="space-y-3">
          {transfers.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between bg-zinc-800/50 p-5 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-bold">
                    {t.player_name || t.playerName || `Player #${t.player_id || t.playerId}`}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">
                    {t.from_team_name || t.fromTeamName || 'Unknown'} → {t.to_team_name || t.toTeamName || t.team_name || t.teamName || 'Unknown'}
                  </p>
                  <p className="text-[9px] text-zinc-600 mt-0.5">
                    {t.created_at || t.createdAt ? new Date(t.created_at || t.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTransfer(t.id, 'approve')}
                  className="flex items-center gap-1 px-4 py-2 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded-lg hover:bg-green-500/20 transition-all"
                >
                  <CheckCircle className="w-3 h-3" /> Approve
                </button>
                <button
                  onClick={() => handleTransfer(t.id, 'reject')}
                  className="flex items-center gap-1 px-4 py-2 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded-lg hover:bg-red-500/20 transition-all"
                >
                  <XCircle className="w-3 h-3" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
          <ArrowRightLeft className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">No pending transfers.</p>
          <p className="text-[10px] text-zinc-600 mt-1">Transfer requests from coaches will appear here for approval.</p>
        </div>
      )}
    </div>
  );
}
