import React from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { User, Shield, Bell } from 'lucide-react';

export default function SettingsTab({ team }: { team: any }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-12">
      {/* Account Settings */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
           <User className="w-6 h-6 text-zinc-500" />
           <div>
             <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Coach Account</h3>
             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Global settings for your identity</p>
           </div>
        </div>
        
        <div className="space-y-4">
           <div>
             <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1 block">Full Name</label>
             <input type="text" disabled value={`${user.firstName} ${user.lastName}`} className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-zinc-400 cursor-not-allowed" />
             <p className="text-[10px] text-zinc-600 mt-1 italic">Contact admin to change legal name.</p>
           </div>
           <div>
             <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1 block">Email Address</label>
             <input type="email" disabled value={user.email} className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-zinc-400 cursor-not-allowed" />
           </div>
           
           <div className="pt-4 border-t border-zinc-800">
             <button className="flex items-center justify-between w-full p-4 bg-zinc-800/30 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-colors">
               <div className="text-left">
                  <span className="block text-sm font-bold text-white uppercase tracking-widest">Change Password</span>
                  <span className="block text-[10px] text-zinc-500 mt-0.5">Update your security credentials</span>
               </div>
               <Shield className="w-4 h-4 text-zinc-500" />
             </button>
           </div>
           <div>
             <button className="flex items-center justify-between w-full p-4 bg-zinc-800/30 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-colors">
               <div className="text-left">
                  <span className="block text-sm font-bold text-white uppercase tracking-widest">Notification Preferences</span>
                  <span className="block text-[10px] text-zinc-500 mt-0.5">Email alerts for requests and matches</span>
               </div>
               <Bell className="w-4 h-4 text-zinc-500" />
             </button>
           </div>
        </div>
      </section>

      {/* Team Settings Link */}
      {team && (
        <section className="space-y-6 pt-6 border-t border-zinc-800/50">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
             <Shield className="w-6 h-6 text-zinc-500" />
             <div>
               <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">{team.name} Settings</h3>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Team-scoped configurations</p>
             </div>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 px-4 py-3 rounded-xl">
             <p className="text-sm text-blue-400">Team settings like the team name, logo, division, invite code, and managers are now located in the <span className="font-bold">Team Profile</span> tab.</p>
          </div>
        </section>
      )}
    </div>
  );
}
