import React, { useState, useEffect } from 'react';
import { Users, Shield, UserPlus, Search } from 'lucide-react';
import type { Player } from '../../types';

const API = import.meta.env.VITE_API_URL || '/api';

const CoachDashboard = ({ onUpdate, players }: { onUpdate: () => void; players: Player[] }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [freeAgents, setFreeAgents] = useState<any[]>([]);
  const [positionFilter, setPositionFilter] = useState('');
  const [showFreeAgents, setShowFreeAgents] = useState(false);
  const [myTeam, setMyTeam] = useState<any>(null);
  const token = localStorage.getItem('token');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Load coach's team requests
  useEffect(() => {
    fetch(`${API}/my/requests`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(setRequests)
      .catch(() => setRequests([]));

    fetch(`${API}/my/team`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(setMyTeam)
      .catch(() => {});
  }, [token]);

  const loadFreeAgents = async () => {
    const url = positionFilter ? `${API}/players/free-agents?position=${positionFilter}` : `${API}/players/free-agents`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setFreeAgents(await res.json());
    setShowFreeAgents(true);
  };

  const handleRequest = async (requestId: number, action: 'accept' | 'reject') => {
    await fetch(`${API}/team-requests/${requestId}/${action}`, {
      method: 'PUT',
      headers: authHeaders,
    });
    setRequests(requests.filter(r => r.id !== requestId));
    onUpdate();
  };

  const sendRequestToPlayer = async (playerId: number) => {
    await fetch(`${API}/team-requests/${playerId}`, {
      method: 'POST',
      headers: authHeaders,
    });
    // Remove from free agents list
    setFreeAgents(freeAgents.filter(a => a.id !== playerId));
  };

  const confirmJersey = async (playerId: number) => {
    await fetch(`${API}/players/confirm-jersey`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ playerId })
    });
    onUpdate();
  };

  const lockRoster = async () => {
    await fetch(`${API}/my/team/roster/lock`, {
      method: 'PUT',
      headers: authHeaders,
    });
    onUpdate();
  };

  const teamPlayers = myTeam
    ? players.filter(p => p.team_name === myTeam.name)
    : [];

  return (
    <div className="space-y-12">
      {/* My Team Info */}
      {myTeam && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">My Team: {myTeam.name}</h3>
            <div className="flex gap-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                {myTeam.status} • {teamPlayers.length} Players
              </span>
              <button 
                onClick={lockRoster}
                className="px-4 py-1.5 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded-full hover:bg-red-500/20 transition-all"
              >
                Lock Roster
              </button>
            </div>
          </div>
          {myTeam.invite_code && (
            <div className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-xl">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Invite Code:</span>
              <span className="text-sm font-mono text-yellow-500 font-bold">{myTeam.invite_code || myTeam.inviteCode}</span>
            </div>
          )}
        </div>
      )}

      {/* Free Agent Browse */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Browse Free Agents</h3>
          <div className="flex items-center gap-2">
            <select
              value={positionFilter}
              onChange={e => setPositionFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white"
            >
              <option value="">All Positions</option>
              {['QB', 'WR', 'RB', 'TE', 'DB', 'LB', 'DL', 'OL', 'K', 'ATH'].map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            <button onClick={loadFreeAgents} className="flex items-center gap-1 px-4 py-2 bg-yellow-500 text-black font-bold rounded-full text-xs hover:bg-yellow-400 transition-all">
              <Search className="w-3 h-3" /> Search
            </button>
          </div>
        </div>

        {showFreeAgents && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freeAgents.length > 0 ? freeAgents.map((agent: any) => (
              <div key={agent.id} className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">{agent.first_name || agent.firstName} {agent.last_name || agent.lastName}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">
                    {agent.position} • {agent.height || '—'} • {agent.city || 'No City'}
                  </p>
                </div>
                <button 
                  onClick={() => sendRequestToPlayer(agent.id)}
                  className="flex items-center gap-1 px-4 py-2 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase rounded-full hover:bg-yellow-500/20 transition-all"
                >
                  <UserPlus className="w-3 h-3" /> Invite
                </button>
              </div>
            )) : (
              <div className="col-span-2 p-8 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
                <p className="text-zinc-500 font-medium italic">No free agents found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Roster Requests */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Roster Requests</h3>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{requests.length} Pending</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {requests.length > 0 ? requests.map((req: any) => (
            <div key={req.id} className="bg-zinc-800/50 p-6 rounded-3xl border border-zinc-800 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700">
                  <img src={`https://picsum.photos/seed/${req.id}/100/100`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">Request #{req.id}</p>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">{req.direction || 'TEAM_TO_PLAYER'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleRequest(req.id, 'reject')} className="px-6 py-2 bg-zinc-900 text-zinc-500 font-bold text-xs uppercase rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all">Reject</button>
                <button onClick={() => handleRequest(req.id, 'accept')} className="px-6 py-2 bg-yellow-500 text-black font-bold text-xs uppercase rounded-full hover:bg-yellow-400 transition-all">Accept</button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
              <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium italic">No pending roster requests.</p>
            </div>
          )}
        </div>
      </div>

      {/* Jersey Confirmation */}
      {teamPlayers.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Jersey Confirmation</h3>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{teamPlayers.filter(p => !p.jersey_confirmed).length} Unconfirmed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamPlayers.map(player => (
              <div key={player.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                    <img src={player.photo || `https://picsum.photos/seed/${player.id}/100/100`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{player.name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">#{player.number}</p>
                  </div>
                </div>
                {player.jersey_confirmed === 1 ? (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Shield className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Confirmed</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => confirmJersey(player.id)}
                    className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-bold uppercase rounded-lg hover:bg-yellow-400 transition-all"
                  >
                    Confirm
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;
