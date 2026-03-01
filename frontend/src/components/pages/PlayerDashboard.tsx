import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Mail, CheckCircle, XCircle, Ticket, Heart, Eye, EyeOff, AlertTriangle, Clock, CreditCard } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { API_URL as API } from '../../lib/api';

export default function PlayerDashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { user } = useAuth();
  const token = localStorage.getItem('dtached_token');
  const [player, setPlayer] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const [joinErr, setJoinErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const loadPlayer = () =>
    fetch(`${API}/players/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null);

  useEffect(() => {
    Promise.all([
      loadPlayer(),
      fetch(`${API}/my/requests`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []),
      fetch(`${API}/interests/my`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []),
    ]).then(([p, reqs, ints]) => {
      setPlayer(p);
      setRequests(reqs);
      setInterests(ints);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const handleRequest = async (id: number, action: 'accept' | 'reject') => {
    await fetch(`${API}/team-requests/${id}/${action}`, {
      method: 'PUT',
      headers: authHeaders,
    });
    setRequests(requests.filter(r => r.id !== id));
    const p = await loadPlayer();
    if (p) setPlayer(p);
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
        const p = await loadPlayer();
        if (p) setPlayer(p);
      } else {
        setJoinErr(data.message || data.error || 'Invalid invite code');
      }
    } catch {
      setJoinErr('Failed to join team');
    }
  };

  const toggleFreeAgent = async () => {
    setToggling(true);
    try {
      await fetch(`${API}/players/me/free-agent`, {
        method: 'PUT',
        headers: authHeaders,
      });
      const p = await loadPlayer();
      if (p) setPlayer(p);
    } catch { /* silently handle */ }
    setToggling(false);
  };

  const handlePlayerCardCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch(`${API}/payments/checkout/player-card`, {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
      }
    } catch {
      alert('Payment service unavailable');
    }
    setCheckingOut(false);
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
      <div className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border border-yellow-500/20 rounded-3xl p-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-5">
          <UserPlus className="w-10 h-10 text-yellow-500" />
        </div>
        <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Complete Your Profile</h3>
        <p className="text-zinc-400 mb-6 max-w-md mx-auto">Set up your player profile to appear on the free agent market, get matched with teams, and join events.</p>
        <button
          onClick={() => onNavigate?.('profile')}
          className="px-6 py-3 bg-yellow-500 text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-yellow-400 transition-all"
        >
          Set Up Profile
        </button>
      </div>
    );
  }

  const isFreeAgent = !(player.team_name || player.teamName);
  const isVerified = player.is_verified || player.isVerified;
  const isOpenToOffers = player.open_to_offers || player.openToOffers;
  const matchedInterests = interests.filter(i => i.status === 'MATCHED');
  const pendingInterests = interests.filter(i => i.status === 'PENDING');

  return (
    <div className="space-y-6">
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
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="px-3 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase">
                {player.position}
              </span>
              {!isFreeAgent ? (
                <span className="text-xs text-zinc-400">
                  <Users className="w-3 h-3 inline mr-1" />
                  {player.team_name || player.teamName}
                </span>
              ) : (
                <span className="text-xs text-orange-400 font-bold uppercase">Free Agent</span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                player.status === 'FREE_AGENT' ? 'bg-blue-500/10 text-blue-400' :
                player.status === 'ON_TEAM' ? 'bg-green-500/10 text-green-400' :
                player.status === 'PENDING_MATCH' ? 'bg-purple-500/10 text-purple-400' :
                player.status === 'PENDING_JOIN' ? 'bg-orange-500/10 text-orange-400' :
                'bg-zinc-500/10 text-zinc-400'
              }`}>
                {(player.status || '').replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              #{player.number || '—'} • {player.height || '—'} • {player.city}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Status Card */}
      <div className={`rounded-3xl p-6 border flex items-center gap-4 ${
        isVerified
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-amber-500/5 border-amber-500/20'
      }`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          isVerified ? 'bg-green-500/10' : 'bg-amber-500/10'
        }`}>
          {isVerified ? (
            <Shield className="w-7 h-7 text-green-400" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-amber-400" />
          )}
        </div>
        <div className="flex-1">
          <p className={`font-bold text-sm ${isVerified ? 'text-green-400' : 'text-amber-400'}`}>
            {isVerified ? 'Player Card Verified ✓' : 'Unverified — Player Card Required'}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            {isVerified
              ? 'You are visible on the free agent market and eligible for team matching.'
              : 'Purchase a Player Card ($9.99) to appear on the market and get matched with teams.'}
          </p>
        </div>
        {!isVerified && (
          <button
            onClick={handlePlayerCardCheckout}
            disabled={checkingOut}
            className="flex items-center gap-1 px-4 py-2 bg-amber-500 text-black text-[10px] font-bold uppercase rounded-xl hover:bg-amber-400 transition-all whitespace-nowrap disabled:opacity-50"
          >
            <CreditCard className="w-3 h-3" />
            {checkingOut ? 'Loading...' : 'Get Player Card — $9.99'}
          </button>
        )}
      </div>

      {/* Free Agent Toggle — only for verified, unattached players */}
      {isFreeAgent && isVerified && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOpenToOffers ? (
              <Eye className="w-5 h-5 text-green-400" />
            ) : (
              <EyeOff className="w-5 h-5 text-zinc-500" />
            )}
            <div>
              <p className="text-sm font-bold text-white">Free Agent Visibility</p>
              <p className="text-[10px] text-zinc-500">
                {isOpenToOffers
                  ? 'Coaches can see you on the market and express interest.'
                  : 'You are hidden from the market. Toggle on to receive team interest.'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleFreeAgent}
            disabled={toggling}
            className={`relative w-14 h-7 rounded-full transition-all ${
              isOpenToOffers ? 'bg-green-500' : 'bg-zinc-700'
            }`}
          >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${
              isOpenToOffers ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'
            }`} />
          </button>
        </div>
      )}

      {/* Interest Activity */}
      {(matchedInterests.length > 0 || pendingInterests.length > 0) && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-4">
          <h4 className="text-lg font-bold text-white uppercase italic tracking-tighter flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" /> Matching Activity
          </h4>

          {matchedInterests.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-green-400 uppercase font-bold tracking-widest">🎉 Mutual Matches</p>
              {matchedInterests.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between bg-green-500/5 border border-green-500/20 px-4 py-3 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {m.team?.name || `Team #${m.team?.id || m.teamId}`}
                    </p>
                    <p className="text-[10px] text-zinc-500">{m.direction} • Awaiting admin approval</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[9px] font-black uppercase rounded-full">Matched</span>
                </div>
              ))}
            </div>
          )}

          {pendingInterests.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-yellow-500 uppercase font-bold tracking-widest">Teams Interested in You</p>
              {pendingInterests.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/20 px-4 py-3 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {m.team?.name || `Team #${m.team?.id || m.teamId}`}
                    </p>
                    <p className="text-[10px] text-zinc-500">{m.direction}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase rounded-full">
                    <Clock className="w-3 h-3 inline mr-1" />Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Join Team by Invite Code */}
      {isFreeAgent && (
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
                    {req.request_type || req.requestType || 'JOIN'} • {req.direction || 'TEAM_TO_PLAYER'}
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
