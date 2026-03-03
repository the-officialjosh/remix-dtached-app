import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Plus, Trash2, Users, Trophy, Edit3, ChevronDown, ChevronUp, Check, X, Image, Copy, Tent, Award } from 'lucide-react';
import { cn } from '../../lib/utils';
import { API_URL as API } from '../../lib/api';

interface TournamentEvent {
  id: number; name: string; description?: string; location?: string; address?: string;
  city?: string; provinceState?: string; startDate: string; endDate: string;
  registrationDeadline?: string; format: string; status: string; maxTeams?: number;
  entryFee?: number; bannerUrl?: string; createdAt: string; eventType?: string;
  divisions?: any[]; fields?: any[]; packages?: any[]; registrations?: any[]; playerRegistrations?: any[]; registeredTeams?: number; registeredPlayers?: number;
}

// Pre-built event templates
const EVENT_TEMPLATES: Record<string, Partial<typeof EMPTY_FORM>> = {
  CAMP: {
    eventType: 'CAMP', format: '7v7', status: 'DRAFT',
    description: 'Intensive training camp focused on skill development, position coaching, and competitive drills.',
  },
  TOURNAMENT: {
    eventType: 'TOURNAMENT', format: '7v7', status: 'DRAFT',
    description: '7v7 Boys & Flag Girls — Competitive tournament with pool play into single-elimination brackets.',
  },
  SHOWCASE: {
    eventType: 'SHOWCASE', format: '7v7', status: 'DRAFT',
    description: 'Player showcase event for exposure to scouts and recruiters.',
  },
  COMBINE: {
    eventType: 'COMBINE', format: '7v7', status: 'DRAFT',
    description: 'Athletic testing and position drills for all prospects.',
  },
};

const EMPTY_FORM = { name: '', description: '', location: '', city: '', provinceState: '', startDate: '', endDate: '', registrationDeadline: '', format: '7v7', status: 'DRAFT', eventType: 'TOURNAMENT', maxTeams: '', entryFee: '', bannerUrl: '' };

