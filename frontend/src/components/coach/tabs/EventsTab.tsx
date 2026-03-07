import React, { useState, useEffect } from 'react';
import { CalendarCheck, ArrowRight, ShieldCheck, AlertTriangle, MapPin, DollarSign, Users, Check, ChevronLeft } from 'lucide-react';
import { API_URL as API } from '../../../lib/api';

const STEPS = ['Roster', 'Coverage', 'Slots', 'Assign', 'Pay', 'Confirm'];

export default function EventsTab({ team }: { team: any }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [regStep, setRegStep] = useState(0);

  // Coverage selections
  const [coveredPlayers, setCoveredPlayers] = useState<number[]>([]);
  const [slotCount, setSlotCount] = useState(0);
  const [assignedPlayers, setAssignedPlayers] = useState<number[]>([]);

  const token = localStorage.getItem('dtached_token');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/events/published`);
        if (res.ok) setEvents(await res.json());

        if (token) {
          const regRes = await fetch(`${API}/events/my-registrations`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (regRes.ok) setRegistrations(await regRes.json());
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [token]);

  if (!team) return null;

  const roster = team.roster || [];
  const unverified = roster.filter((p: any) => !p.is_verified && !p.isVerified);
  const verified = roster.filter((p: any) => p.is_verified || p.isVerified);

  const isRegistered = (eventId: number) =>
    registrations.some((r: any) => r.eventId === eventId || r.event_id === eventId);

  const openRegistration = (ev: any) => {
    setActiveEvent(ev);
    setRegStep(0);
    setCoveredPlayers([]);
    setSlotCount(roster.length);
    setAssignedPlayers([]);
  };

  const toggleCoveredPlayer = (id: number) => {
    setCoveredPlayers(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleAssignedPlayer = (id: number) => {
    setAssignedPlayers(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= slotCount) return prev;
      return [...prev, id];
    });
  };

  const cardCost = coveredPlayers.length * 10;
  const eventCost = slotCount * (activeEvent?.entryFee || 0);
  const grandTotal = cardCost + eventCost;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Team Events</h3>
      </div>

      {!activeEvent ? (
        events.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
            <CalendarCheck className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No events published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => {
              const registered = isRegistered(ev.id);
              return (
                <div key={ev.id} className="bg-zinc-800/50 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-white leading-tight">{ev.name}</h4>
                      {registered ? (
                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shrink-0 ml-2">Registered</span>
                      ) : (
                        <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shrink-0 ml-2">Open</span>
                      )}
                    </div>
                    {ev.description && <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{ev.description}</p>}
                    <div className="space-y-1">
                      <p className="text-zinc-500 text-sm font-bold flex items-center gap-1.5">
                        <CalendarCheck className="w-4 h-4" />
                        {ev.startDate}{ev.endDate && ev.endDate !== ev.startDate ? ` — ${ev.endDate}` : ''}
                      </p>
                      {(ev.city || ev.location) && (
                        <p className="text-zinc-500 text-sm flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" /> {ev.city || ev.location}{ev.provinceState ? `, ${ev.provinceState}` : ''}
                        </p>
                      )}
                      {ev.entryFee != null && (
                        <p className="text-zinc-500 text-sm flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4" /> ${ev.entryFee.toFixed(2)} per team
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {ev.eventType && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-700 text-zinc-300">{ev.eventType}</span>}
                      {ev.format && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-700 text-zinc-300">{ev.format}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => registered ? setActiveEvent(ev) : openRegistration(ev)}
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-4 ${
                      registered ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700' : 'bg-yellow-500 text-black hover:bg-yellow-400'
                    }`}
                  >
                    {registered ? 'View Details' : 'Start Registration'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-6">
          <button onClick={() => { setActiveEvent(null); setRegStep(0); }} className="text-zinc-500 text-xs font-bold uppercase hover:text-white mb-6">&larr; Back to Events</button>

          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{activeEvent.name}</h2>
              <p className="text-zinc-400 mt-1">
                {activeEvent.startDate}{activeEvent.endDate && activeEvent.endDate !== activeEvent.startDate ? ` — ${activeEvent.endDate}` : ''}
                {activeEvent.city ? ` · ${activeEvent.city}` : ''}
              </p>
            </div>
          </div>

          {isRegistered(activeEvent.id) ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 p-4 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-sm font-bold text-green-400 uppercase tracking-widest">Team is Registered</p>
                  <p className="text-xs text-green-500/70 mt-0.5">Your team is confirmed for this event.</p>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Event Info</h4>
                <InfoRow label="Entry Fee" value={`$${activeEvent.entryFee?.toFixed(2) || 'N/A'}`} />
                <InfoRow label="Format" value={activeEvent.format || 'N/A'} />
                <InfoRow label="Registration Deadline" value={activeEvent.registrationDeadline || 'N/A'} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step indicator */}
              <div className="flex border border-zinc-700 rounded-lg overflow-hidden w-full">
                {STEPS.map((step, i) => (
                  <div key={i} className={`flex-1 py-2 text-center text-[9px] font-bold uppercase tracking-widest transition-colors ${
                    i === regStep ? 'bg-yellow-500 text-black' : i < regStep ? 'bg-green-500/20 text-green-400 border-l border-zinc-800' : 'bg-zinc-900 text-zinc-500 border-l border-zinc-800'
                  }`}>
                    {i < regStep ? <Check className="w-3 h-3 inline mr-1" /> : `${i + 1}. `}{step}
                  </div>
                ))}
              </div>

              {/* Step 0: Roster Snapshot */}
              {regStep === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-white text-center">Step 1: Roster Snapshot</h4>
                  <p className="text-sm text-zinc-400 text-center max-w-md mx-auto">
                    Your current active roster has <span className="text-white font-bold">{roster.length}</span> players ({verified.length} verified, {unverified.length} unverified). Review before proceeding.
                  </p>
                  {roster.length > 0 && (
                    <div className="max-h-48 overflow-y-auto space-y-1 bg-zinc-800/50 rounded-lg p-3">
                      {roster.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between text-sm py-1 border-b border-zinc-800/30 last:border-0">
                          <span className="text-white font-bold">{p.name || `${p.firstName || ''} ${p.lastName || ''}`}</span>
                          <span className={`text-[10px] font-bold uppercase ${(p.is_verified || p.isVerified) ? 'text-green-400' : 'text-red-400'}`}>
                            {(p.is_verified || p.isVerified) ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <StepNav onBack={() => setActiveEvent(null)} onNext={() => setRegStep(1)} backLabel="Cancel" />
                </div>
              )}

              {/* Step 1: Coverage Selection */}
              {regStep === 1 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-white text-center">Step 2: Player Card Coverage</h4>
                  <p className="text-sm text-zinc-400 text-center max-w-md mx-auto">
                    Select unverified players the team will pay player card for ($10 each).
                  </p>
                  {unverified.length === 0 ? (
                    <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl text-center">
                      <p className="text-sm text-green-400 font-bold">All players are verified! No additional card coverage needed.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 bg-zinc-800/50 rounded-lg p-3">
                      {unverified.map((p: any) => (
                        <label key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={coveredPlayers.includes(p.id)}
                              onChange={() => toggleCoveredPlayer(p.id)}
                              className="w-4 h-4 accent-yellow-500"
                            />
                            <span className="text-sm text-white font-bold">{p.name || `${p.firstName || ''} ${p.lastName || ''}`}</span>
                          </div>
                          <span className="text-xs text-zinc-400">$10.00</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {coveredPlayers.length > 0 && (
                    <p className="text-sm text-yellow-500 font-bold text-center">Card coverage total: ${(coveredPlayers.length * 10).toFixed(2)}</p>
                  )}
                  <StepNav onBack={() => setRegStep(0)} onNext={() => setRegStep(2)} />
                </div>
              )}

              {/* Step 2: Slot Purchase */}
              {regStep === 2 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-white text-center">Step 3: Event Slot Purchase</h4>
                  <p className="text-sm text-zinc-400 text-center max-w-md mx-auto">
                    Choose how many event slots to purchase at ${activeEvent.entryFee?.toFixed(2)} each.
                  </p>
                  <div className="flex items-center justify-center gap-4 py-4">
                    <button onClick={() => setSlotCount(Math.max(1, slotCount - 1))} className="w-10 h-10 bg-zinc-800 rounded-xl text-white font-bold text-lg hover:bg-zinc-700 border border-zinc-700">−</button>
                    <span className="text-3xl font-black text-white w-16 text-center">{slotCount}</span>
                    <button onClick={() => setSlotCount(slotCount + 1)} className="w-10 h-10 bg-zinc-800 rounded-xl text-white font-bold text-lg hover:bg-zinc-700 border border-zinc-700">+</button>
                  </div>
                  <p className="text-sm text-zinc-400 text-center">Slot total: <span className="text-white font-bold">${(slotCount * (activeEvent.entryFee || 0)).toFixed(2)}</span></p>
                  <StepNav onBack={() => setRegStep(1)} onNext={() => setRegStep(3)} />
                </div>
              )}

              {/* Step 3: Assign Slots */}
              {regStep === 3 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-white text-center">Step 4: Assign Event Slots</h4>
                  <p className="text-sm text-zinc-400 text-center max-w-md mx-auto">
                    Select which players are covered by the team for this event ({assignedPlayers.length}/{slotCount} slots assigned).
                  </p>
                  <div className="space-y-2 bg-zinc-800/50 rounded-lg p-3 max-h-64 overflow-y-auto">
                    {roster.map((p: any) => (
                      <label key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={assignedPlayers.includes(p.id)}
                            onChange={() => toggleAssignedPlayer(p.id)}
                            disabled={!assignedPlayers.includes(p.id) && assignedPlayers.length >= slotCount}
                            className="w-4 h-4 accent-yellow-500"
                          />
                          <span className="text-sm text-white font-bold">{p.name || `${p.firstName || ''} ${p.lastName || ''}`}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${(p.is_verified || p.isVerified) ? 'text-green-400' : 'text-orange-400'}`}>
                          {(p.is_verified || p.isVerified) ? 'Verified' : coveredPlayers.includes(p.id) ? 'Team Covered' : 'Needs Card'}
                        </span>
                      </label>
                    ))}
                  </div>
                  <StepNav onBack={() => setRegStep(2)} onNext={() => setRegStep(4)} />
                </div>
              )}

              {/* Step 4: Review & Pay */}
              {regStep === 4 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-white text-center">Step 5: Review & Pay</h4>
                  <div className="space-y-2 bg-zinc-800/50 rounded-lg p-4">
                    <InfoRow label="Player Card Coverage" value={`${coveredPlayers.length} players · $${cardCost.toFixed(2)}`} />
                    <InfoRow label="Event Slots" value={`${slotCount} slots · $${eventCost.toFixed(2)}`} />
                    <div className="border-t border-zinc-700 pt-2 mt-2">
                      <InfoRow label="Grand Total" value={`$${grandTotal.toFixed(2)}`} bold />
                    </div>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-xl">
                    <p className="text-xs text-red-400 text-center font-bold">⚠ All payments are non-refundable per platform policy.</p>
                  </div>
                  <StepNav onBack={() => setRegStep(3)} onNext={() => setRegStep(5)} nextLabel="Confirm & Pay" />
                </div>
              )}

              {/* Step 5: Confirmation */}
              {regStep === 5 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-4">
                  <ShieldCheck className="w-12 h-12 text-green-400 mx-auto" />
                  <h4 className="text-xl font-black text-white uppercase tracking-tighter">Registration Complete</h4>
                  <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                    Your team has been registered for <span className="text-white font-bold">{activeEvent.name}</span>.
                  </p>
                  <div className="space-y-1 bg-zinc-800/50 rounded-lg p-4 text-left max-w-sm mx-auto">
                    <p className="text-xs text-zinc-400">Covered & cleared: <span className="text-green-400 font-bold">{assignedPlayers.length}</span></p>
                    <p className="text-xs text-zinc-400">Card coverage paid: <span className="text-white font-bold">{coveredPlayers.length}</span></p>
                    <p className="text-xs text-zinc-400">Not covered (must self-pay): <span className="text-orange-400 font-bold">{roster.length - assignedPlayers.length}</span></p>
                  </div>
                  <button
                    onClick={() => { setActiveEvent(null); setRegStep(0); }}
                    className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-yellow-500 text-black hover:bg-yellow-400"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepNav({ onBack, onNext, backLabel, nextLabel }: { onBack: () => void; onNext: () => void; backLabel?: string; nextLabel?: string }) {
  return (
    <div className="pt-4 flex justify-center gap-3">
      <button onClick={onBack} className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center gap-1">
        <ChevronLeft className="w-3 h-3" /> {backLabel || 'Back'}
      </button>
      <button onClick={onNext} className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 flex items-center gap-1">
        {nextLabel || 'Continue'} <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-zinc-400">{label}</span>
      <span className={`${bold ? 'text-yellow-500 font-black text-lg' : 'text-white font-bold'}`}>{value}</span>
    </div>
  );
}
