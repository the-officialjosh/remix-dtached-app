import React, { useState } from 'react';
import { CreditCard, Receipt, Download, AlertCircle } from 'lucide-react';

export default function PaymentsTab({ team }: { team: any }) {
  const [subTab, setSubTab] = useState<'cards' | 'events' | 'history'>('cards');

  if (!team) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Team Payments</h3>
      </div>

      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setSubTab('cards')}
          className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all ${
            subTab === 'cards' ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Player Cards
        </button>
        <button
          onClick={() => setSubTab('events')}
          className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all ${
            subTab === 'events' ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Event Registrations
        </button>
        <button
          onClick={() => setSubTab('history')}
          className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition-all ${
            subTab === 'history' ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Billing History
        </button>
      </div>

      {subTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-xl border border-zinc-800">
            <div>
               <p className="text-white font-bold text-sm">Bulk Pay for Unverified Players</p>
               <p className="text-zinc-400 text-xs mt-0.5">Pay for multiple player cards at once from the team balance.</p>
            </div>
            <button className="px-4 py-2 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-yellow-400">
               Pay for All (Stub)
            </button>
          </div>
          <div className="bg-zinc-800/20 rounded-xl overflow-hidden border border-zinc-800">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-800/80 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-widest">
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Card Status</th>
                  <th className="px-4 py-3 text-right">Payment</th>
                </tr>
              </thead>
              <tbody>
                {(team.roster || []).map((p: any) => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-sm font-bold text-white">{p.name || `${p.firstName} ${p.lastName}`}</td>
                    <td className="px-4 py-3">
                      {p.is_verified ? (
                         <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded">Active</span>
                      ) : (
                         <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">Unpaid</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                       {!p.is_verified && (
                         <button className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold hover:text-white transition-colors">Pay Now</button>
                       )}
                       {p.is_verified && <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Team Paid</span>}
                    </td>
                  </tr>
                ))}
                {(team.roster || []).length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-zinc-500">No players on roster</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'events' && (
        <div className="space-y-4 text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
          <CreditCard className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No active event payments.</p>
        </div>
      )}

      {subTab === 'history' && (
        <div className="space-y-4">
           <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-800 px-4 py-3 rounded-xl mb-4 text-zinc-400 text-xs">
              <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0" />
              <p>Player card payments and team registration fees are strictly non-refundable according to the rulebook.</p>
           </div>
           
           <div className="bg-zinc-800/20 rounded-xl overflow-hidden border border-zinc-800">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-zinc-800/80 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-widest">
                   <th className="px-4 py-3">Date</th>
                   <th className="px-4 py-3">Description</th>
                   <th className="px-4 py-3">Amount</th>
                   <th className="px-4 py-3 text-right">Receipt</th>
                 </tr>
               </thead>
               <tbody>
                  <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-sm text-zinc-400">Apr 1, 2026</td>
                    <td className="px-4 py-3 text-sm font-bold text-white">Event: Spring Flag Classic</td>
                    <td className="px-4 py-3 text-sm text-zinc-300">$45.00</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-zinc-500 hover:text-white transition-colors"><Download className="w-4 h-4 ml-auto" /></button>
                    </td>
                  </tr>
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
}
