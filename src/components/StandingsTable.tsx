import React, { useState } from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import type { TeamStandings } from '../types';

const StandingsTable = ({ teams, title, onTeamClick }: { teams: TeamStandings[]; title: string; onTeamClick: (t: TeamStandings) => void; key?: React.Key }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof TeamStandings; direction: 'asc' | 'desc' }>({ key: 'pts', direction: 'desc' });

  const sortedTeams = [...teams].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const requestSort = (key: keyof TeamStandings) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }: { column: keyof TeamStandings }) => {
    if (sortConfig.key !== column) return <TrendingUp className="w-2 h-2 opacity-20 ml-1 inline" />;
    return sortConfig.direction === 'asc' ? <ChevronRight className="w-2 h-2 -rotate-90 ml-1 inline text-yellow-500" /> : <ChevronRight className="w-2 h-2 rotate-90 ml-1 inline text-yellow-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2">
        <div className="w-1 h-6 bg-yellow-500 rounded-full" />
        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{title} Division</h3>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-800">
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rank</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('name')}>
                  Team <SortIcon column="name" />
                </th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('gp')}>
                  GP <SortIcon column="gp" />
                </th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('wins')}>
                  W <SortIcon column="wins" />
                </th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('losses')}>
                  L <SortIcon column="losses" />
                </th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('ties')}>
                  T <SortIcon column="ties" />
                </th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('pts')}>
                  PTS <SortIcon column="pts" />
                </th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('pf')}>
                  PF <SortIcon column="pf" />
                </th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('pa')}>
                  PA <SortIcon column="pa" />
                </th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('pd')}>
                  PD <SortIcon column="pd" />
                </th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">L5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sortedTeams.map((team, idx) => (
                <tr key={team.id} className="hover:bg-zinc-800/30 transition-colors group cursor-pointer" onClick={() => onTeamClick(team)}>
                  <td className="p-4 font-mono text-zinc-500 text-sm">{idx + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-xs font-bold text-white border border-zinc-700 group-hover:border-yellow-500/50 transition-all">
                        {team.name[0]}
                      </div>
                      <span className="font-bold text-white group-hover:text-yellow-400 transition-colors">{team.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono text-sm">{team.gp}</td>
                  <td className="p-4 text-center font-mono text-sm text-yellow-400">{team.wins}</td>
                  <td className="p-4 text-center font-mono text-sm text-red-400">{team.losses}</td>
                  <td className="p-4 text-center font-mono text-sm text-zinc-400">{team.ties}</td>
                  <td className="p-4 text-center font-mono text-sm font-bold text-white">{team.pts}</td>
                  <td className="p-4 text-center font-mono text-sm">{team.pf}</td>
                  <td className="p-4 text-center font-mono text-sm">{team.pa}</td>
                  <td className="p-4 text-center font-mono text-sm font-bold text-yellow-500">{team.pd > 0 ? `+${team.pd}` : team.pd}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {team.l5.split('-').map((res, i) => (
                        <span key={i} className={cn(
                          "w-4 h-4 rounded-sm text-[8px] font-bold flex items-center justify-center",
                          res === 'W' ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"
                        )}>
                          {res}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;
