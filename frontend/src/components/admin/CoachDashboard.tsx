import React, { useState, useEffect } from 'react';
import { Users, Shield, UserPlus, Search, Mail, Send, Trash2, Plus, Briefcase } from 'lucide-react';
import type { Player } from '../../types';
import { API_URL as API } from '../../lib/api';
import TeamRegistration from '../coach/TeamRegistration';

const CoachDashboard = ({ onUpdate, players }: { onUpdate: () => void; players: Player[] }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [freeAgents, setFreeAgents] = useState<any[]>([]);
  const [positionFilter, setPositionFilter] = useState('');
  const [showFreeAgents, setShowFreeAgents] = useState(false);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Invites state
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');

  // Team needs state
  const [needs, setNeeds] = useState<any[]>([]);
  const [needPosition, setNeedPosition] = useState('WR');
  const [needCount, setNeedCount] = useState(1);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Load coach's team + requests
  useEffect(() => {
    fetch(`${API}/my/team`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(team => {
        setMyTeam(team);
        setTeamLoading(false);
        if (team) {
          // Load invites and needs for this team
          fetch(`${API}/teams/${team.id}/invites`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : []).then(setInvites);
          fetch(`${API}/teams/${team.id}/needs`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : []).then(setNeeds);
        }
      })
      .catch(() => setTeamLoading(false));

    fetch(`${API}/my/requests`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(setRequests)
      .catch(() => setRequests([]));
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

  // Invite by email
  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam) return;
    setInviteMsg('');
    const res = await fetch(`${API}/teams/${myTeam.id}/invite`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ email: inviteEmail }),
    });
    const data = await res.json();
    if (res.ok) {
      setInviteMsg(`Invite sent! Code: ${data.inviteCode}`);
      setInviteEmail('');
      // Refresh invites
      fetch(`${API}/teams/${myTeam.id}/invites`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []).then(setInvites);
    } else {
      setInviteMsg(data.message || 'Failed to send invite');
    }
  };

  // Team needs
  const addNeed = async () => {
    if (!myTeam) return;
    await fetch(`${API}/teams/${myTeam.id}/needs`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ position: needPosition, count: needCount }),
    });
    fetch(`${API}/teams/${myTeam.id}/needs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : []).then(setNeeds);
  };

  const removeNeed = async (needId: number) => {
    await fetch(`${API}/team-needs/${needId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    setNeeds(needs.filter(n => n.id !== needId));
  };

  const teamPlayers = myTeam
    ? players.filter(p => p.team_name === myTeam.name)
    : [];

  if (teamLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  // No team yet — show registration form
  if (!myTeam) {
    return (
      <div className="space-y-6">
        <TeamRegistration onComplete={() => {
          fetch(`${API}/my/team`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.ok ? res.json() : null)
            .then(setMyTeam);
          onUpdate();
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* My Team Info */}
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
        {(myTeam.invite_code || myTeam.inviteCode) && (
          <div className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Team Invite Code:</span>
            <span className="text-sm font-mono text-yellow-500 font-bold">{myTeam.invite_code || myTeam.inviteCode}</span>
          </div>
        )}
      </div>

      {/* Invite Player by Email */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Mail className="w-4 h-4 text-yellow-500" /> Invite Player by Email
        </h3>
        <form onSubmit={sendInvite} className="flex gap-3">
          <input
            type="email"
            placeholder="player@email.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white placeholder:text-zinc-600"
            required
          />
          <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-yellow-500 text-black font-bold text-xs uppercase rounded-xl hover:bg-yellow-400 transition-all">
            <Send className="w-3 h-3" /> Send
          </button>
        </form>
        {inviteMsg && <p className="text-sm text-yellow-400">{inviteMsg}</p>}

        {/* Sent Invites */}
        {invites.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Sent Invites</p>
            {invites.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between bg-zinc-800/30 px-4 py-2 rounded-xl">
                <div>
                  <span className="text-xs text-white font-mono">{inv.inviteCode || inv.invite_code}</span>
                  {inv.email && <span className="text-[10px] text-zinc-500 ml-2">{inv.email}</span>}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  inv.status === 'ACCEPTED' ? 'text-green-400' : inv.status === 'EXPIRED' ? 'text-red-400' : 'text-yellow-500'
                }`}>{inv.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Position Needs */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-yellow-500" /> Position Needs
        </h3>
        <div className="flex gap-3 items-end">
          <select
            value={needPosition}
            onChange={e => setNeedPosition(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white"
          >
            {['QB', 'WR', 'RB', 'TE', 'DB', 'LB', 'DL', 'OL', 'K', 'ATH'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={needCount}
            onChange={e => setNeedCount(parseInt(e.target.value) || 1)}
            className="w-16 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
          />
          <button onClick={addNeed} className="flex items-center gap-1 px-4 py-2 bg-yellow-500 text-black font-bold text-xs uppercase rounded-xl hover:bg-yellow-400 transition-all">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {needs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {needs.map((need: any) => (
              <div key={need.id} className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
                <span className="text-xs font-bold text-yellow-500">{need.position}</span>
                <span className="text-[10px] text-zinc-400">×{need.count}</span>
                <button onClick={() => removeNeed(need.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Free Agent Browse */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white italic uppercase tracking-tighter">Browse Free Agents</h3>
          <div className="flex items-center gap-2">
            <select
              value={positionFilter}
              onChange={e => setPositionFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl p-2 text-xs text-white"
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
          <h3 className="text-lg font-bold text-white italic uppercase tracking-tighter">Roster Requests</h3>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{requests.length} Pending</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {requests.length > 0 ? requests.map((req: any) => (
            <div key={req.id} className="bg-zinc-800/50 p-6 rounded-3xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700">
                  <img src={`https://picsum.photos/seed/${req.id}/100/100`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Request #{req.id}</p>
                  <p className="text-xs text-zinc-500 uppercase font-bold">{req.direction || 'TEAM_TO_PLAYER'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleRequest(req.id, 'reject')} className="px-5 py-2 bg-zinc-900 text-zinc-500 font-bold text-xs uppercase rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all">Reject</button>
                <button onClick={() => handleRequest(req.id, 'accept')} className="px-5 py-2 bg-yellow-500 text-black font-bold text-xs uppercase rounded-full hover:bg-yellow-400 transition-all">Accept</button>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
              <Users className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
              <p className="text-zinc-500 font-medium italic">No pending roster requests.</p>
            </div>
          )}
        </div>
      </div>

      {/* Jersey Confirmation */}
      {teamPlayers.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white italic uppercase tracking-tighter">Jersey Confirmation</h3>
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
