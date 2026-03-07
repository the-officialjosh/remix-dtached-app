import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, Ticket, UserPlus, CalendarCheck, Settings,
  Copy, RefreshCw, Lock, Unlock, Check, X, Shield, Edit3, Save,
  MapPin, Trophy, AlertTriangle, ChevronRight, Hash, Clock, Search, Heart, Camera
} from 'lucide-react';
import { API_URL as API } from '../../lib/api';

type Tab = 'overview' | 'profile' | 'invite' | 'roster' | 'requests' | 'events' | 'freeagents' | 'settings';

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'profile', label: 'Team Profile', icon: Edit3 },
  { key: 'invite', label: 'Invite Code', icon: Ticket },
  { key: 'roster', label: 'Roster', icon: Users },
  { key: 'requests', label: 'Join Requests', icon: UserPlus },
  { key: 'freeagents', label: 'Free Agents', icon: Search },
  { key: 'events', label: 'Events', icon: CalendarCheck },
  { key: 'settings', label: 'Settings', icon: Settings },
];

import type { Player } from '../../types';
import { useAuth } from '../../lib/AuthContext';

export default function CoachDashboard({ onUpdate, players }: { onUpdate: () => void, players?: Player[] }) {
  const { user } = useAuth();
  const token = localStorage.getItem('dtached_token');
  const [tab, setTab] = useState<Tab>('overview');
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingJoins, setPendingJoins] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // Team profile edit state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', bio: '', city: '', provinceState: '', division: '' });
  const [saveMsg, setSaveMsg] = useState('');

  const auth = { Authorization: `Bearer ${token}` };
  const authJson = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const loadTeam = useCallback(async () => {
    try {
      const res = await fetch(`${API}/my/team`, { headers: auth });
      if (res.ok) {
        const t = await res.json();
        setTeam(t);
        setProfileForm({
          name: t.name || '',
          bio: t.bio || '',
          city: t.city || '',
          provinceState: t.provinceState || t.province_state || '',
          division: t.division || 'Elite',
        });
      } else {
        setTeam(null);
      }
    } catch { setTeam(null); }
    setLoading(false);
  }, [token]);

  const loadPendingJoins = useCallback(async () => {
    try {
      const res = await fetch(`${API}/my/team/requests`, { headers: auth });
      if (res.ok) setPendingJoins(await res.json());
    } catch { /* ignore */ }
  }, [token]);

  const loadEvents = useCallback(async () => {
    try {
      const [evRes, regRes] = await Promise.all([
        fetch(`${API}/events/published`, { headers: auth }),
        fetch(`${API}/events/my-registrations`, { headers: auth }),
      ]);
      if (evRes.ok) setEvents(await evRes.json());
      if (regRes.ok) setMyRegistrations(await regRes.json());
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    loadTeam();
    loadPendingJoins();
    loadEvents();
  }, [loadTeam, loadPendingJoins, loadEvents]);

  // --- Actions ---
  const copyCode = () => {
    const code = team?.inviteCode || team?.invite_code;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleRosterLock = async () => {
    const endpoint = team?.rosterLocked ? 'unlock' : 'lock';
    await fetch(`${API}/my/team/roster/${endpoint}`, { method: 'PUT', headers: authJson });
    setTeam({ ...team, rosterLocked: !team.rosterLocked });
    onUpdate();
  };

  const approveJoin = async (id: number) => {
    await fetch(`${API}/my/team/requests/${id}/approve`, { method: 'PUT', headers: authJson });
    setPendingJoins(prev => prev.filter(r => r.id !== id));
    loadTeam();
    onUpdate();
  };

  const rejectJoin = async (id: number) => {
    await fetch(`${API}/my/team/requests/${id}/reject`, { method: 'PUT', headers: authJson });
    setPendingJoins(prev => prev.filter(r => r.id !== id));
  };

  const releasePlayer = async (playerId: number) => {
    if (!confirm('Remove this player from the roster?')) return;
    await fetch(`${API}/my/team/players/${playerId}`, { method: 'DELETE', headers: authJson });
    loadTeam();
    onUpdate();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSaveMsg('Error: Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProfileForm(prev => ({ ...prev, logoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setSaveMsg('');
    // Currently the backend doesn't have a team update endpoint, so just show feedback
    setSaveMsg('Profile changes saved (pending backend support for team updates)');
    setEditing(false);
  };

  // --- Helpers ---
  const inviteCode = team?.inviteCode || team?.invite_code || '';
  const teamTag = team?.teamTag || team?.team_tag || '';
  const rosterCount = team?.roster?.length || 0;
  const isLocked = team?.rosterLocked || false;
  const teamStatus = team?.status || 'PENDING';

  // No team yet
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    if (user?.role === 'TEAM_MANAGER') {
      return (
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <Shield className="w-16 h-16 text-zinc-700 mx-auto" />
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">No Team Assigned</h2>
          <p className="text-zinc-400">
            As a Team Manager, you cannot register a new team yourself. You must be added to a team's staff by a Head Coach or Administrator.
          </p>
          <p className="text-sm text-zinc-500">
            Once you are added to a team, your dashboard will appear here automatically.
          </p>
        </div>
      );
    }
    
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <Shield className="w-16 h-16 text-zinc-700 mx-auto" />
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">No Team Assigned</h2>
        <p className="text-zinc-400">
          Your coach application has been approved, but no team has been provisioned for you yet. An administrator will create your team and assign you shortly.
        </p>
        <p className="text-sm text-zinc-500">
          Once your team is set up, your full coaching dashboard will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">{team.name}</h2>
          <div className="flex items-center gap-3 mt-2">
            
            {/* Team Tag Click-to-Copy */}
            {teamTag && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(teamTag);
                  alert('Team Tag copied to clipboard: ' + teamTag);
                }}
                title="Click to copy Team Tag"
                className="group flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Hash className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{teamTag}</span>
              </button>
            )}

            {/* Coach Tag (userTag) Click-to-Copy */}
            {user?.userTag && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user.userTag!);
                  alert('Coach Tag copied to clipboard: ' + user.userTag);
                }}
                title="Click to copy Coach Tag"
                className="group flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Hash className="w-3 h-3 text-yellow-500" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{user.userTag}</span>
              </button>
            )}

            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
              teamStatus === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
            }`}>
              {teamStatus}
            </span>
          </div>
        </div>
        <Shield className="w-8 h-8 text-yellow-500/30" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-zinc-900 p-1 rounded-2xl border border-zinc-800 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              tab === t.key ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.key === 'requests' && pendingJoins.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-[8px] rounded-full">{pendingJoins.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        {/* ═══════════ OVERVIEW ═══════════ */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Team Overview</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Roster" value={rosterCount} icon={Users} color="text-blue-400" />
              <StatCard label="Pending" value={pendingJoins.length} icon={UserPlus} color="text-yellow-500" />
              <StatCard
                label="Roster Status"
                value={isLocked ? 'Locked' : 'Open'}
                icon={isLocked ? Lock : Unlock}
                color={isLocked ? 'text-red-400' : 'text-green-400'}
              />
              <StatCard
                label="Team Status"
                value={teamStatus}
                icon={teamStatus === 'APPROVED' ? Check : Clock}
                color={teamStatus === 'APPROVED' ? 'text-green-400' : 'text-orange-400'}
              />
            </div>

            {/* Quick info rows */}
            <div className="space-y-3">
              <InfoRow label="Team Tag" value={teamTag} mono />
              <InfoRow label="Invite Code" value={inviteCode} mono accent />
              <InfoRow label="Division" value={team.division || 'N/A'} />
              <InfoRow label="Location" value={[team.city, team.provinceState || team.province_state].filter(Boolean).join(', ') || 'N/A'} />
              <InfoRow label="Coach" value={team.coachName || team.coach_name || 'You'} />
            </div>

            {/* Pending alerts */}
            {pendingJoins.length > 0 && (
              <button
                onClick={() => setTab('requests')}
                className="w-full flex items-center justify-between bg-blue-500/5 border border-blue-500/20 px-4 py-3 rounded-xl hover:bg-blue-500/10 transition-all"
              >
                <span className="text-sm text-blue-400 font-bold">
                  {pendingJoins.length} pending join request{pendingJoins.length !== 1 ? 's' : ''} awaiting your review
                </span>
                <ChevronRight className="w-4 h-4 text-blue-400" />
              </button>
            )}

            {/* Event registrations */}
            {myRegistrations.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Event Registrations</p>
                {myRegistrations.slice(0, 3).map((reg: any) => (
                  <div key={reg.id} className="flex items-center justify-between bg-zinc-800/50 px-4 py-2 rounded-xl">
                    <span className="text-sm text-white">{reg.eventName || reg.event_name || 'Event'}</span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      reg.status === 'APPROVED' ? 'bg-green-500/10 text-green-400'
                      : 'bg-orange-500/10 text-orange-400'
                    }`}>{reg.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TEAM PROFILE ═══════════ */}
        {tab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Team Profile</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase rounded-full hover:bg-zinc-700 transition-all">
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase rounded-full hover:bg-zinc-700">Cancel</button>
                  <button onClick={saveProfile} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-black text-[10px] font-bold uppercase rounded-full hover:bg-yellow-400">
                    <Save className="w-3 h-3" /> Save
                  </button>
                </div>
              )}
            </div>

            {saveMsg && <p className={`text-sm ${saveMsg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{saveMsg}</p>}

            {/* Logo Upload */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden">
                  {profileForm.logoUrl ? (
                    <img src={profileForm.logoUrl} alt="Team Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-zinc-600">
                      <Shield className="w-8 h-8 text-yellow-500/40" />
                    </div>
                  )}
                </div>
                {editing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-widest">Team Logo</p>
                {editing ? (
                  <p className="text-xs text-zinc-500 mt-1">Click image to upload (max 5MB)</p>
                ) : (
                  <p className="text-xs text-zinc-500 mt-1">Click Edit to change logo</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <ProfileField label="Team Name" value={profileForm.name} editing={editing}
                onChange={v => setProfileForm({ ...profileForm, name: v })} />
              <ProfileField label="Division" value={profileForm.division} editing={editing}
                onChange={v => setProfileForm({ ...profileForm, division: v })} />
              <div className="grid grid-cols-2 gap-4">
                <ProfileField label="City" value={profileForm.city} editing={editing}
                  onChange={v => setProfileForm({ ...profileForm, city: v })} />
                <ProfileField label="Province/State" value={profileForm.provinceState} editing={editing}
                  onChange={v => setProfileForm({ ...profileForm, provinceState: v })} />
              </div>
              <ProfileField label="Description" value={profileForm.bio} editing={editing} multiline
                onChange={v => setProfileForm({ ...profileForm, bio: v })} />
            </div>

            <div className="space-y-3 border-t border-zinc-800 pt-4">
              <InfoRow label="Team Tag" value={teamTag} mono />
              <InfoRow label="Type" value={team.type || 'N/A'} />
              <InfoRow label="Status" value={teamStatus} />
            </div>
          </div>
        )}

        {/* ═══════════ INVITE CODE ═══════════ */}
        {tab === 'invite' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Invite Code</h3>
            <p className="text-sm text-zinc-400">Share this code with players to let them join your team. Players enter the code on their dashboard to send a join request.</p>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8 text-center space-y-4">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Your Team Invite Code</p>
              <p className="text-4xl font-mono font-black text-yellow-500 tracking-[0.3em]">{inviteCode || 'N/A'}</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={copyCode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    copied ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-700 text-white hover:bg-zinc-600'
                  }`}
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
                </button>
              </div>
            </div>

            <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-4 space-y-2">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">How It Works</p>
              <div className="space-y-1.5 text-sm text-zinc-400">
                <p>1. Share your invite code with players</p>
                <p>2. Players enter the code on their dashboard</p>
                <p>3. A join request appears in your <strong className="text-white">Join Requests</strong> tab</p>
                <p>4. You review and approve or reject each request</p>
              </div>
            </div>

            {isLocked && (
              <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 px-4 py-3 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">Your roster is locked. No new players can join until you unlock it.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ ROSTER ═══════════ */}
        {tab === 'roster' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">
                Roster <span className="text-zinc-500 text-sm ml-2">({rosterCount})</span>
              </h3>
              <button
                onClick={toggleRosterLock}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  isLocked
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                }`}
              >
                {isLocked ? <><Unlock className="w-3.5 h-3.5" /> Unlock Roster</> : <><Lock className="w-3.5 h-3.5" /> Lock Roster</>}
              </button>
            </div>

            {isLocked && (
              <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 px-4 py-3 rounded-xl">
                <Lock className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">Roster is locked. No new joins or modifications allowed. Unlock to make changes.</p>
              </div>
            )}

            {rosterCount === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No players on the roster yet.</p>
                <button onClick={() => setTab('invite')} className="mt-3 text-yellow-500 text-sm font-bold hover:underline">
                  Share your invite code →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {(team.roster || []).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between bg-zinc-800/50 border border-zinc-800 px-4 py-3 rounded-xl group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        {p.number || '#'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{p.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          {p.playerTag && <span className="font-mono">{p.playerTag}</span>}
                          {p.position && <span>• {p.position}</span>}
                          {p.city && <span>• {p.city}</span>}
                        </div>
                      </div>
                    </div>
                    {!isLocked && (
                      <button
                        onClick={() => releasePlayer(p.id)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded-full hover:bg-red-500/20 transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ JOIN REQUESTS ═══════════ */}
        {tab === 'requests' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">
              Join Requests
              {pendingJoins.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-full">{pendingJoins.length}</span>
              )}
            </h3>

            {isLocked && (
              <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 px-4 py-3 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">Roster is locked. You can review requests but new joins are blocked until you unlock.</p>
              </div>
            )}

            {pendingJoins.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No pending join requests.</p>
                <p className="text-zinc-600 text-xs mt-1">Players who enter your invite code will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingJoins.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between bg-blue-500/5 border border-blue-500/20 px-5 py-4 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {r.player?.firstName || r.player?.first_name || ''} {r.player?.lastName || r.player?.last_name || ''}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                        {r.player?.playerTag && <span className="font-mono">{r.player.playerTag}</span>}
                        {r.player?.position && <span>• {r.player.position}</span>}
                        <span>• {r.requestType === 'TRANSFER' ? 'Transfer' : 'Join Request'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveJoin(r.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded-full hover:bg-green-500/20 transition-all border border-green-500/20"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => rejectJoin(r.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded-full hover:bg-red-500/20 transition-all border border-red-500/20"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ FREE AGENTS ═══════════ */}
        {tab === 'freeagents' && (
          <FreeAgentSearch teamId={team.id} token={token!} />
        )}

        {/* ═══════════ EVENTS ═══════════ */}
        {tab === 'events' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Event Registration</h3>

            {/* My Registrations */}
            {myRegistrations.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Your Registrations</p>
                {myRegistrations.map((reg: any) => (
                  <div key={reg.id} className="flex items-center justify-between bg-zinc-800/50 border border-zinc-800 px-4 py-3 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-white">{reg.eventName || reg.event_name || 'Event'}</p>
                      <p className="text-[10px] text-zinc-500">{reg.divisionName || reg.division_name || ''}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      reg.status === 'APPROVED' ? 'bg-green-500/10 text-green-400'
                      : reg.status === 'REJECTED' ? 'bg-red-500/10 text-red-400'
                      : 'bg-orange-500/10 text-orange-400'
                    }`}>{reg.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Available Events */}
            <div className="space-y-3">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Available Events</p>
              {events.length === 0 ? (
                <p className="text-zinc-600 text-sm py-4 text-center">No events available right now.</p>
              ) : (
                events.map((ev: any) => (
                  <div key={ev.id} className="flex items-center justify-between bg-zinc-800/50 border border-zinc-800 px-4 py-3 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-white">{ev.name}</p>
                      <p className="text-[10px] text-zinc-500">{ev.eventType || ev.event_type || ''} • {ev.location || ''}</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API}/events/${ev.id}/register`, {
                            method: 'POST',
                            headers: authJson,
                            body: JSON.stringify({ teamId: team.id }),
                          });
                          if (res.ok) {
                            loadEvents();
                            alert('Registration submitted!');
                          } else {
                            const d = await res.json();
                            alert(d.message || d.error || 'Registration failed');
                          }
                        } catch { alert('Failed to register'); }
                      }}
                      className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase rounded-full hover:bg-yellow-500/20 transition-all border border-yellow-500/20"
                    >
                      Register
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ═══════════ SETTINGS ═══════════ */}
        {tab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Team Settings</h3>

            <div className="space-y-4">
              {/* Roster Lock Control */}
              <div className="bg-zinc-800/50 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Roster Lock</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {isLocked
                        ? 'Roster is locked. No new players can join or be removed.'
                        : 'Roster is open. Players can join via invite code.'}
                    </p>
                  </div>
                  <button
                    onClick={toggleRosterLock}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      isLocked
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    {isLocked ? <><Unlock className="w-3.5 h-3.5" /> Unlock</> : <><Lock className="w-3.5 h-3.5" /> Lock</>}
                  </button>
                </div>
              </div>

              {/* Team Info */}
              <div className="bg-zinc-800/50 border border-zinc-800 rounded-xl p-5 space-y-3">
                <p className="text-sm font-bold text-white">Team Identity</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Team Tag</span>
                    <span className="font-mono text-white">{teamTag}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Invite Code</span>
                    <span className="font-mono text-yellow-500">{inviteCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Type</span>
                    <span className="text-white">{team.type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Division</span>
                    <span className="text-white">{team.division || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-4 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-1.5 ${color}`} />
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">{label}</p>
    </div>
  );
}

function InfoRow({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{label}</span>
      <span className={`text-sm font-bold ${mono ? 'font-mono' : ''} ${accent ? 'text-yellow-500' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function ProfileField({ label, value, editing, onChange, multiline }: {
  label: string; value: string; editing: boolean; onChange: (v: string) => void; multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1 block">{label}</label>
      {editing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white resize-none focus:border-yellow-500/50 focus:outline-none transition-colors"
          />
        ) : (
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500/50 focus:outline-none transition-colors"
          />
        )
      ) : (
        <p className="text-sm text-white bg-zinc-800/30 px-4 py-3 rounded-xl">{value || <span className="text-zinc-600">Not set</span>}</p>
      )}
    </div>
  );
}

function FreeAgentSearch({ teamId, token }: { teamId: number; token: string }) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [interestSent, setInterestSent] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`${API}/players/free-agents`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setAgents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const expressInterest = async (playerId: number) => {
    try {
      const res = await fetch(`${API}/interests/team/${teamId}/player/${playerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInterestSent(prev => new Set(prev).add(playerId));
      }
    } catch { /* silently handle */ }
  };

  const filtered = filter
    ? agents.filter(a => (a.position || '').toLowerCase().includes(filter.toLowerCase()) ||
        (a.name || `${a.firstName} ${a.lastName}`).toLowerCase().includes(filter.toLowerCase()))
    : agents;

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Free Agent Market</h3>
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{agents.length} Available</span>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          placeholder="Search by name or position..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-yellow-500/50 outline-none transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">{agents.length === 0 ? 'No free agents available right now.' : 'No matches for your search.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((agent: any) => {
            const name = agent.name || `${agent.firstName || agent.first_name || ''} ${agent.lastName || agent.last_name || ''}`.trim();
            const sent = interestSent.has(agent.id);
            return (
              <div key={agent.id} className="flex items-center justify-between bg-zinc-800/50 border border-zinc-800 px-5 py-4 rounded-xl group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                    {agent.position || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      {agent.city && <span>{agent.city}</span>}
                      {agent.height && <span>• {agent.height}</span>}
                      {agent.weight && <span>• {agent.weight}</span>}
                    </div>
                  </div>
                </div>
                {sent ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded-full border border-green-500/20">
                    <Heart className="w-3 h-3" /> Interest Sent
                  </span>
                ) : (
                  <button
                    onClick={() => expressInterest(agent.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase rounded-full hover:bg-yellow-500/20 transition-all border border-yellow-500/20"
                  >
                    <Heart className="w-3.5 h-3.5" /> Express Interest
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

