import React, { useState, useEffect } from 'react';
import { Home, Users, Calendar, CreditCard, Bell, Settings, Shield, AlertTriangle, CheckCircle, Info, Lock, Unlock, Camera, Save, User, Mail, MapPin, Ruler, Weight, Hash } from 'lucide-react';
import { cn, formatRole } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';
import { API_URL as API } from '../../lib/api';

type Tab = 'home' | 'team' | 'events' | 'payments' | 'notifications' | 'settings';

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function PlayerDashboard() {
  const { user } = useAuth();
  const token = localStorage.getItem('dtached_token');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/players/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(p => {
        setPlayer(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-3xl">
        <p className="text-zinc-400">Please complete your player profile first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="flex items-center gap-6 bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 overflow-hidden border-2 border-yellow-500/20 shrink-0">
          {user?.photoUrl || player.photo_url || player.photoUrl ? (
            <img
              src={user?.photoUrl || player.photo_url || player.photoUrl}
              className="w-full h-full object-cover"
              alt="Profile"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-yellow-500 font-black text-xl">
              {player.first_name?.[0] || player.firstName?.[0]}{player.last_name?.[0] || player.lastName?.[0]}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase">
            {player.name || `${player.first_name || player.firstName} ${player.last_name || player.lastName}`}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <button 
              onClick={() => {
                const tag = player.player_tag || player.playerTag || 'NO-TAG';
                navigator.clipboard.writeText(tag);
                alert('Player Tag copied to clipboard: ' + tag);
              }}
              title="Click to copy Player Tag"
              className="group flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Hash className="w-3 h-3 text-yellow-500" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                {player.player_tag || player.playerTag || 'NO-TAG'}
              </span>
            </button>
            <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-wider ${
              player.team_name || player.teamName ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
            }`}>
              {player.team_name || player.teamName ? 'On Team' : 'Free Agent'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-zinc-900 p-1 rounded-2xl border border-zinc-800 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === t.id ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        {activeTab === 'home' && <HomeTab player={player} token={token} />}
        {activeTab === 'team' && <TeamTab player={player} token={token} />}
        {activeTab === 'events' && <EventsTab player={player} token={token} />}
        {activeTab === 'payments' && <PaymentsTab player={player} token={token} />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'settings' && <SettingsTab player={player} token={token} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// TABS
// ----------------------------------------------------------------------------

function HomeTab({ player, token }: any) {
  const isVerified = player.is_verified || player.isVerified;
  const teamName = player.team_name || player.teamName;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team Status Card */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-800/30">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Current Team</p>
          {teamName ? (
            <div>
              <p className="text-xl font-black text-white">{teamName}</p>
              <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Active Member
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-black text-zinc-500">None</p>
              <p className="text-xs text-orange-400 mt-1">Free Agent Market</p>
            </div>
          )}
        </div>

        {/* Player Card Status */}
        <div className={`p-5 rounded-2xl border ${isVerified ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Player Card</p>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xl font-black ${isVerified ? 'text-green-400' : 'text-amber-400'}`}>
                {isVerified ? 'Active ✓' : 'Required'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {isVerified ? 'Covered (Self-Paid)' : 'Unpaid — Payment required for events'}
              </p>
            </div>
            {!isVerified && (
              <button className="px-3 py-1.5 bg-amber-500 text-black text-[10px] font-bold uppercase rounded-lg">
                Pay $9.99
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alerts / Next Event */}
      <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-800/30 space-y-3">
        <h4 className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Action Items & Alerts</h4>
        {isVerified ? (
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>You are fully cleared and eligible. No pending actions.</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Player Card payment required to become eligible for competitive events.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TeamTab({ player, token }: any) {
  const teamName = player.team_name || player.teamName;
  
  if (!teamName) {
    return <p className="text-zinc-400 text-sm">You are not currently assigned to a team.</p>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Team Roster</h3>
      
      <div className="p-5 rounded-2xl shadow-inner bg-zinc-800/20 border border-zinc-800 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div>
            <p className="text-2xl font-black text-white italic">{teamName}</p>
            <p className="text-xs text-zinc-500">Coach: Managed Team</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-green-400 text-xs font-bold uppercase mb-1">
              <CheckCircle className="w-3 h-3" /> Active Member
            </div>
            <div className="flex items-center justify-end gap-1 text-zinc-500 text-[10px] font-bold uppercase">
              <Lock className="w-3 h-3" /> Roster Locked
            </div>
          </div>
        </div>
        
        <p className="text-sm text-zinc-400 italic">
          Team composition and roster visibility is restricted. You are actively enlisted on this roster's event submissions.
        </p>
      </div>
    </div>
  );
}

function EventsTab({ player, token }: any) {
  const isVerified = player.is_verified || player.isVerified;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Team Events</h3>
      <p className="text-sm text-zinc-400 mb-6">Events your team is registered for. Your inclusion is automatic based on roster lock.</p>

      <div className="border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-800/50 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
            <tr>
              <th className="p-4 font-medium">Event</th>
              <th className="p-4 font-medium">Team Reg</th>
              <th className="p-4 font-medium">Player Included</th>
              <th className="p-4 font-medium">Slot Covered</th>
              <th className="p-4 font-medium">Eligibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 text-white">
            <tr className="bg-zinc-900/50">
              <td className="p-4">
                <p className="font-bold text-white">Spring 7v7 Elite Series</p>
                <p className="text-[10px] text-zinc-500">May 12 - May 14</p>
              </td>
              <td className="p-4"><span className="text-green-400 font-bold uppercase text-[10px]">Yes</span></td>
              <td className="p-4"><span className="text-green-400 font-bold uppercase text-[10px]">Yes (Roster)</span></td>
              <td className="p-4"><span className="text-orange-400 font-bold uppercase text-[10px]">Pending (Team)</span></td>
              <td className="p-4">
                {isVerified ? (
                 <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-md text-[10px] font-black uppercase">Cleared</span>
                ) : (
                 <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-md text-[10px] font-black uppercase">Card Req</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab({ player, token }: any) {
  const isVerified = player.is_verified || player.isVerified;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Payments</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-800/30">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-3">Outstanding Balances</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Player Card (Annual)</span>
              {isVerified ? (
                <span className="text-green-400 font-bold max-w-24 text-right">Covered ($0.00)</span>
              ) : (
                <span className="text-red-400 font-bold max-w-24 text-right">$9.99 Owed</span>
              )}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Event Slot (Spring Elite)</span>
              <span className="text-blue-400 font-bold max-w-24 text-right">Team Covered</span>
            </div>
            <div className="pt-3 border-t border-zinc-800 flex justify-between items-center">
              <span className="font-bold text-white">Total Due</span>
              <span className={`font-black tracking-tighter text-xl ${isVerified ? 'text-white' : 'text-red-400'}`}>
                {isVerified ? '$0.00' : '$9.99'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-800/30 space-y-4">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Payment History</p>
          {isVerified ? (
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-white font-bold">Player Card Checkout</p>
                <p className="text-[10px] text-zinc-500">Via Stripe</p>
              </div>
              <span className="text-green-400 font-bold">Paid</span>
            </div>
          ) : (
             <p className="text-sm text-zinc-500 italic">No payments recorded.</p>
          )}
        </div>
      </div>
      
      <div className="flex items-start gap-3 p-4 bg-zinc-800/20 rounded-xl border border-zinc-800 text-xs text-zinc-400">
        <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
        <p>All payments made via Dtached are strictly non-refundable as per the organizational policy. Team-covered fees are not billed directly to the player account.</p>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Notifications</h3>
      <div className="space-y-3">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/30 flex items-start gap-4 line-through opacity-50">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Team Registered for Event</p>
            <p className="text-xs text-zinc-400 mt-1">Your team has successfully submitted their roster for the Spring 7v7 Elite Series.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-800/30 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Player Card Unverified</p>
            <p className="text-xs text-zinc-400 mt-1">Please ensure your player card is paid to be eligible for upcoming tournament fixtures.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const POSITIONS = ['QB', 'WR', 'RB', 'TE', 'DB', 'LB', 'DL', 'OL', 'K', 'P', 'ATH'];

function SettingsTab({ player, token }: any) {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    firstName: player?.firstName || player?.first_name || user?.firstName || '',
    lastName: player?.lastName || player?.last_name || user?.lastName || '',
    position: player?.position || '',
    height: player?.height || '',
    weight: player?.weight || '',
    city: player?.city || '',
    province: player?.province || '',
    jerseyNumber: player?.jerseyNumber?.toString() || player?.jersey_number?.toString() || '',
    bio: player?.bio || '',
    dob: player?.dob || '',
    gender: player?.gender || '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(player?.photo_url || player?.photoUrl || user?.photoUrl || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`${API}/my/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          position: form.position || null,
          height: form.height || null,
          weight: form.weight || null,
          city: form.city || null,
          province: form.province || null,
          jerseyNumber: form.jerseyNumber ? parseInt(form.jerseyNumber) : null,
          photoUrl: photoPreview || null,
          dob: form.dob || null,
          gender: form.gender || null,
          bio: form.bio || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save profile');
      }
      setSaved(true);
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">My Profile & Settings</h3>
        <p className="text-sm text-zinc-400 mt-1">Manage your player profile and account settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Profile Photo */}
        <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-6">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Profile Photo</label>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-zinc-600">
                    <span className="text-xl font-black text-yellow-500/40">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Upload a photo</p>
              <p className="text-xs text-zinc-500 mt-1">JPG, PNG or WEBP. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Account Info (read-only) */}
        <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Account</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400">
                <Mail className="w-4 h-4 text-zinc-600" />
                {user?.email}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Role</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400">
                <Shield className="w-4 h-4 text-zinc-600" />
                {formatRole(user?.role)}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Personal Info</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">First Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:border-yellow-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:border-yellow-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">City</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                  placeholder="e.g. Toronto"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Prov / State</label>
              <input
                type="text"
                value={form.province}
                onChange={(e) => update('province', e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                placeholder="e.g. ON"
              />
            </div>
          </div>
        </div>

        {/* Player Details */}
        <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Player Details</label>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Position</label>
            <div className="flex flex-wrap gap-2">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => update('position', pos)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all',
                    form.position === pos
                      ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  )}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Height</label>
              <div className="relative">
                <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={form.height}
                  onChange={(e) => update('height', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                  placeholder={`6'0"`}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Weight</label>
              <div className="relative">
                <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={form.weight}
                  onChange={(e) => update('weight', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                  placeholder="180 lbs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Jersey #</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="number"
                  value={form.jerseyNumber}
                  onChange={(e) => update('jerseyNumber', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                  placeholder="7"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => update('dob', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:border-yellow-500/50 focus:outline-none transition-colors style-scheme-dark"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Gender</label>
              <div className="flex gap-2">
                {['Boy', 'Girl'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update('gender', g)}
                    className={cn(
                      'flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1',
                      form.gender === g
                        ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    )}
                  >
                    <Users className="w-3 h-3" />
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security / Password */}
        <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-6">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Security</label>
          <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div>
               <p className="text-sm font-bold text-white">Password</p>
               <p className="text-xs text-zinc-400">Change your account password</p>
            </div>
            <button type="button" className="px-4 py-2 bg-zinc-800 text-white text-[10px] font-black uppercase rounded-lg hover:bg-zinc-700 border border-zinc-700">
               Reset
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-6 space-y-3">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Notification Preferences</label>
          <label className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 p-4 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked className="accent-yellow-500 w-4 h-4 rounded border-zinc-700 bg-zinc-800" />
            Event eligibility changes
          </label>
          <label className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 p-4 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked className="accent-yellow-500 w-4 h-4 rounded border-zinc-700 bg-zinc-800" />
            Team roster locks
          </label>
        </div>

        {/* Status messages */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Profile and settings saved successfully!
          </div>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-yellow-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
}
