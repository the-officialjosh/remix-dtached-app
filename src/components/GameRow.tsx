import React from 'react';
import { cn } from '../lib/utils';
import type { Game } from '../types';

const GameRow = ({ game }: { game: Game; key?: React.Key }) => (
  <div className="p-6 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex-1 text-right">
        <p className="text-sm font-bold text-white">{game.home_team}</p>
      </div>
      <div className="px-8 flex flex-col items-center gap-2">
        {game.status === 'live' ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono font-black text-yellow-400">{game.home_score}</span>
              <span className="text-zinc-700">-</span>
              <span className="text-xl font-mono font-black text-yellow-400">{game.away_score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Live</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {new Date(game.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-widest",
              game.status === 'finished' ? "text-zinc-600" : "text-yellow-500"
            )}>
              {game.status === 'finished' ? 'Final' : game.field}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold text-white">{game.away_team}</p>
      </div>
    </div>
  </div>
);

export default GameRow;
