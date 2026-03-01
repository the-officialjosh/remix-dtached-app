import React, { useState, useEffect } from 'react';
import { Users, Shield } from 'lucide-react';
import type { Player } from '../../types';

const CoachDashboard = ({ onUpdate, players }: { onUpdate: () => void; players: Player[] }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const coachId = 'current-user-id'; // Simulating auth

  useEffect(() => {
    fetch(`/api/roster-requests?coach_id=${coachId}`)
      .then(res => res.json())
      .then(setRequests);
  }, []);

  const handleRequest = async (requestId: number, status: 'accepted' | 'rejected') => {
    const res = await fetch('/api/roster-requests/handle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, status })
    });
    const data = await res.json();
    if (data.success) {
      setRequests(requests.filter(r => r.id !== requestId));
      onUpdate();
    } else {
      alert(data.error);
    }
  };

  const confirmJersey = async (playerId: number, number: number) => {
    await fetch('/api/players/confirm-jersey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, number })
    });
    onUpdate();
  };

  const coachTeam = players.find(p => p.linked_user_id === coachId)?.team_name;
  const teamPlayers = players.filter(p => p.team_name === coachTeam);

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Roster Requests</h3>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{requests.length} Pending</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {requests.length > 0 ? requests.map(req => (
            <div key={req.id} className="bg-zinc-800/50 p-6 rounded-3xl border border-zinc-800 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700">
                  <img src={req.player_photo || `https://picsum.photos/seed/${req.player_id}/100/100`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{req.player_name}</p>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">{req.position} • {req.gender}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleRequest(req.id, 'rejected')} className="px-6 py-2 bg-zinc-900 text-zinc-500 font-bold text-xs uppercase rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all">Reject</button>
                <button onClick={() => handleRequest(req.id, 'accepted')} className="px-6 py-2 bg-yellow-500 text-black font-bold text-xs uppercase rounded-full hover:bg-yellow-400 transition-all">Accept to Roster</button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
              <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium italic">No pending roster requests for your team.</p>
            </div>
          )}
        </div>
      </div>

      {coachTeam && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Jersey Confirmation (Tournament Day)</h3>
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
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Current: #{player.number}</p>
                  </div>
                </div>
                {player.jersey_confirmed ? (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Shield className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Confirmed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      defaultValue={player.number}
                      className="w-16 bg-zinc-800 border border-zinc-700 rounded-lg p-1 text-xs text-white text-center"
                      id={`jersey-${player.id}`}
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById(`jersey-${player.id}`) as HTMLInputElement;
                        confirmJersey(player.id, parseInt(input.value));
                      }}
                      className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-bold uppercase rounded-lg hover:bg-yellow-400 transition-all"
                    >
                      Confirm
                    </button>
                  </div>
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
