import React, { useState, useEffect } from 'react';
import { Play, Image as ImageIcon, Lock, Zap, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { Player, Media } from '../../types';

const PlayerProfileModal = ({ player, onClose, isPremium, onUnlock }: { player: Player; onClose: () => void; isPremium: boolean; onUnlock: () => void }) => {
  const [media, setMedia] = useState<Media[]>([]);
  const currentUserId = "user_123"; // Simulated current user ID
  const isLinked = player.linked_user_id === currentUserId;

  useEffect(() => {
    fetch(`/api/media?player_id=${player.id}`)
      .then(res => res.json())
      .then(data => setMedia(data));
  }, [player.id]);

  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(player.dob);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Left: Media/Photo */}
        <div className="w-full md:w-2/5 relative aspect-[3/4] md:aspect-auto">
          <img 
            src={player.photo || `https://picsum.photos/seed/${player.id}/800/1200`} 
            alt={player.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6">
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{player.name}</h2>
                {isLinked && (
                  <div className="flex items-center gap-1 bg-yellow-500 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" title="Owner Access">
                    <Shield className="w-3 h-3 text-black" />
                    <span className="text-[8px] font-black text-black uppercase tracking-tighter">Owner</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {player.is_verified === 1 && (
                  <div className="flex items-center gap-1 bg-blue-500 px-3 py-1 rounded-full w-fit">
                    <Shield className="w-3 h-3 text-white" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Dtached Verified</span>
                  </div>
                )}
                {player.jersey_confirmed === 1 && (
                  <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full w-fit">
                    <Shield className="w-3 h-3 text-yellow-500" />
                    <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Jersey Confirmed</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-yellow-500 font-bold tracking-widest uppercase text-sm">#{player.number} {player.position}</p>
          </div>
        </div>

        {/* Right: Info & Stats */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-1">Team</p>
              <p className="text-xl font-bold text-white">{player.team_name || 'Unassigned'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <Zap className="w-6 h-6 text-zinc-500 rotate-45" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Age / DOB</p>
              <p className="text-white font-medium">{age ? `${age} yrs` : 'N/A'} <span className="text-xs text-zinc-500 ml-1">({player.dob || 'N/A'})</span></p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Physical</p>
              <p className="text-white font-medium">{player.height || 'N/A'} • {player.weight || 'N/A'}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Hometown</p>
              <p className="text-white font-medium">{player.city || 'N/A'}, {player.province_state || ''}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Social</p>
              <a href={`https://instagram.com/${player.instagram?.replace('@', '')}`} target="_blank" className="text-yellow-400 font-medium hover:underline flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {player.instagram || 'N/A'}
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">Season Stats</h3>
            
            {player.position === 'QB' && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Pass Yds', val: player.total_pass_yards },
                  { label: 'Att', val: player.total_pass_attempts },
                  { label: 'Cmp', val: player.total_pass_completions },
                  { label: 'Cmp %', val: player.total_pass_attempts ? Math.round((player.total_pass_completions || 0) / player.total_pass_attempts * 100) : 0 },
                ].map(s => (
                  <div key={s.label} className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{s.label}</p>
                    <p className="text-lg font-mono text-blue-400 font-bold">{s.val || 0}{s.label === 'Cmp %' ? '%' : ''}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'TDs', val: player.total_touchdowns },
                { label: 'Rec Yds', val: player.total_yards },
                { label: 'Catches', val: player.total_catches },
                { label: 'INTs', val: player.total_interceptions },
              ].map(s => (
                <div key={s.label} className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{s.label}</p>
                  <p className="text-lg font-mono text-yellow-400 font-bold">{s.val || 0}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Individual Media</h3>
              {isLinked && <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full font-bold uppercase">Owner Access</span>}
            </div>
            
            {(!isPremium && !isLinked) ? (
              <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-800 border-dashed text-center">
                <Lock className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400 mb-4">Only the player or premium users can access individual media archives.</p>
                <button 
                  onClick={onUnlock}
                  className="px-6 py-2 bg-yellow-500 text-black text-xs font-bold rounded-full hover:bg-yellow-400 transition-colors"
                >
                  Unlock Premium
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {media.length > 0 ? media.map((m) => (
                  <div key={m.id} className="aspect-square rounded-lg overflow-hidden bg-zinc-800 relative group cursor-pointer">
                    <img src={m.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                    {m.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-current drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="col-span-3 py-8 text-center text-zinc-600 text-xs italic">No media uploaded for this player yet.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlayerProfileModal;
