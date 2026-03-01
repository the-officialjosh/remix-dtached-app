import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Trophy, Clock, DollarSign, ChevronRight, Tent, Award } from 'lucide-react';
import { cn } from '../../lib/utils';
import { API_URL as API } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

interface Event {
  id: number; name: string; description?: string; location?: string;
  city?: string; provinceState?: string; startDate: string; endDate: string;
  registrationDeadline?: string; format: string; status: string; maxTeams?: number;
  entryFee?: number; bannerUrl?: string; registeredTeams?: number;
}

export default function EventsPage({ onRegister }: { onRegister?: (eventType: 'camp' | 'tournament') => void }) {
  const { isAuthenticated, isCoach } = useAuth();
  const token = localStorage.getItem('dtached_token');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registering, setRegistering] = useState(false);
  const [regMessage, setRegMessage] = useState('');

  useEffect(() => {
    fetch(`${API}/events/published`)
      .then(r => r.ok ? r.json() : [])
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRegisterTeam = async (eventId: number, teamId?: number) => {
    if (!token || !teamId) return;
    setRegistering(true);
    setRegMessage('');
    try {
      const res = await fetch(`${API}/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teamId })
      });
      const data = await res.json();
      if (res.ok) {
        setRegMessage('Registration submitted! Awaiting admin approval.');
      } else {
        setRegMessage(data.message || 'Registration failed');
      }
    } catch {
      setRegMessage('Failed to register');
    }
    setRegistering(false);
  };

  const getEventIcon = (name: string) => {
    if (name.toLowerCase().includes('camp')) return Tent;
    if (name.toLowerCase().includes('tournament')) return Trophy;
    return Award;
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return d; }
  };

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
          Events & <span className="text-yellow-500">Tournaments</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Browse upcoming camps, tournaments, and showcases. Register your team or sign up as a player.
        </p>
      </div>

      {/* Event Grid */}
      {events.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
          <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">No Upcoming Events</h3>
          <p className="text-zinc-500 text-sm mt-2">Check back soon for new tournaments and camps.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => {
            const Icon = getEventIcon(event.name);
            const isPast = new Date(event.endDate) < new Date();
            const deadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();

            return (
              <div key={event.id}
                className={cn(
                  "group bg-zinc-900/80 border rounded-3xl overflow-hidden hover:border-yellow-500/30 transition-all duration-300 hover:-translate-y-1",
                  isPast ? "border-zinc-800/50 opacity-60" : "border-zinc-800"
                )}
              >
                {/* Event Banner */}
                <div className="relative h-40 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-zinc-900 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-10 h-10 text-yellow-500" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                      event.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      event.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-zinc-700 text-zinc-300'
                    )}>
                      {isPast ? 'COMPLETED' : event.status === 'PUBLISHED' ? 'OPEN' : event.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {event.entryFee && event.entryFee > 0 && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-yellow-500 text-xs font-black flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />{event.entryFee}
                    </div>
                  )}
                </div>

                {/* Event Info */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">{event.name}</h3>
                    {event.description && (
                      <p className="text-zinc-500 text-sm mt-1 line-clamp-2">{event.description}</p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="w-4 h-4 text-yellow-500/60" />
                      <span>{formatDate(event.startDate)} — {formatDate(event.endDate)}</span>
                    </div>
                    {event.city && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <MapPin className="w-4 h-4 text-yellow-500/60" />
                        <span>{event.city}{event.provinceState ? `, ${event.provinceState}` : ''}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Users className="w-4 h-4 text-yellow-500/60" />
                      <span>{event.format} · {event.registeredTeams ?? 0}{event.maxTeams ? `/${event.maxTeams}` : ''} teams</span>
                    </div>
                    {event.registrationDeadline && !isPast && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Clock className="w-4 h-4 text-yellow-500/60" />
                        <span>Deadline: {formatDate(event.registrationDeadline)}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  {!isPast && !deadlinePassed && (
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="w-full py-3 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {deadlinePassed && !isPast && (
                    <div className="w-full py-3 bg-zinc-800 text-zinc-500 font-black uppercase text-xs tracking-widest rounded-xl text-center">
                      Registration Closed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setSelectedEvent(null); setRegMessage(''); }}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-lg w-full p-8 space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{selectedEvent.name}</h2>
                <p className="text-zinc-500 text-sm mt-1">{selectedEvent.format}</p>
              </div>
              <button onClick={() => { setSelectedEvent(null); setRegMessage(''); }} className="text-zinc-500 hover:text-white text-2xl">×</button>
            </div>

            {selectedEvent.description && <p className="text-zinc-400 text-sm">{selectedEvent.description}</p>}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400 border-b border-zinc-800 pb-2">
                <span>Dates</span>
                <span className="text-white font-bold">{formatDate(selectedEvent.startDate)} — {formatDate(selectedEvent.endDate)}</span>
              </div>
              {selectedEvent.city && (
                <div className="flex justify-between text-zinc-400 border-b border-zinc-800 pb-2">
                  <span>Location</span>
                  <span className="text-white font-bold">{selectedEvent.city}{selectedEvent.provinceState ? `, ${selectedEvent.provinceState}` : ''}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400 border-b border-zinc-800 pb-2">
                <span>Entry Fee</span>
                <span className="text-white font-bold">{selectedEvent.entryFee ? `$${selectedEvent.entryFee}` : 'Free'}</span>
              </div>
              <div className="flex justify-between text-zinc-400 border-b border-zinc-800 pb-2">
                <span>Teams</span>
                <span className="text-white font-bold">{selectedEvent.registeredTeams ?? 0}{selectedEvent.maxTeams ? ` / ${selectedEvent.maxTeams}` : ''} registered</span>
              </div>
              {selectedEvent.registrationDeadline && (
                <div className="flex justify-between text-zinc-400">
                  <span>Deadline</span>
                  <span className="text-white font-bold">{formatDate(selectedEvent.registrationDeadline)}</span>
                </div>
              )}
            </div>

            {regMessage && (
              <div className={cn('px-4 py-3 rounded-xl text-sm font-bold', regMessage.includes('submitted') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20')}>
                {regMessage}
              </div>
            )}

            {!isAuthenticated && (
              <p className="text-center text-zinc-500 text-sm">Sign in to register for this event.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
