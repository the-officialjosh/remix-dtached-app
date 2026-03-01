import React from 'react';
import { Play } from 'lucide-react';
import type { Game } from '../../types';
import FieldMap from '../game/FieldMap';

interface LivePageProps {
  games: Game[];
  tournamentType: '7v7' | 'Flag';
}

export default function LivePage({ games, tournamentType }: LivePageProps) {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {games.filter(g => g.status === 'live').map((game) => (
          <div key={game.id} className="space-y-4">
            <div className="aspect-video w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse" />
                    <button className="relative w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform group">
                      <Play className="w-8 h-8 text-black fill-current ml-1" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{game.field} Livestream</h3>
                    <p className="text-zinc-500 text-sm">{game.home_team} vs {game.away_team}</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Live
                </div>
                <div className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded border border-white/10">
                  {Math.floor(Math.random() * 500) + 500} Watching
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-xs font-bold text-zinc-500 uppercase mb-1">{game.home_team}</p>
                <p className="text-3xl font-mono font-black text-white">{game.home_score}</p>
              </div>
              <div className="px-6 border-x border-zinc-800 text-center">
                <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                  {game.current_down}st & {game.distance}
                </div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase">{game.yard_line}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs font-bold text-zinc-500 uppercase mb-1">{game.away_team}</p>
                <p className="text-3xl font-mono font-black text-white">{game.away_score}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-zinc-900/50 rounded-3xl border border-zinc-800 p-8">
          <h3 className="text-xl font-bold text-white mb-6 italic uppercase tracking-tight">Live Game Feed</h3>
          <div className="space-y-6">
            {games.filter(g => g.status === 'live').map(game => (
              <div key={game.id} className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-500">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  {game.field} Update
                </div>
                <div className="flex gap-4">
                  <span className="text-xs font-mono text-zinc-500 mt-1">14:22</span>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    <span className="font-bold text-white">{game.possession_team_id === game.home_team_id ? game.home_team : game.away_team}</span> has the ball at the {game.yard_line}. 
                    It's {game.current_down}st down and {game.distance} to go.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 p-8">
          <h3 className="text-xl font-bold text-white mb-6 italic uppercase tracking-tight">Field Map</h3>
          <div className="space-y-6">
            <FieldMap tournamentType={tournamentType} activeField={games.find(g => g.status === 'live')?.field} />
            <div className="p-4 bg-zinc-800 rounded-2xl border border-zinc-700">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Active Possession</p>
              {games.filter(g => g.status === 'live').map(g => (
                <div key={g.id} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{g.field}</span>
                  <span className="font-bold text-yellow-400">{g.possession_team_id === g.home_team_id ? g.home_team : g.away_team}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
