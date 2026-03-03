import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Users, Trophy, Clock, DollarSign, ChevronRight, ChevronLeft, Tent, Award, Camera, Shield, Check, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { API_URL as API } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

interface Event {
  id: number; name: string; description?: string; location?: string;
  city?: string; provinceState?: string; startDate: string; endDate: string;
  registrationDeadline?: string; format: string; status: string; maxTeams?: number;
  entryFee?: number; bannerUrl?: string; registeredTeams?: number; eventType?: string;
  requiredFields?: string; divisions?: any[]; packages?: any[];
}

export default function EventsPage() {
  const { isAuthenticated, user } = useAuth();
  const token = localStorage.getItem('dtached_token');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [regStep, setRegStep] = useState(0); // 0=browse, 1=info, 2=photos, 3=team, 4=package, 5=submitting, 6=done
  const [submitting, setSubmitting] = useState(false);
  const [regMessage, setRegMessage] = useState('');
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const playerPhotoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '', gender: '', position: '', height: '', weight: '',
    city: '', provinceState: '', jerseySize: '', shortsSize: '',
    hasTeam: false, teamName: '', category: '', videoUrl: '',
    photo: '', playerPhoto: '', divisionId: '', packageId: ''
  });

  useEffect(() => {
    fetch(`${API}/events/published`)
      .then(r => r.ok ? r.json() : [])
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Autofill from profile when starting registration
  useEffect(() => {
    if (!isAuthenticated || !token || regStep !== 1) return;
    fetch(`${API}/my/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setForm(prev => ({
          ...prev,
          firstName: prev.firstName || data.firstName || '',
          lastName: prev.lastName || data.lastName || '',
          position: prev.position || data.position || '',
          height: prev.height || data.height || '',
          weight: prev.weight || data.weight || '',
          city: prev.city || data.city || '',
          provinceState: prev.provinceState || data.province || '',
          dob: prev.dob || data.dob || '',
          gender: prev.gender || data.gender || '',
        }));
      })
      .catch(() => {});
  }, [isAuthenticated, token, regStep]);

  const selectEvent = async (event: Event) => {
    // Fetch full event detail with divisions + packages
    try {
      const res = await fetch(`${API}/events/${event.id}`);
      if (res.ok) {
        const detail = await res.json();
        setSelectedEvent({ ...event, ...detail });
      } else {
        setSelectedEvent(event);
      }
    } catch {
      setSelectedEvent(event);
    }
  };

  const startRegistration = () => {
    if (!isAuthenticated) return;
    setRegStep(1);
    setRegMessage('');
  };

  const handleSubmit = async () => {
    if (!selectedEvent || !token) return;
    setRegStep(5);
    setSubmitting(true);
    try {
      const body: any = {
        divisionId: form.divisionId ? parseInt(form.divisionId) : null,
        packageId: form.packageId ? parseInt(form.packageId) : null,
        hasTeam: form.hasTeam,
        teamName: form.teamName || null,
        category: form.category || null,
        videoUrl: form.videoUrl || null,
        jerseySize: form.jerseySize || null,
        shortsSize: form.shortsSize || null,
      };
      const res = await fetch(`${API}/events/${selectedEvent.id}/register/player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setTimeout(() => { setRegStep(6); setSubmitting(false); }, 2000);
      } else {
        setRegMessage(data.message || 'Registration failed');
        setRegStep(4);
        setSubmitting(false);
      }
    } catch {
      setRegMessage('Registration failed');
      setRegStep(4);
      setSubmitting(false);
    }
  };

  const closeRegistration = () => {
    setSelectedEvent(null);
    setRegStep(0);
    setRegMessage('');
    setForm({ firstName: '', lastName: '', dob: '', gender: '', position: '', height: '', weight: '', city: '', provinceState: '', jerseySize: '', shortsSize: '', hasTeam: false, teamName: '', category: '', videoUrl: '', photo: '', playerPhoto: '', divisionId: '', packageId: '' });
  };

  const getEventIcon = (name: string, eventType?: string) => {
    if (eventType === 'CAMP' || name.toLowerCase().includes('camp')) return Tent;
    if (eventType === 'TOURNAMENT' || name.toLowerCase().includes('tournament')) return Trophy;
    return Award;
  };

  const formatDate = (d: string) => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return d; }
  };

  const isCamp = selectedEvent?.eventType === 'CAMP';
  const isTournament = selectedEvent?.eventType === 'TOURNAMENT';

  if (loading) return <div className="flex justify-center py-24"><div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" /></div>;

  // ============== REGISTRATION WIZARD ==============
  if (selectedEvent && regStep > 0) {
    const totalSteps = isCamp ? 3 : 4; // camp: info→photos→package, tourney: info→photos→team→package
    const currentStep = regStep > totalSteps ? totalSteps : regStep;

    return (
      <div className="max-w-2xl mx-auto py-12">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all", i < currentStep ? "bg-yellow-500" : "bg-zinc-800")} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Player Info */}
          {regStep === 1 && (
            <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
                  {isCamp ? 'Camp Registration' : 'Tournament Registration'}
                </h2>
                <p className="text-zinc-500">{selectedEvent.name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="First Name *" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" />
                <input placeholder="Last Name *" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" />
                <input type="date" placeholder="Date of Birth" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", form.dob ? "text-white" : "text-zinc-500")} />
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", form.gender ? "text-white" : "text-zinc-500")}>
                  <option value="" disabled>Gender</option><option value="Boy">Boy</option><option value="Girl">Girl</option>
                </select>
                <select value={form.position} onChange={e => setForm({...form, position: e.target.value})} className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", form.position ? "text-white" : "text-zinc-500")}>
                  <option value="" disabled>Position</option><option value="QB">QB</option><option value="WR">WR</option><option value="RB">RB</option><option value="DB">DB</option><option value="LB">LB</option>
                </select>
                {isTournament && (
                  <>
                    <input placeholder="Height (e.g. 6'1'')" value={form.height} onChange={e => setForm({...form, height: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" />
                    <input placeholder="Weight (e.g. 185 lbs)" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" />
                  </>
                )}
                {isCamp && (
                  <>
                    <select value={form.jerseySize} onChange={e => setForm({...form, jerseySize: e.target.value})} className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", form.jerseySize ? "text-white" : "text-zinc-500")}>
                      <option value="" disabled>Jersey Size</option>
                      {['YS','YM','YL','S','M','L','XL','2XL','3XL'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={form.shortsSize} onChange={e => setForm({...form, shortsSize: e.target.value})} className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", form.shortsSize ? "text-white" : "text-zinc-500")}>
                      <option value="" disabled>Shorts Size</option>
                      {['YS','YM','YL','S','M','L','XL','2XL','3XL'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </>
                )}
                <input placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" />
                <input placeholder="Province/State" value={form.provinceState} onChange={e => setForm({...form, provinceState: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" />
              </div>
              {/* Division selector */}
              {selectedEvent.divisions && selectedEvent.divisions.length > 0 && (
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Division</label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedEvent.divisions.map((d: any) => (
                      <button key={d.id} onClick={() => setForm({...form, divisionId: String(d.id)})}
                        className={cn("p-4 rounded-2xl border-2 transition-all text-left", form.divisionId === String(d.id) ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700")}>
                        <p className="text-white font-bold">{d.name}</p>
                        {d.ageGroup && <p className="text-zinc-500 text-xs">{d.ageGroup}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <button onClick={closeRegistration} className="flex-1 py-4 text-zinc-500 font-bold uppercase">Cancel</button>
                <button onClick={() => setRegStep(2)} disabled={!form.firstName || !form.lastName}
                  className={cn("flex-[2] py-4 font-black uppercase tracking-widest rounded-2xl transition-all", form.firstName && form.lastName ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-zinc-800 text-zinc-600 cursor-not-allowed")}>Next Step</button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Photos */}
          {regStep === 2 && (
            <motion.div key="photos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Photos</h2>
                <p className="text-zinc-500">Upload your profile and action photos</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-white">Profile Photo <span className="text-zinc-500 font-normal">(1:1)</span></p>
                  <div onClick={() => profilePhotoRef.current?.click()}
                    className={cn("relative aspect-square rounded-full border-2 border-dashed cursor-pointer transition-all overflow-hidden flex items-center justify-center",
                      form.photo ? "border-yellow-500/30 bg-yellow-500/5" : "border-zinc-700 bg-zinc-900 hover:border-zinc-600")}>
                    <input ref={profilePhotoRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setForm({...form, photo: URL.createObjectURL(f)}); }} />
                    {form.photo ? <img src={form.photo} alt="Profile" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-zinc-600" />}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-white">Player Photo <span className="text-zinc-500 font-normal">(9:16)</span></p>
                  <div onClick={() => playerPhotoRef.current?.click()}
                    className={cn("relative aspect-[4/5] rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden flex items-center justify-center",
                      form.playerPhoto ? "border-yellow-500/30 bg-yellow-500/5" : "border-zinc-700 bg-zinc-900 hover:border-zinc-600")}>
                    <input ref={playerPhotoRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setForm({...form, playerPhoto: URL.createObjectURL(f)}); }} />
                    {form.playerPhoto ? <img src={form.playerPhoto} alt="Player" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-zinc-600" />}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setRegStep(1)} className="flex-1 py-4 text-zinc-500 font-bold uppercase">Back</button>
                <button onClick={() => setRegStep(isCamp ? 4 : 3)} className="flex-[2] py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all">Next Step</button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Team / Free Agent (Tournament only) */}
          {regStep === 3 && isTournament && (
            <motion.div key="team" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Team Info</h2>
                <p className="text-zinc-500">Are you registering with a team?</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setForm({...form, hasTeam: true})} className={cn("flex-1 p-6 rounded-3xl border-2 transition-all", form.hasTeam ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900")}>
                  <p className="text-xl font-bold text-white">Yes, I Have a Team</p>
                </button>
                <button onClick={() => setForm({...form, hasTeam: false})} className={cn("flex-1 p-6 rounded-3xl border-2 transition-all", !form.hasTeam ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900")}>
                  <p className="text-xl font-bold text-white">Free Agent</p>
                </button>
              </div>
              {form.hasTeam && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Team Name" value={form.teamName} onChange={e => setForm({...form, teamName: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white" />
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={cn("bg-zinc-900 border border-zinc-800 p-4 rounded-2xl", form.category ? "text-white" : "text-zinc-500")}>
                    <option value="" disabled>Category</option><option value="Elite">Elite</option><option value="16U">16U</option><option value="14U">14U</option>
                  </select>
                </div>
              )}
              {/* Video upload */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Highlight Video Link (Optional)</label>
                <input type="url" placeholder="https://youtube.com/watch?v=... or Hudl link" value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white placeholder:text-zinc-600" />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setRegStep(2)} className="flex-1 py-4 text-zinc-500 font-bold uppercase">Back</button>
                <button onClick={() => setRegStep(4)} className="flex-[2] py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all">Next Step</button>
              </div>
            </motion.div>
          )}

          {/* Step 4 (or 3 for camp): Package Selection */}
          {regStep === 4 && (
            <motion.div key="package" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Select Your Plan</h2>
                <p className="text-zinc-500">Choose a registration package</p>
              </div>
              {regMessage && (
                <div className="px-4 py-3 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20">{regMessage}</div>
              )}
              <div className={cn("grid gap-4", (selectedEvent.packages?.length ?? 0) > 2 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2")}>
                {selectedEvent.packages?.map((pkg: any, i: number) => {
                  let includes: string[] = [];
                  try { includes = JSON.parse(pkg.includes || '[]'); } catch {}
                  return (
                    <button key={pkg.id} onClick={() => setForm({...form, packageId: String(pkg.id)})}
                      className={cn("p-5 rounded-3xl border-2 transition-all text-left space-y-2 relative overflow-hidden",
                        form.packageId === String(pkg.id) ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700")}>
                      {pkg.isDefault && <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-black text-[8px] font-black uppercase tracking-widest rounded-full">Best Value</div>}
                      <p className="text-2xl font-black text-yellow-400">${pkg.price}</p>
                      <p className="text-sm font-bold text-white">{pkg.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-relaxed">{pkg.description || includes.join(' + ')}</p>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setRegStep(isCamp ? 2 : 3)} className="flex-1 py-4 text-zinc-500 font-bold uppercase">Back</button>
                <button onClick={handleSubmit} disabled={!form.packageId}
                  className={cn("flex-[2] py-4 font-black uppercase tracking-widest rounded-2xl transition-all", form.packageId ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-zinc-800 text-zinc-600 cursor-not-allowed")}>Submit Registration</button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Submitting */}
          {regStep === 5 && (
            <motion.div key="submitting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-12">
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 border-4 border-yellow-500 rounded-full animate-ping opacity-20" />
                <div className="absolute inset-0 border-4 border-yellow-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-16 h-16 text-yellow-500" /></div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Processing Registration</h2>
                <p className="text-zinc-500">Verifying your information...</p>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2 }} className="bg-yellow-500 h-full" />
              </div>
            </motion.div>
          )}

          {/* Step 6: Success */}
          {regStep === 6 && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-12">
              <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(234,179,8,0.4)]">
                <Check className="w-12 h-12 text-black" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Registration Complete!</h2>
                <p className="text-zinc-500">You're registered for {selectedEvent.name}. Your registration is pending admin approval.</p>
              </div>
              <button onClick={closeRegistration} className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all">Back to Events</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ============== EVENT DETAIL MODAL ==============
  if (selectedEvent && regStep === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-8">
        <button onClick={closeRegistration} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-all">
          <ChevronLeft className="w-4 h-4" /> Back to Events
        </button>

        {/* Event Header */}
        <div className="relative h-56 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-zinc-900 rounded-3xl flex items-center justify-center overflow-hidden">
          {selectedEvent.bannerUrl ? (
            <img src={selectedEvent.bannerUrl} alt={selectedEvent.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            (() => { const Icon = getEventIcon(selectedEvent.name, selectedEvent.eventType); return <Icon className="w-24 h-24 text-yellow-500/30" />; })()
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end justify-between">
              <div>
                <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block',
                  selectedEvent.eventType === 'CAMP' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                )}>{selectedEvent.eventType || 'EVENT'}</span>
                <h1 className="text-4xl font-black text-white uppercase tracking-tight">{selectedEvent.name}</h1>
              </div>
              {selectedEvent.entryFee && <p className="text-3xl font-black text-yellow-500">${selectedEvent.entryFee}</p>}
            </div>
          </div>
        </div>

        {selectedEvent.description && <p className="text-zinc-400 text-lg">{selectedEvent.description}</p>}

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 rounded-2xl p-4"><p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Dates</p><p className="text-white font-bold text-sm">{formatDate(selectedEvent.startDate)} — {formatDate(selectedEvent.endDate)}</p></div>
          {selectedEvent.city && <div className="bg-zinc-900 rounded-2xl p-4"><p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Location</p><p className="text-white font-bold text-sm">{selectedEvent.city}{selectedEvent.provinceState ? `, ${selectedEvent.provinceState}` : ''}</p></div>}
          <div className="bg-zinc-900 rounded-2xl p-4"><p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Format</p><p className="text-white font-bold text-sm">{selectedEvent.format}</p></div>
          <div className="bg-zinc-900 rounded-2xl p-4"><p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Teams</p><p className="text-white font-bold text-sm">{selectedEvent.registeredTeams ?? 0}{selectedEvent.maxTeams ? ` / ${selectedEvent.maxTeams}` : ''}</p></div>
          {selectedEvent.registrationDeadline && <div className="bg-zinc-900 rounded-2xl p-4"><p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Deadline</p><p className="text-white font-bold text-sm">{formatDate(selectedEvent.registrationDeadline)}</p></div>}
        </div>

        {/* Divisions */}
        {selectedEvent.divisions && selectedEvent.divisions.length > 0 && (
          <div>
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Divisions</h3>
            <div className="flex flex-wrap gap-3">
              {selectedEvent.divisions.map((d: any) => (
                <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                  <span className="text-white font-bold text-sm">{d.name}</span>
                  {d.ageGroup && <span className="text-zinc-500 text-xs ml-2">({d.ageGroup})</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Packages */}
        {selectedEvent.packages && selectedEvent.packages.length > 0 && (
          <div>
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Packages</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedEvent.packages.map((pkg: any) => (
                <div key={pkg.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
                  <p className="text-2xl font-black text-yellow-400">${pkg.price}</p>
                  <p className="text-white font-bold">{pkg.name}</p>
                  <p className="text-zinc-500 text-xs">{pkg.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="pt-4">
          {isAuthenticated ? (
            <button onClick={startRegistration} className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 transition-all text-lg">
              Register Now
            </button>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-zinc-500">Sign in to register for this event.</p>
              <div className="w-full py-4 bg-zinc-800 text-zinc-500 font-black uppercase tracking-widest rounded-2xl text-center">Sign In Required</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============== EVENT LISTING ==============
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
          Events & <span className="text-yellow-500">Tournaments</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Browse upcoming camps, tournaments, and showcases. Register your team or sign up as a player.</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
          <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">No Upcoming Events</h3>
          <p className="text-zinc-500 text-sm mt-2">Check back soon for new tournaments and camps.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => {
            const Icon = getEventIcon(event.name, event.eventType);
            const isPast = new Date(event.endDate) < new Date();
            return (
              <div key={event.id} onClick={() => selectEvent(event)}
                className={cn("group cursor-pointer bg-zinc-900/80 border rounded-3xl overflow-hidden hover:border-yellow-500/30 transition-all duration-300 hover:-translate-y-1",
                  isPast ? "border-zinc-800/50 opacity-60" : "border-zinc-800")}>
                <div className="relative h-40 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-zinc-900 flex items-center justify-center overflow-hidden">
                  {event.bannerUrl ? (
                    <>
                      <img src={event.bannerUrl} alt={event.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/30" />
                    </>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-10 h-10 text-yellow-500" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                      event.eventType === 'CAMP' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    )}>{event.eventType || 'EVENT'}</span>
                  </div>
                  {event.entryFee && event.entryFee > 0 && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-yellow-500 text-xs font-black flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />{event.entryFee}
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">{event.name}</h3>
                    {event.description && <p className="text-zinc-500 text-sm mt-1 line-clamp-2">{event.description}</p>}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-zinc-400"><Calendar className="w-4 h-4 text-yellow-500/60" /><span>{formatDate(event.startDate)} — {formatDate(event.endDate)}</span></div>
                    {event.city && <div className="flex items-center gap-2 text-zinc-400"><MapPin className="w-4 h-4 text-yellow-500/60" /><span>{event.city}{event.provinceState ? `, ${event.provinceState}` : ''}</span></div>}
                    <div className="flex items-center gap-2 text-zinc-400"><Users className="w-4 h-4 text-yellow-500/60" /><span>{event.format}</span></div>
                  </div>
                  {!isPast && (
                    <div className="w-full py-3 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl flex items-center justify-center gap-2">
                      View Details <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