export default function EventManagement() {
  const token = localStorage.getItem('dtached_token');
  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [divForm, setDivForm] = useState({ name: '', ageGroup: '', maxTeams: '', format: '' });
  const [fieldForm, setFieldForm] = useState({ name: '', location: '', capacity: '', surfaceType: 'GRASS' });
  const [pkgForm, setPkgForm] = useState({ name: '', price: '', description: '' });
  const [saving, setSaving] = useState(false);
  const bannerRef = useRef<HTMLInputElement>(null);
  const editBannerRef = useRef<HTMLInputElement>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/events`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setEvents(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const fetchEventDetail = async (id: number) => {
    try {
      const res = await fetch(`${API}/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const detail = await res.json();
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...detail } : e));
      }
    } catch {}
  };

  const toggleExpand = (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    fetchEventDetail(id);
  };

  const applyTemplate = (templateKey: string) => {
    const template = EVENT_TEMPLATES[templateKey];
    if (template) setForm(prev => ({ ...prev, ...template }));
  };

  const handleBannerUpload = (file: File | undefined, isEdit?: boolean, eventId?: number) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      if (isEdit && eventId) {
        // Update existing event banner
        await fetch(`${API}/events/${eventId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ bannerUrl: dataUrl })
        });
        fetchEventDetail(eventId);
        fetchEvents();
      } else {
        setForm(prev => ({ ...prev, bannerUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/events`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          maxTeams: form.maxTeams ? parseInt(form.maxTeams) : null,
          entryFee: form.entryFee ? parseFloat(form.entryFee) : null,
        })
      });
      if (res.ok) { setShowCreate(false); setForm({ ...EMPTY_FORM }); fetchEvents(); }
    } catch {}
    setSaving(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${API}/events/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchEvents();
  };

  const deleteEvent = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    await fetch(`${API}/events/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setExpandedId(null);
    fetchEvents();
  };

  const addDivision = async (eventId: number) => {
    await fetch(`${API}/events/${eventId}/divisions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...divForm, maxTeams: divForm.maxTeams ? parseInt(divForm.maxTeams) : null })
    });
    setDivForm({ name: '', ageGroup: '', maxTeams: '', format: '' });
    fetchEventDetail(eventId);
  };

  const deleteDivision = async (divisionId: number, eventId: number) => {
    await fetch(`${API}/events/divisions/${divisionId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchEventDetail(eventId);
  };

  const addField = async (eventId: number) => {
    await fetch(`${API}/events/${eventId}/fields`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...fieldForm, capacity: fieldForm.capacity ? parseInt(fieldForm.capacity) : null })
    });
    setFieldForm({ name: '', location: '', capacity: '', surfaceType: 'GRASS' });
    fetchEventDetail(eventId);
  };

  const deleteField = async (fieldId: number, eventId: number) => {
    await fetch(`${API}/events/fields/${fieldId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchEventDetail(eventId);
  };

  const updateRegStatus = async (regId: number, status: string, eventId: number) => {
    await fetch(`${API}/events/registrations/${regId}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchEventDetail(eventId);
  };

  const updatePlayerRegStatus = async (regId: number, status: string, eventId: number) => {
    await fetch(`${API}/events/player-registrations/${regId}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchEventDetail(eventId);
  };

  const addPackage = async (eventId: number) => {
    await fetch(`${API}/events/${eventId}/packages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...pkgForm, price: pkgForm.price ? parseFloat(pkgForm.price) : 0 })
    });
    setPkgForm({ name: '', price: '', description: '' });
    fetchEventDetail(eventId);
  };

  const deletePackage = async (pkgId: number, eventId: number) => {
    await fetch(`${API}/events/packages/${pkgId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchEventDetail(eventId);
  };

  const duplicateEvent = async (event: TournamentEvent) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/events`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: `${event.name} (Copy)`,
          description: event.description, location: event.location,
          city: event.city, provinceState: event.provinceState,
          startDate: event.startDate, endDate: event.endDate,
          registrationDeadline: event.registrationDeadline,
          format: event.format, status: 'DRAFT',
          eventType: event.eventType, maxTeams: event.maxTeams,
          entryFee: event.entryFee, bannerUrl: event.bannerUrl,
        })
      });
      if (res.ok) {
        const newEvent = await res.json();
        // Clone divisions
        if (event.divisions) {
          for (const d of event.divisions) {
            await fetch(`${API}/events/${newEvent.id}/divisions`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ name: d.name, ageGroup: d.ageGroup, maxTeams: d.maxTeams })
            });
          }
        }
        // Clone packages
        if (event.packages) {
          for (const p of event.packages) {
            await fetch(`${API}/events/${newEvent.id}/packages`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ name: p.name, price: p.price, description: p.description, includes: p.includes })
            });
          }
        }
        fetchEvents();
      }
    } catch {}
    setSaving(false);
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-zinc-700 text-zinc-300',
    PUBLISHED: 'bg-green-500/20 text-green-400 border border-green-500/30',
    REGISTRATION_CLOSED: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    COMPLETED: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };

  const typeIcons: Record<string, any> = { CAMP: Tent, TOURNAMENT: Trophy, SHOWCASE: Award, COMBINE: Users };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Events & Tournaments</h3>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-yellow-400 transition-all">
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Create Event</h4>
            {/* Template buttons */}
            <div className="flex gap-2">
              <span className="text-[10px] text-zinc-500 uppercase font-bold self-center mr-1">Templates:</span>
              {Object.keys(EVENT_TEMPLATES).map(key => (
                <button key={key} onClick={() => applyTemplate(key)}
                  className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    form.eventType === key ? "bg-yellow-500 text-black" : "bg-zinc-800 text-zinc-500 hover:text-white")}>
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Banner Upload */}
          <div>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => handleBannerUpload(e.target.files?.[0])} />
            {form.bannerUrl ? (
              <div className="relative h-32 rounded-xl overflow-hidden group">
                <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                  <button onClick={() => bannerRef.current?.click()} className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg">Change</button>
                  <button onClick={() => setForm({ ...form, bannerUrl: '' })} className="px-3 py-1.5 bg-red-500/20 backdrop-blur-md text-red-400 text-xs font-bold rounded-lg">Remove</button>
                </div>
              </div>
            ) : (
              <button onClick={() => bannerRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-zinc-500 hover:border-yellow-500/30 hover:text-yellow-500 transition-all">
                <Image className="w-5 h-5" /> Upload Event Banner
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Event Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none" />
            <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none" />
            <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none" />
            <input placeholder="Province/State" value={form.provinceState} onChange={e => setForm({ ...form, provinceState: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none" />
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Start Date *</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">End Date *</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Registration Deadline</label>
              <input type="date" value={form.registrationDeadline} onChange={e => setForm({ ...form, registrationDeadline: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none" />
            </div>
            <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none">
              <option value="TOURNAMENT">Tournament</option>
              <option value="CAMP">Camp</option>
              <option value="SHOWCASE">Showcase</option>
              <option value="COMBINE">Combine</option>
            </select>
            <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none">
              <option value="7v7">7v7</option>
              <option value="5v5">5v5</option>
              <option value="11v11">11v11</option>
            </select>
            <input type="number" placeholder="Max Teams (optional)" value={form.maxTeams} onChange={e => setForm({ ...form, maxTeams: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none" />
            <input type="number" step="0.01" placeholder="Entry Fee ($)" value={form.entryFee} onChange={e => setForm({ ...form, entryFee: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none" />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none resize-none" />
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saving || !form.name || !form.startDate || !form.endDate} className="px-5 py-2 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-40">
              {saving ? 'Creating...' : 'Create Event'}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 bg-zinc-800 text-zinc-400 font-bold uppercase text-xs tracking-widest rounded-xl hover:text-white transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Event List */}
      {events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">No events yet. Create your first tournament!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const Icon = typeIcons[event.eventType || 'TOURNAMENT'] || Trophy;
            return (
            <div key={event.id} className="bg-zinc-800/30 border border-zinc-700/50 rounded-2xl overflow-hidden">
              {/* Event Header */}
              <button onClick={() => toggleExpand(event.id)} className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/50 transition-all">
                <div className="flex items-center gap-4">
                  {event.bannerUrl ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-700">
                      <img src={event.bannerUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-yellow-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-white font-black text-lg">{event.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.startDate} → {event.endDate}</span>
                      {event.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.city}</span>}
                      <span className="text-zinc-600">{event.format}</span>
                      {event.eventType && <span className="text-zinc-600">· {event.eventType}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', statusColors[event.status] || 'bg-zinc-700 text-zinc-300')}>{event.status.replace(/_/g, ' ')}</span>
                  {expandedId === event.id ? <ChevronUp className="w-5 h-5 text-zinc-500"/> : <ChevronDown className="w-5 h-5 text-zinc-500"/>}
                </div>
              </button>

              {/* Expanded Detail */}
              {expandedId === event.id && (
                <div className="border-t border-zinc-700/50 p-5 space-y-6">
                  {/* Banner preview/upload */}
                  <div>
                    <input ref={editBannerRef} type="file" accept="image/*" className="hidden" onChange={e => handleBannerUpload(e.target.files?.[0], true, event.id)} />
                    {event.bannerUrl ? (
                      <div className="relative h-40 rounded-xl overflow-hidden group">
                        <img src={event.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <button onClick={() => editBannerRef.current?.click()} className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg">Change Banner</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => editBannerRef.current?.click()}
                        className="w-full h-20 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-zinc-500 hover:border-yellow-500/30 hover:text-yellow-500 transition-all text-xs">
                        <Image className="w-4 h-4" /> Add Event Banner
                      </button>
                    )}
                  </div>

                  {/* Status Actions + Duplicate */}
                  <div className="flex flex-wrap gap-2">
                    {['DRAFT', 'PUBLISHED', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
                      <button key={s} onClick={() => updateStatus(event.id, s)} disabled={event.status === s}
                        className={cn('px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all', event.status === s ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500 hover:text-white')}
                      >{s.replace(/_/g, ' ')}</button>
                    ))}
                    <button onClick={() => duplicateEvent(event)} disabled={saving}
                      className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all flex items-center gap-1">
                      <Copy className="w-3 h-3" /> Duplicate
                    </button>
                    <button onClick={() => deleteEvent(event.id)} className="ml-auto px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div className="bg-zinc-900 rounded-xl p-3"><p className="text-[9px] text-zinc-500 uppercase font-bold">Type</p><p className="text-white font-black text-lg">{event.eventType || 'EVENT'}</p></div>
                    <div className="bg-zinc-900 rounded-xl p-3"><p className="text-[9px] text-zinc-500 uppercase font-bold">Teams</p><p className="text-white font-black text-lg">{event.registeredTeams ?? 0}{event.maxTeams ? `/${event.maxTeams}` : ''}</p></div>
                    <div className="bg-zinc-900 rounded-xl p-3"><p className="text-[9px] text-zinc-500 uppercase font-bold">Players</p><p className="text-white font-black text-lg">{event.registeredPlayers ?? 0}</p></div>
                    <div className="bg-zinc-900 rounded-xl p-3"><p className="text-[9px] text-zinc-500 uppercase font-bold">Packages</p><p className="text-white font-black text-lg">{event.packages?.length ?? 0}</p></div>
                    <div className="bg-zinc-900 rounded-xl p-3"><p className="text-[9px] text-zinc-500 uppercase font-bold">Divisions</p><p className="text-white font-black text-lg">{event.divisions?.length ?? 0}</p></div>
                  </div>

                  {/* Divisions */}
                  <div>
                    <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Divisions</h5>
                    <div className="space-y-2">
                      {event.divisions?.map((d: any) => (
                        <div key={d.id} className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-2">
                          <span className="text-white text-sm font-bold">{d.name} {d.ageGroup && <span className="text-zinc-500 font-normal">({d.ageGroup})</span>}</span>
                          <button onClick={() => deleteDivision(d.id, event.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <input placeholder="Division Name" value={divForm.name} onChange={e => setDivForm({...divForm, name: e.target.value})} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-yellow-500" />
                      <input placeholder="Age Group" value={divForm.ageGroup} onChange={e => setDivForm({...divForm, ageGroup: e.target.value})} className="w-28 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-yellow-500" />
                      <button onClick={() => addDivision(event.id)} disabled={!divForm.name} className="px-3 py-1.5 bg-yellow-500 text-black font-bold text-xs rounded-lg hover:bg-yellow-400 disabled:opacity-40"><Plus className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>

                  {/* Fields */}
                  <div>
                    <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Fields</h5>
                    <div className="space-y-2">
                      {event.fields?.map((f: any) => (
                        <div key={f.id} className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-2">
                          <span className="text-white text-sm font-bold">{f.name} <span className="text-zinc-500 font-normal">{f.surfaceType} · Cap: {f.capacity ?? '—'}</span></span>
                          <button onClick={() => deleteField(f.id, event.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <input placeholder="Field Name" value={fieldForm.name} onChange={e => setFieldForm({...fieldForm, name: e.target.value})} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-yellow-500" />
                      <input type="number" placeholder="Capacity" value={fieldForm.capacity} onChange={e => setFieldForm({...fieldForm, capacity: e.target.value})} className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-yellow-500" />
                      <button onClick={() => addField(event.id)} disabled={!fieldForm.name} className="px-3 py-1.5 bg-yellow-500 text-black font-bold text-xs rounded-lg hover:bg-yellow-400 disabled:opacity-40"><Plus className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>

                  {/* Packages */}
                  <div>
                    <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Packages</h5>
                    <div className="space-y-2">
                      {event.packages?.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-2">
                          <span className="text-white text-sm font-bold">${p.price} — {p.name} <span className="text-zinc-500 font-normal">{p.description}</span></span>
                          <button onClick={() => deletePackage(p.id, event.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <input placeholder="Package Name" value={pkgForm.name} onChange={e => setPkgForm({...pkgForm, name: e.target.value})} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-yellow-500" />
                      <input type="number" step="0.01" placeholder="Price" value={pkgForm.price} onChange={e => setPkgForm({...pkgForm, price: e.target.value})} className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-yellow-500" />
                      <input placeholder="Description" value={pkgForm.description} onChange={e => setPkgForm({...pkgForm, description: e.target.value})} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-yellow-500" />
                      <button onClick={() => addPackage(event.id)} disabled={!pkgForm.name || !pkgForm.price} className="px-3 py-1.5 bg-yellow-500 text-black font-bold text-xs rounded-lg hover:bg-yellow-400 disabled:opacity-40"><Plus className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>

                  {/* Team Registrations */}
                  <div>
                    <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Team Registrations</h5>
                    {(!event.registrations || event.registrations.length === 0) ? (
                      <p className="text-zinc-600 text-xs">No teams registered yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {event.registrations.map((r: any) => (
                          <div key={r.id} className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3">
                            <div>
                              <span className="text-white font-bold text-sm">{r.teamName}</span>
                              {r.divisionName && <span className="text-zinc-500 text-xs ml-2">({r.divisionName})</span>}
                              <span className={cn('ml-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase', r.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : r.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400')}>{r.status}</span>
                            </div>
                            {r.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <button onClick={() => updateRegStatus(r.id, 'APPROVED', event.id)} className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"><Check className="w-3.5 h-3.5"/></button>
                                <button onClick={() => updateRegStatus(r.id, 'REJECTED', event.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><X className="w-3.5 h-3.5"/></button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Player Registrations */}
                  <div>
                    <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Player Registrations</h5>
                    {(!event.playerRegistrations || event.playerRegistrations.length === 0) ? (
                      <p className="text-zinc-600 text-xs">No players registered yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {event.playerRegistrations.map((r: any) => (
                          <div key={r.id} className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3">
                            <div>
                              <span className="text-white font-bold text-sm">{r.userName}</span>
                              {r.packageName && <span className="text-zinc-500 text-xs ml-2">({r.packageName})</span>}
                              {r.divisionName && <span className="text-zinc-500 text-xs ml-2">· {r.divisionName}</span>}
                              <span className={cn('ml-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase', r.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : r.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400')}>{r.status}</span>
                            </div>
                            {r.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <button onClick={() => updatePlayerRegStatus(r.id, 'APPROVED', event.id)} className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"><Check className="w-3.5 h-3.5"/></button>
                                <button onClick={() => updatePlayerRegStatus(r.id, 'REJECTED', event.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><X className="w-3.5 h-3.5"/></button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
