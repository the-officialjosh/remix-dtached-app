import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Users, Filter, Calendar } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

export default function RevenuePanel() {
  const [summary, setSummary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('dtached_token');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/payments/admin/revenue`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null),
      fetch(`${API}/payments/admin/all`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : []),
    ]).then(([rev, pays]) => {
      setSummary(rev);
      setPayments(pays);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const filtered = typeFilter
    ? payments.filter(p => p.paymentType === typeFilter || p.payment_type === typeFilter)
    : payments;

  const formatCurrency = (cents: number) =>
    `$${(cents / 100).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Revenue Stats Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-5">
            <DollarSign className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-black text-white">{formatCurrency(summary.totalRevenueCents || 0)}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Total Revenue</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5">
            <CreditCard className="w-5 h-5 text-yellow-500 mb-2" />
            <p className="text-2xl font-black text-white">{summary.totalPayments || 0}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Completed</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
            <TrendingUp className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-black text-white">{summary.playerCardCount || 0}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Player Cards</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
            <Users className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-2xl font-black text-white">{summary.teamEntryCount || 0}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Team Entries</p>
          </div>
        </div>
      )}

      {/* Payment List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white italic uppercase tracking-tighter">Payment History</h3>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">All Types</option>
              <option value="PLAYER_CARD">Player Card</option>
              <option value="TEAM_ENTRY">Team Entry</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">ID</th>
                  <th className="text-left py-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Type</th>
                  <th className="text-left py-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Amount</th>
                  <th className="text-left py-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Status</th>
                  <th className="text-left py-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Description</th>
                  <th className="text-left py-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 text-xs text-zinc-400 font-mono">#{p.id}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        (p.paymentType || p.payment_type) === 'PLAYER_CARD'
                          ? 'text-blue-400 bg-blue-500/10'
                          : 'text-purple-400 bg-purple-500/10'
                      }`}>
                        {(p.paymentType || p.payment_type || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-white">
                      {formatCurrency(p.amountCents || p.amount_cents || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold uppercase ${
                        p.status === 'COMPLETED' ? 'text-green-400' :
                        p.status === 'PENDING' ? 'text-yellow-500' : 'text-red-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-zinc-400 max-w-[200px] truncate">
                      {p.description}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-zinc-500">
                      {p.createdAt || p.created_at
                        ? new Date(p.createdAt || p.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
            <DollarSign className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">No payments recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
