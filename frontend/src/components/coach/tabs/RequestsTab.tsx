import React, { useState } from 'react';
import { UserPlus, Check, X, Clock, ArrowRight } from 'lucide-react';
import { API_URL as API } from '../../../lib/api';

export default function RequestsTab({ team, pendingJoins, onUpdate }: { team: any, pendingJoins: any[], onUpdate: () => void }) {
  const [subTab, setSubTab] = useState<'incoming' | 'outgoing'>('incoming');
  const token = localStorage.getItem('dtached_token');
  const authJson = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const handleRequest = async (requestId: number, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;
    await fetch(`${API}/my/team/requests/${requestId}/${action}`, { method: 'POST', headers: authJson });
    onUpdate();
  };

  const cancelOutgoing = async (requestId: number) => {
    if (!confirm('Cancel this outgoing invite?')) return;
    // Stub endpoint
    await fetch(`${API}/my/team/outgoing-requests/${requestId}/cancel`, { method: 'POST', headers: authJson });
    onUpdate();
  };

  if (!team) return null;
  const isLocked = team.rosterLocked || false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Join Requests</h3>
      </div>

      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setSubTab('incoming')}
          className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all ${
            subTab === 'incoming' ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Incoming Inquiries
          {pendingJoins.length > 0 && (
            <span className={`ml-2 px-1.5 py-0.5 text-[9px] rounded-full ${subTab === 'incoming' ? 'bg-black text-yellow-500' : 'bg-zinc-700 text-white'}`}>
              {pendingJoins.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setSubTab('outgoing')}
          className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all ${
            subTab === 'outgoing' ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Outgoing Interested
        </button>
      </div>

      {isLocked && subTab === 'incoming' && (
        <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-3 rounded-xl">
          <p className="text-sm text-orange-400">Your roster is locked. You can review requests, but you cannot finalize adding players to your active roster.</p>
        </div>
      )}

      {subTab === 'incoming' && (
        <div className="space-y-3">
          {pendingJoins.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
              <UserPlus className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No incoming join requests right now.</p>
            </div>
          ) : (
            pendingJoins.map((req: any) => (
              <div key={req.id} className="bg-zinc-800/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{req.userName}</p>
                    <span className="text-[10px] font-mono text-zinc-500">{req.userEmail}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1 text-blue-400">
                    Via Invite Code
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRequest(req.id, 'reject')}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-800 text-zinc-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRequest(req.id, 'approve')}
                    disabled={isLocked}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-800 text-zinc-400 rounded-xl hover:bg-green-500/10 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={isLocked ? "Unlock roster to approve" : "Approve and add to roster"}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'outgoing' && (
        <div className="space-y-3">
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
              <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No outgoing interest sent to free agents yet.</p>
              <button className="mt-4 px-4 py-2 bg-zinc-800 text-white text-xs font-bold uppercase rounded-lg border border-zinc-700 hover:bg-zinc-700 flex items-center gap-2 mx-auto">
                Find Free Agents <ArrowRight className="w-3 h-3" />
              </button>
            </div>
        </div>
      )}
    </div>
  );
}
