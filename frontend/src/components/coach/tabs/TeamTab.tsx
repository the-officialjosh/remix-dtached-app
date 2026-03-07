import React, { useState } from 'react';
import { Edit3, Save, Camera, Shield, Check, Copy, AlertTriangle } from 'lucide-react';

export default function TeamTab({ team }: { team: any, onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: team?.name || '',
    bio: team?.bio || '',
    city: team?.city || '',
    provinceState: team?.provinceState || team?.province_state || '',
    division: team?.division || 'Elite'
  });

  const teamTag = team?.teamTag || team?.team_tag || '';
  const inviteCode = team?.inviteCode || team?.invite_code || '';
  const isLocked = team?.rosterLocked || false;

  const copyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!team) return null;

  return (
    <div className="space-y-12">
      {/* Team Profile Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Team Profile</h3>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase rounded-full hover:bg-zinc-700 transition-all">
              <Edit3 className="w-3 h-3" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase rounded-full hover:bg-zinc-700">Cancel</button>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-black text-[10px] font-bold uppercase rounded-full hover:bg-yellow-400">
                <Save className="w-3 h-3" /> Save Settings
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt="Team Logo" className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-8 h-8 text-yellow-500/40" />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white uppercase tracking-widest">Team Logo</p>
            <p className="text-xs text-zinc-500 mt-1">Upload an image to represent your team.</p>
          </div>
        </div>

        <div className="space-y-4">
          <ProfileField label="Team Name" value={profileForm.name} editing={editing} onChange={(v) => setProfileForm({ ...profileForm, name: v })} />
          <ProfileField label="Division" value={profileForm.division} editing={editing} onChange={(v) => setProfileForm({ ...profileForm, division: v })} />
          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="City" value={profileForm.city} editing={editing} onChange={(v) => setProfileForm({ ...profileForm, city: v })} />
            <ProfileField label="Province/State" value={profileForm.provinceState} editing={editing} onChange={(v) => setProfileForm({ ...profileForm, provinceState: v })} />
          </div>
          <ProfileField label="Description" value={profileForm.bio} editing={editing} multiline onChange={(v) => setProfileForm({ ...profileForm, bio: v })} />

          {/* Read-only fields */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1 block">Team Tag</label>
              <p className="text-sm text-yellow-500 font-mono font-bold bg-zinc-800/30 px-4 py-3 rounded-xl">{teamTag || 'Not assigned'}</p>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1 block">Team Status</label>
              <p className={`text-sm font-bold bg-zinc-800/30 px-4 py-3 rounded-xl ${team?.status === 'APPROVED' ? 'text-green-400' : 'text-orange-400'}`}>{team?.status || 'PENDING'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Invite Code Section */}
      <section className="space-y-6 pt-6 border-t border-zinc-800">
        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Invite Code</h3>
        <p className="text-sm text-zinc-400">Share this code with players so they can send join requests to your team.</p>

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

        {isLocked && (
          <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 px-4 py-3 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">Your roster is locked. New joins are currently blocked.</p>
          </div>
        )}
      </section>

      {/* Team Managers Section */}
      <section className="space-y-6 pt-6 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Team Managers</h3>
          <span className="text-xs font-bold text-zinc-500">1 of 5 managers assigned</span>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-800 px-4 py-3 rounded-xl flex items-center justify-between">
           <div>
             <p className="text-sm font-bold text-white">Current Coach (You)</p>
             <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Head Coach</p>
           </div>
        </div>
        <p className="text-xs text-zinc-500 pt-2 italic">
          Manager features are coming soon. Managers will be able to edit player details (jersey #, bio) but cannot remove players or lock the roster.
        </p>
      </section>
    </div>
  );
}

function ProfileField({ label, value, editing, onChange, multiline }: { label: string; value: string; editing: boolean; onChange: (v: string) => void; multiline?: boolean; }) {
  return (
    <div>
      <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1 block">{label}</label>
      {editing ? (
        multiline ? (
          <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white resize-none focus:border-yellow-500/50 focus:outline-none transition-colors" />
        ) : (
          <input value={value} onChange={e => onChange(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500/50 focus:outline-none transition-colors" />
        )
      ) : (
        <p className="text-sm text-white bg-zinc-800/30 px-4 py-3 rounded-xl">{value || <span className="text-zinc-600">Not set</span>}</p>
      )}
    </div>
  );
}
