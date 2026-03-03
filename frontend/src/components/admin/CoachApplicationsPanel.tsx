import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Check, X, Clock, User, Mail, Phone, MapPin, Trophy } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

export default function CoachApplicationsPanel() {
  const token = localStorage.getItem('dtached_token');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetch(`${API}/admin/coach-applications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setApplications(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const approve = async (id: number) => {
    const res = await fetch(`${API}/admin/coach-applications/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: 'COACH' }),
    });
    if (res.ok) {
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a));
    }
  };

  const reject = async (id: number) => {
    const notes = prompt('Rejection reason (optional):') || '';
    const res = await fetch(`${API}/admin/coach-applications/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) {
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'REJECTED', adminNotes: notes } : a));
    }
  };

  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Coach Applications</h3>
        <div className="flex gap-1">
          {['ALL', 'APPLIED', 'APPROVED', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full transition-all ${
                filter === f ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No applications{filter !== 'ALL' ? ` with status "${filter}"` : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app: any) => (
            <div key={app.id} className="bg-zinc-800/50 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{app.fullName}</p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.email}</span>
                    {app.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.phone}</span>}
                    {app.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.city}</span>}
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full ${
                  app.status === 'APPROVED' ? 'bg-green-500/10 text-green-400'
                  : app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400'
                  : 'bg-yellow-500/10 text-yellow-500'
                }`}>{app.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {app.teamName && (
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Trophy className="w-3 h-3 text-zinc-600" />
                    <span>Team: <strong className="text-white">{app.teamName}</strong></span>
                  </div>
                )}
                {app.leagueOrOrg && (
                  <div className="text-zinc-400">League: <strong className="text-white">{app.leagueOrOrg}</strong></div>
                )}
                {app.socialOrWebsite && (
                  <div className="text-zinc-400 col-span-2">Social: <strong className="text-white">{app.socialOrWebsite}</strong></div>
                )}
              </div>

              {app.notes && (
                <p className="text-xs text-zinc-400 bg-zinc-900 p-3 rounded-lg">{app.notes}</p>
              )}

              {app.status === 'APPLIED' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => approve(app.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded-full hover:bg-green-500/20 transition-all border border-green-500/20"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => reject(app.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded-full hover:bg-red-500/20 transition-all border border-red-500/20"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}

              {app.adminNotes && (
                <p className="text-[10px] text-zinc-600">Admin notes: {app.adminNotes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
