import React, { useState, useEffect } from 'react';
import { Play, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import type { TeamStandings, Player, Media } from '../types';

const TeamModal = ({ team, onClose, onPlayerClick }: { team: TeamStandings; onClose: () => void; onPlayerClick: (p: Player) => void }) => {
  const [media, setMedia] = useState<Media[]>([]);

  useEffect(() => {
    fetch(`/api/media?team_id=${team.id}`)
      .then(res => res.json())
      .then(data => setMedia(data));
  }, [team.id]);

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
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl font-black text-white border border-zinc-700 overflow-hidden">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                team.name[0]
              )}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{team.name}</h2>
              <p className="text-yellow-500 font-bold tracking-widest uppercase text-xs">{team.type} Tournament</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <Zap className="w-6 h-6 text-zinc-500 rotate-45" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-1 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Team Info</h3>
                <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800 space-y-3">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Location</p>
                    <p className="text-white font-medium">{team.city || 'N/A'}, {team.province_state || ''}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Bio</p>
                    <p className="text-zinc-400 text-xs leading-relaxed">{team.bio || 'No bio available for this team.'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Coaching Staff</h3>
                <div className="flex items-center gap-4 bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
                  <img src={team.coach_photo || `https://picsum.photos/seed/coach-${team.id}/100/100`} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="text-white font-bold">{team.coach_name || 'Head Coach'}</p>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold">Head Coach</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Team Roster</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {team.roster?.map(player => (
                  <div 
                    key={player.id} 
                    onClick={() => onPlayerClick(player)}
                    className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 hover:border-yellow-500/50 transition-all cursor-pointer group flex items-center gap-3"
                  >
                    <img 
                      src={player.photo || `https://picsum.photos/seed/${player.id}/100/100`} 
                      className="w-8 h-8 rounded-full object-cover border border-zinc-700 group-hover:border-yellow-500/50 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-white font-bold group-hover:text-yellow-400 transition-colors text-xs">{player.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">#{player.number} • {player.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">Team Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Wins', val: team.wins, color: 'text-yellow-400' },
                  { label: 'Losses', val: team.losses, color: 'text-red-400' },
                  { label: 'Points For', val: team.pf, color: 'text-white' },
                  { label: 'Diff', val: team.pd, color: 'text-yellow-500' },
                ].map(s => (
                  <div key={s.label} className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{s.label}</p>
                    <p className={cn("text-xl font-mono font-bold", s.color)}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">Team Media</h3>
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
                  <div className="col-span-3 py-8 text-center text-zinc-600 text-xs italic">No team media uploaded yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeamModal;
