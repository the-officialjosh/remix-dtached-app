import React, { useState } from 'react';
import { Search, MapPin, UserCheck, ShieldCheck, MailPlus, AlertCircle } from 'lucide-react';
import { API_URL as API } from '../../../lib/api';

export default function FreeAgentsTab({ team }: { team: any }) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    position: '',
    city: '',
    verifiedOnly: true
  });

  const searchAgents = async () => {
    setLoading(true);
    try {
      // Stub: in real world, build query params
      const res = await fetch(`${API}/players/free-agents?pos=${searchParams.position}&city=${searchParams.city}&verified=${searchParams.verifiedOnly}`);
      if (res.ok) setAgents(await res.json());
      else setAgents([]); // fallback since backend isn't ready
    } catch {
      setAgents([]);
    }
    setLoading(false);
  };

  const sendInterest = async (playerId: number) => {
    if (!confirm('Send interest to this player? They will review it and can choose to join your team.')) return;
    // Stub
    alert('Interest sent (stub)!');
  };

  if (!team) return null;
  const isLocked = team.rosterLocked || false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Free Agent Market</h3>
          <p className="text-sm text-zinc-400 mt-1">Discover unassigned, eligible players actively looking for teams.</p>
        </div>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Position</label>
          <input
            type="text"
            placeholder="e.g. QB, WR"
            className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-500/50"
            value={searchParams.position}
            onChange={(e) => setSearchParams({ ...searchParams, position: e.target.value })}
          />
        </div>
        <div className="flex-1 w-full space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">City</label>
          <div className="relative">
            <input
              type="text"
              placeholder="City name"
              className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 pl-9 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-500/50"
              value={searchParams.city}
              onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="verifiedOnly"
            className="w-4 h-4 accent-yellow-500 cursor-pointer"
            checked={searchParams.verifiedOnly}
            onChange={(e) => setSearchParams({ ...searchParams, verifiedOnly: e.target.checked })}
          />
          <label htmlFor="verifiedOnly" className="text-sm text-white font-bold cursor-pointer">Verified Cards Only</label>
        </div>
        <button
          onClick={searchAgents}
          className="px-6 py-2 bg-yellow-500 text-black font-black uppercase text-sm rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 h-[42px]"
        >
          <Search className="w-4 h-4" /> Find
        </button>
      </div>

      {isLocked && (
        <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">Roster is locked. You cannot recruit or send interest to free agents right now.</p>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-zinc-500">Searching...</div>
      ) : agents.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-zinc-800 rounded-2xl">
          <UserCheck className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">Use the filters above to discover players.</p>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-2">Only unattached, visible players are shown.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(a => (
            <div key={a.id} className="bg-zinc-800/30 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-700 rounded-xl overflow-hidden shrink-0">
                    {a.photoUrl ? <img src={a.photoUrl} alt="P" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">{a.firstName?.[0]}</div>}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{a.firstName} {a.lastName}</h4>
                    <span className="text-xs text-yellow-500 font-bold uppercase tracking-widest">{a.position}</span>
                  </div>
                </div>
                {a.isVerified && (
                  <ShieldCheck className="w-5 h-5 text-green-400" title="Verified Player" />
                )}
              </div>
              <div className="space-y-1 mb-4 text-xs text-zinc-400">
                <p>Location: <span className="text-white font-bold">{a.city || 'Unknown'}</span></p>
                <p>Bio: <span className="italic">{a.bio ? `${a.bio.substring(0, 50)}...` : 'No bio'}</span></p>
              </div>
              <button
                disabled={isLocked}
                onClick={() => sendInterest(a.id)}
                className="w-full py-2 bg-zinc-800 text-white font-bold text-xs uppercase rounded-lg hover:bg-zinc-700 flex items-center justify-center gap-2 border border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MailPlus className="w-4 h-4" /> Send Interest
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
