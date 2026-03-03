import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Check, X, Mail, Phone, MapPin, Trophy, Shield, Plus, Copy } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

export default function TeamOnboardingPanel() {
  const token = localStorage.getItem('dtached_token');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('APPLIED');
  
  // Provisioning form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [provisionResult, setProvisionResult] = useState<any>(null);
  
  const [form, setForm] = useState({
    teamName: '', type: '7v7', division: 'Elite', city: '', provinceState: '', bio: '',
    coachFirstName: '', coachLastName: '', coachEmail: '', coachPhone: '',
    managerCount: 0,
    managers: [] as { firstName: string, lastName: string, email: string }[]
  });

  useEffect(() => {
    loadRequests();
  }, [token]);

  const loadRequests = () => {
    setLoading(true);
    fetch(`${API}/admin/onboarding-requests`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setRequests(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleManagerCountChange = (count: number) => {
    const managers = [...form.managers];
    while (managers.length < count) managers.push({ firstName: '', lastName: '', email: '' });
    if (managers.length > count) managers.length = count;
    setForm({ ...form, managerCount: count, managers });
  };

  const submitProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/teams/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const result = await res.json();
        setProvisionResult(result);
        setShowForm(false);
        setForm({
          teamName: '', type: '7v7', division: 'Elite', city: '', provinceState: '', bio: '',
          coachFirstName: '', coachLastName: '', coachEmail: '', coachPhone: '',
          managerCount: 0, managers: []
        });
        loadRequests();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'Failed to provision team'}`);
      }
    } catch (e) {
      alert('Network error');
    }
    setSubmitting(false);
  };

  const rejectRequest = async (id: number) => {
    const notes = prompt('Rejection reason (optional):') || '';
    const res = await fetch(`${API}/admin/onboarding-requests/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) loadRequests();
  };

  const prefillFromRequest = (req: any) => {
    let managers = [];
    try {
      if (req.managerDetails) managers = JSON.parse(req.managerDetails);
    } catch (e) {}
    
    // Ensure we don't exceed requested manager count up to max 5
    const count = Math.min(req.requestedManagerCount || 0, 5);
    while (managers.length < count) managers.push({ firstName: '', lastName: '', email: '' });
    if (managers.length > count) managers.length = count;

    setForm({
      teamName: req.teamName || '',
      type: req.type || '7v7',
      division: req.division || 'Elite',
      city: req.city || '',
      provinceState: req.provinceState || '',
      bio: '',
      coachFirstName: req.coachFirstName || '',
      coachLastName: req.coachLastName || '',
      coachEmail: req.coachEmail || '',
      coachPhone: req.coachPhone || '',
      managerCount: count,
      managers: managers
    });
    setShowForm(true);
  };

  const copyCredentials = () => {
    if (!provisionResult) return;
    let text = `Team: ${provisionResult.teamName}\nInvite Code: ${provisionResult.inviteCode}\n\n`;
    text += `COACH LOGIN\nEmail: ${provisionResult.coachEmail}\nTemporary Password: ${provisionResult.coachTempPassword}\n\n`;
    
    if (provisionResult.managerCredentials?.length > 0) {
      text += `TEAM MANAGER LOGINS\n`;
      provisionResult.managerCredentials.forEach((m: any, i: number) => {
        text += `Manager ${i+1}:\nEmail: ${m.email}\nTemporary Password: ${m.tempPassword}\n\n`;
      });
    }
    text += `Please log in using these temporary credentials. You will be required to set a permanent password immediately.`;
    navigator.clipboard.writeText(text);
    alert('Credentials copied to clipboard');
  };

  const filtered = filter === 'ALL' ? requests : requests.filter(a => a.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Team Onboarding</h3>
        <div className="flex gap-4 items-center">
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-full p-1">
            {['ALL', 'APPLIED', 'APPROVED', 'REJECTED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full transition-all ${
                  filter === f ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-black text-[10px] font-bold uppercase rounded-full hover:bg-yellow-400 transition-all"
          >
            {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showForm ? 'Cancel Provisioning' : 'Provision New Team'}
          </button>
        </div>
      </div>

      {/* PROVISIONING SUCCESS SCREEN */}
      {provisionResult && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-xl"><Check className="w-6 h-6 text-green-400"/></div>
              <div>
                <h4 className="text-xl font-black text-green-400 uppercase italic">Team Provisioned Successfully</h4>
                <p className="text-sm text-green-400/80">Team <strong className="text-white">{provisionResult.teamName}</strong> is now live.</p>
              </div>
            </div>
            <button onClick={() => setProvisionResult(null)} className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-white">Dismiss</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded-xl space-y-2 border border-green-500/10">
              <p className="text-[10px] uppercase font-bold text-zinc-500">Coach Credentials</p>
              <div className="space-y-1 font-mono text-sm">
                <p className="text-zinc-300">Email: <span className="text-white">{provisionResult.coachEmail}</span></p>
                <p className="text-zinc-300">Temp PW: <span className="text-yellow-500">{provisionResult.coachTempPassword}</span></p>
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl space-y-2 border border-green-500/10">
              <p className="text-[10px] uppercase font-bold text-zinc-500">Team Details</p>
              <div className="space-y-1 font-mono text-sm">
                <p className="text-zinc-300">Invite Code: <span className="text-yellow-500">{provisionResult.inviteCode}</span></p>
              </div>
            </div>
            {provisionResult.managerCredentials?.map((m: any, i: number) => (
              <div key={i} className="bg-black/20 p-4 rounded-xl space-y-2 border border-green-500/10">
                <p className="text-[10px] uppercase font-bold text-zinc-500">Manager {i+1} Credentials</p>
                <div className="space-y-1 font-mono text-sm">
                  <p className="text-zinc-300">Email: <span className="text-white">{m.email}</span></p>
                  <p className="text-zinc-300">Temp PW: <span className="text-yellow-500">{m.tempPassword}</span></p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={copyCredentials} className="flex items-center gap-2 px-4 py-3 bg-yellow-500 text-black text-xs font-bold uppercase rounded-xl hover:bg-yellow-400 transition-all w-full justify-center">
            <Copy className="w-4 h-4" /> Copy All Credentials To Clipboard
          </button>
        </div>
      )}

      {/* PROVISIONING FORM */}
      {showForm && !provisionResult && (
        <form onSubmit={submitProvisioning} className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-6 space-y-6">
          
          {/* Team Info */}
          <div>
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Trophy className="w-3.5 h-3.5" /> Team Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Team Name" className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white" value={form.teamName} onChange={e => setForm({...form, teamName: e.target.value})} />
              <select className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="7v7">7v7</option>
                <option value="Flag">Flag</option>
                <option value="Tackle">Tackle</option>
              </select>
              <input placeholder="City" className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
              <input placeholder="Province/State" className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white" value={form.provinceState} onChange={e => setForm({...form, provinceState: e.target.value})} />
              <select className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white" value={form.division} onChange={e => setForm({...form, division: e.target.value})}>
                <option value="Elite">Elite</option>
                <option value="Competitive">Competitive</option>
                <option value="Recreational">Recreational</option>
              </select>
            </div>
          </div>

          {/* Coach Info */}
          <div className="border-t border-zinc-700/50 pt-6">
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Head Coach</h4>
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="First Name" className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white" value={form.coachFirstName} onChange={e => setForm({...form, coachFirstName: e.target.value})} />
              <input required placeholder="Last Name" className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white" value={form.coachLastName} onChange={e => setForm({...form, coachLastName: e.target.value})} />
              <input required type="email" placeholder="Email Address" className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white" value={form.coachEmail} onChange={e => setForm({...form, coachEmail: e.target.value})} />
              <input placeholder="Phone Number" className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white" value={form.coachPhone} onChange={e => setForm({...form, coachPhone: e.target.value})} />
            </div>
          </div>

          {/* Managers */}
          <div className="border-t border-zinc-700/50 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Team Managers</h4>
              <select 
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                value={form.managerCount}
                onChange={e => handleManagerCountChange(parseInt(e.target.value))}
              >
                <option value={0}>0 Managers</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Manager{n>1?'s':''}</option>)}
              </select>
            </div>
            
            <div className="space-y-3">
              {form.managers.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <span className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-500 font-black flex items-center border-dashed">
                    M{i+1}
                  </span>
                  <input required placeholder="First" className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white" value={m.firstName} onChange={e => { const nm = [...form.managers]; nm[i].firstName = e.target.value; setForm({...form, managers: nm}) }} />
                  <input required placeholder="Last" className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white" value={m.lastName} onChange={e => { const nm = [...form.managers]; nm[i].lastName = e.target.value; setForm({...form, managers: nm}) }} />
                  <input required type="email" placeholder="Email" className="flex-[1.5] bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white" value={m.email} onChange={e => { const nm = [...form.managers]; nm[i].email = e.target.value; setForm({...form, managers: nm}) }} />
                </div>
              ))}
            </div>
          </div>

          <button disabled={submitting} type="submit" className="w-full mt-4 bg-yellow-500 text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50">
            {submitting ? 'Provisioning...' : 'Provision Team & Generate Credentials'}
          </button>
        </form>
      )}

      {/* REQUESTS LIST */}
      {!showForm && filtered.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No onboarding requests{filter !== 'ALL' ? ` with status "${filter}"` : ''}.</p>
        </div>
      ) : !showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((req: any) => (
            <div key={req.id} className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">{req.teamName}</h4>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="text-yellow-500">{req.type}</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-400">{req.division}</span>
                      {req.city && (
                        <>
                          <span className="text-zinc-500">•</span>
                          <span className="text-zinc-400">{req.city}{req.provinceState ? `, ${req.provinceState}` : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${
                    req.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : req.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}>{req.status}</span>
                </div>

                <div className="space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                  <p className="text-[10px] text-zinc-500 uppercase font-black flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Staff Requested</p>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <p className="text-zinc-400"><span className="text-zinc-600 block text-[9px] uppercase">Head Coach</span> {req.coachFirstName} {req.coachLastName}</p>
                    <p className="text-zinc-400"><span className="text-zinc-600 block text-[9px] uppercase">Contact</span> {req.coachEmail}</p>
                    {req.requestedManagerCount > 0 && (
                      <p className="text-zinc-400 col-span-2 mt-2 pt-2 border-t border-zinc-800"><span className="text-zinc-600 block text-[9px] uppercase">Managers Requested</span> {req.requestedManagerCount} / 5 slots</p>
                    )}
                  </div>
                </div>

                {(req.notes || req.eventInterest) && (
                  <div className="mt-4 text-xs space-y-2">
                    {req.notes && <p className="text-zinc-400"><span className="text-zinc-600 font-bold">Notes:</span> {req.notes}</p>}
                    {req.eventInterest && <p className="text-zinc-400"><span className="text-zinc-600 font-bold">Events:</span> {req.eventInterest}</p>}
                  </div>
                )}
              </div>

              {req.status === 'APPLIED' && (
                <div className="flex gap-2 pt-6 mt-6 border-t border-zinc-800/50">
                  <button
                    onClick={() => prefillFromRequest(req)}
                    className="flex-1 flex justify-center items-center gap-1.5 px-4 py-2.5 bg-yellow-500 text-black text-xs font-black uppercase rounded-xl hover:bg-yellow-400 transition-all"
                  >
                    <Check className="w-4 h-4" /> Start Provisioning
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    className="flex justify-center items-center gap-1.5 px-4 py-2.5 bg-red-500/10 text-red-400 text-xs font-black uppercase rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
