import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import type { Player } from '../types';

const PlayerCard = ({ player, onClick }: { player: Player; onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="group cursor-pointer"
    onClick={onClick}
  >
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-yellow-500/50 transition-all shadow-lg hover:shadow-2xl hover:shadow-yellow-500/5">
      <div className="relative aspect-[3/4]">
        <img 
          src={player.photo || `https://picsum.photos/seed/${player.id}/400/600`} 
          alt={player.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full uppercase tracking-[0.15em]">
              #{player.number}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {player.position}
            </span>
          </div>
          <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-0.5 group-hover:text-yellow-400 transition-colors">
            {player.name}
          </h3>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{player.team_name}</p>
        </div>
      </div>
      <div className="p-4 grid grid-cols-4 gap-2 bg-zinc-800/20 border-t border-zinc-800">
        {[
          { label: 'TDs', val: player.total_touchdowns },
          { label: 'Yds', val: player.total_yards },
          { label: 'Rec', val: player.total_catches },
          { label: 'INT', val: player.total_interceptions },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{s.label}</p>
            <p className="text-sm font-mono text-yellow-400 font-bold">{s.val || 0}</p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

export default PlayerCard;
