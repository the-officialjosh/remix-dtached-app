import React from 'react';
import { Trophy, Zap, Shield, Star, Search, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { Player, TeamStandings } from '../../types';

interface HomePageProps {
  players: Player[];
  teams: TeamStandings[];
  expandedCategories: Record<string, boolean>;
  toggleCategory: (key: string) => void;
  onPlayerClick: (player: Player) => void;
  onTeamClick: (team: TeamStandings) => void;
  onRegister: (eventType?: 'camp' | 'tournament') => void;
}

export default function HomePage({
  players, teams, expandedCategories, toggleCategory, onPlayerClick, onTeamClick, onRegister
}: HomePageProps) {
  return (
    <div>
      {/* Full-Screen Hero */}
      <div className="relative mb-16" style={{ height: 'calc(100vh - 73px)', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', marginTop: '-3rem', width: '100vw' }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg.png')" }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-white">
              <span className="block text-2xl md:text-4xl font-black uppercase tracking-wider">LA FIN DE SEMAINE</span>
              <span className="block text-5xl md:text-8xl font-black uppercase tracking-tighter italic">ORIGINALE <span className="text-yellow-500">2026</span></span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <p className="text-zinc-300 text-lg md:text-xl font-medium">Camp Retour à L'Origine + Tournoi Dtached</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 border-t border-zinc-600 pt-8"
          >
            <p className="text-zinc-300 text-sm md:text-base font-bold uppercase tracking-[0.2em]">JUNE 20–21, 2026 • MONTRÉAL</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 mt-8"
          >
            <button
              onClick={onRegister}
              className="px-8 py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)]"
            >
              Register
            </button>
            <button
              className="px-8 py-4 border-2 border-yellow-500/70 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-500/10 hover:scale-105 transition-all"
            >
              View Details
            </button>
          </motion.div>
        </div>
      </div>

      <div className="space-y-16">

      {/* Events Section */}
      <div className="space-y-8">
        <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camp Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-3xl overflow-hidden aspect-[4/3] group cursor-pointer"
            onClick={() => onRegister('camp')}
          >
            <img src="/camp.png" alt="Camp Retour à l'Origine" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
            <div className="relative h-full flex flex-col justify-between p-6">
              <div>
                <span className="inline-block bg-yellow-500 text-black text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">June 20</span>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic leading-tight">Camp Retour<br />à L'Origine</h3>
                <p className="text-zinc-400 text-sm font-medium">5e Édition • Montréal</p>
                <button className="px-6 py-3 bg-yellow-500 text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-yellow-400 transition-all">
                  Register
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tournoi Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-3xl overflow-hidden aspect-[4/3] group cursor-pointer"
            onClick={() => onRegister('tournament')}
          >
            <img src="/tournoi.png" alt="Tournoi Born 2 Cheer" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
            <div className="relative h-full flex flex-col justify-between p-6">
              <div>
                <span className="inline-block bg-yellow-500 text-black text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">June 20 - 21</span>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic leading-tight">Tournoi<br />Dtached</h3>
                <p className="text-zinc-400 text-sm font-medium">Montréal</p>
                <button className="px-6 py-3 bg-yellow-500 text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-yellow-400 transition-all">
                  Register
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hero Section: Category Leaders */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Passing Yds', key: 'total_pass_yards', icon: Zap, color: 'text-blue-400' },
          { label: 'Receiving Yds', key: 'total_yards', icon: Zap, color: 'text-yellow-400' },
          { label: 'Touchdowns', key: 'total_touchdowns', icon: Trophy, color: 'text-amber-400' },
          { label: 'Receptions', key: 'total_catches', icon: Star, color: 'text-pink-400' },
          { label: 'Interceptions', key: 'total_interceptions', icon: Shield, color: 'text-purple-400' },
          { label: 'Sacks', key: 'total_sacks', icon: Zap, color: 'text-red-400' },
        ].map((cat) => {
          const leader = [...players].sort((a, b) => (b[cat.key as keyof Player] as number || 0) - (a[cat.key as keyof Player] as number || 0))[0];
          return (
            <div 
              key={cat.key}
              onClick={() => leader && onPlayerClick(leader)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <cat.icon className="w-12 h-12" />
              </div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">{cat.label}</p>
              {leader ? (
                <div className="flex items-center gap-2 relative z-10">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-800">
                    <img src={leader.photo || `https://picsum.photos/seed/${leader.id}/100/100`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white italic uppercase tracking-tighter truncate w-16">{leader.name}</p>
                    <p className={cn("text-lg font-mono font-black", cat.color)}>{leader[cat.key as keyof Player] as number || 0}</p>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-600 italic text-[8px]">No data</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Categorized Leaderboard Sections */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Stat Leaders</h2>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search athletes..." 
                className="bg-transparent border-none outline-none text-xs text-white w-32 md:w-48" 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[
            { title: 'Passing Leaders', key: 'total_pass_yards', icon: Zap, isQB: true },
            { title: 'Receiving Leaders', key: 'total_yards', icon: Zap },
            { title: 'Touchdown Leaders', key: 'total_touchdowns', icon: Trophy },
            { title: 'Reception Leaders', key: 'total_catches', icon: Star },
            { title: 'Interception Leaders', key: 'total_interceptions', icon: Shield },
            { title: 'Sacks Leaders', key: 'total_sacks', icon: Zap },
          ].map((category) => {
            const isExpanded = expandedCategories[category.key];
            const displayedPlayers = [...players]
              .sort((a, b) => (b[category.key as keyof Player] as number || 0) - (a[category.key as keyof Player] as number || 0))
              .slice(0, isExpanded ? 20 : 3);

            return (
              <div key={category.key} className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/20">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tighter italic">
                    <category.icon className="w-5 h-5 text-yellow-500" />
                    {category.title}
                  </h3>
                  <button 
                    onClick={() => toggleCategory(category.key)}
                    className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] hover:text-yellow-400 transition-colors"
                  >
                    {isExpanded ? 'Show Less' : 'View All'}
                  </button>
                </div>
                <div className="divide-y divide-zinc-800">
                  {displayedPlayers.map((player, idx) => {
                    const cmpPct = player.total_pass_attempts ? Math.round((player.total_pass_completions || 0) / player.total_pass_attempts * 100) : 0;
                    return (
                      <div 
                        key={player.id} 
                        className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group cursor-pointer" 
                        onClick={() => onPlayerClick(player)}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-black text-zinc-800 italic w-6">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800 group-hover:border-yellow-500/50 transition-all">
                            <img 
                              src={player.photo || `https://picsum.photos/seed/${player.id}/100/100`} 
                              alt={player.name}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">{player.name}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{player.team_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-lg font-black text-yellow-400">
                            {player[category.key as keyof Player] as number || 0}
                          </div>
                          {category.isQB && (
                            <p className="text-[9px] text-zinc-500 font-bold uppercase">
                              {player.total_pass_completions}/{player.total_pass_attempts} • {cmpPct}%
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Rankings / Seeds */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Team Rankings & Seeds</h3>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sorted by Points & Differential</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...teams]
            .sort((a, b) => b.pts - a.pts || b.pd - a.pd)
            .map((team, idx) => (
              <motion.div 
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onTeamClick(team)}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Trophy className="w-24 h-24" />
                </div>
                
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-xl font-black text-white border border-zinc-700 group-hover:border-yellow-500/50 transition-all">
                      {team.name[0]}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">{team.name}</h4>
                      <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">{team.division} Division</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-zinc-800 italic group-hover:text-yellow-500/20 transition-colors">
                      {idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Record</p>
                    <p className="text-sm font-mono text-white font-bold">{team.wins}-{team.losses}</p>
                  </div>
                  <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">PTS</p>
                    <p className="text-sm font-mono text-yellow-400 font-bold">{team.pf}</p>
                  </div>
                  <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Allowed</p>
                    <p className="text-sm font-mono text-red-400 font-bold">{team.pa}</p>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
      </div>
    </div>
  );
}
