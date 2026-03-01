import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Mail, CheckCircle, XCircle, Ticket } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { API_URL as API } from '../../lib/api';

export default function PlayerDashboard() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [player, setPlayer] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const [joinErr, setJoinErr] = useState('');
  const [loading, setLoading] = useState(true);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    Promise.all([
      fetch(`${API}/players/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null),
      fetch(`${API}/my/requests`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []),
    ]).then(([p, reqs]) => {
      setPlayer(p);
      setRequests(reqs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const handleRequest = async (id: number, action: 'accept' | 'reject') => {
    await fetch(`${API}/team-requests/${id}/${action}`, {
      method: 'PUT',
      headers: authHeaders,
    });
    setRequests(requests.filter(r => r.id !== id));
    // Refresh player data
    const p = await fetch(`${API}/players/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (p.ok) setPlayer(await p.json());
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinMsg('');
    setJoinErr('');
    try {
      const res = await fetch(`${API}/invites/${inviteCode.trim()}/accept`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setJoinMsg(data.message || 'Successfully joined team!');
        setInviteCode('');
        // Refresh player
        const p = await fetch(`${API}/players/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (p.ok) setPlayer(await p.json());
      } else {
        setJoinErr(data.message || data.error || 'Invalid invite code');
      }
    } catch {
      setJoinErr('Failed to join team');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
        <UserPlus className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">No Player Profile</h3>
        <p className="text-zinc-500 mb-6">Register as a player to get started with teams and events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Player Info Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-zinc-800 overflow-hidden border-2 border-yellow-500/20">
            <img
              src={player.photo_url || player.photoUrl || `https://picsum.photos/seed/${player.id}/200/200`}
              className="w-full h-full object-cover"
              alt={player.name || `${player.first_name || player.firstName} ${player.last_name || player.lastName}`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
              {player.name || `${player.first_name || player.firstName} ${player.last_name || player.lastName}`}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-3 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase">
                {player.position}
              </span>
              {player.team_name || player.teamName ? (
                <span className="text-xs text-zinc-400">
                  <Users className="w-3 h-3 inline mr-1" />
                  {player.team_name || player.teamName}
                </span>
              ) : (
                <span className="text-xs text-orange-400 font-bold uppercase">Free Agent</span>
              )}
              {(player.is_verified || player.isVerified) && (
                <span className="flex items-center gap-1 text-green-400 text-[10px] font-bold">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              #{player.number || '—'} • {player.height || '—'} • {player.city}
            </p>
          </div>
        </div>
      </div>

      {/* Join Team by Invite Code */}
      {!(player.team_name || player.teamName) && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h4 className="text-lg font-bold text-white uppercase italic tracking-tighter mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-yellow-500" /> Join Team by Invite Code
          </h4>
          <form onSubmit={handleJoinByCode} className="flex gap-3">
            <input
              type="text"
              placeholder="Enter invite code (e.g. INV-A1B2C3D4)"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-yellow-500 text-black font-bold text-xs uppercase rounded-xl hover:bg-yellow-400 transition-all"
            >
              Join
            </button>
          </form>
          {joinMsg && <p className="text-green-400 text-sm mt-3">{joinMsg}</p>}
          {joinErr && <p className="text-red-400 text-sm mt-3">{joinErr}</p>}
        </div>
      )}

      {/* Incoming Team Requests */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-white uppercase italic tracking-tighter flex items-center gap-2">
            <Mail className="w-5 h-5 text-yellow-500" /> Team Requests
          </h4>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            {requests.length} Pending
          </span>
        </div>

        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700">
                <div>
                  <p className="text-white font-bold">
                    {req.team_name || req.teamName || `Team #${req.team_id || req.teamId}`}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">
                    {req.direction || 'TEAM_TO_PLAYER'} request
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(req.id, 'accept')}
                    className="flex items-center gap-1 px-4 py-2 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded-lg hover:bg-green-500/20 transition-all"
                  >
                    <CheckCircle className="w-3 h-3" /> Accept
                  </button>
                  <button
                    onClick={() => handleRequest(req.id, 'reject')}
                    className="flex items-center gap-1 px-4 py-2 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded-lg hover:bg-red-500/20 transition-all"
                  >
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-zinc-800 border-dashed rounded-2xl">
            <Mail className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No pending team requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
