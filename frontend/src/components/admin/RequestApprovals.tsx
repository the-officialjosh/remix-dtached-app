import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, UserPlus, ArrowRight, RefreshCw } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

export default function RequestApprovals() {
  const token = localStorage.getItem('dtached_token');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(`${API}/admin/requests`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setRequests(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    await fetch(`${API}/admin/requests/${id}/${action}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    setRequests(requests.filter(r => r.id !== id));
  };

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Player Requests</h3>
        <button onClick={load} className="text-zinc-500 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((req: any) => (
            <div key={req.id} className="flex items-center justify-between bg-zinc-800/50 p-5 rounded-2xl border border-zinc-700">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  req.requestType === 'TRANSFER' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                }`}>
                  {req.requestType === 'TRANSFER' ? (
                    <ArrowRight className="w-5 h-5 text-orange-400" />
                  ) : (
                    <UserPlus className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-bold">
                    {req.player?.firstName} {req.player?.lastName}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                    {req.requestType === 'TRANSFER' ? (
                      <>{req.fromTeam?.name || 'Unknown'} → {req.team?.name}</>
                    ) : (
                      <>Wants to join {req.team?.name}</>
                    )}
                  </p>
                  <p className="text-[9px] text-zinc-600 mt-0.5">
                    {req.requestType} • {req.direction} • {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(req.id, 'approve')}
                  className="flex items-center gap-1 px-4 py-2 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded-lg hover:bg-green-500/20 transition-all"
                >
                  <CheckCircle className="w-3 h-3" /> Approve
                </button>
                <button
                  onClick={() => handleAction(req.id, 'reject')}
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
          <UserPlus className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium italic">No pending requests.</p>
        </div>
      )}
    </div>
  );
}
