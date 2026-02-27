import React, { useState } from 'react';
import { Plus, Save, Edit2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { TeamStandings, Game } from '../../types';

const GameManagement = ({ teams, games, onUpdate }: { teams: TeamStandings[]; games: Game[]; onUpdate: () => void }) => {
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingGame)
    });
    setEditingGame(null);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white italic uppercase tracking-tighter">Matchup Management</h3>
        <button 
          onClick={() => setEditingGame({ 
            home_team_id: teams[0]?.id, 
            away_team_id: teams[1]?.id, 
            field: 'Field 1', 
            type: '7v7',
            status: 'scheduled',
            home_score: 0,
            away_score: 0,
            start_time: new Date().toISOString()
          })}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-bold rounded-full text-xs hover:bg-yellow-400 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Matchup
        </button>
      </div>

      {editingGame && (
        <form onSubmit={handleSave} className="bg-zinc-800/50 p-6 rounded-3xl border border-zinc-700 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <select 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingGame.home_team_id || ''}
              onChange={e => setEditingGame({...editingGame, home_team_id: parseInt(e.target.value)})}
            >
              <option value="">Home Team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingGame.away_team_id || ''}
              onChange={e => setEditingGame({...editingGame, away_team_id: parseInt(e.target.value)})}
            >
              <option value="">Away Team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingGame.field || ''}
              onChange={e => setEditingGame({...editingGame, field: e.target.value})}
            >
              <option value="">Select Field</option>
              <option value="Field 1">Field 1</option>
              <option value="Field 2">Field 2</option>
              <option value="Field 3">Field 3</option>
              <option value="Field 4">Field 4</option>
              <option value="Field 5">Field 5</option>
            </select>
            <select 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingGame.type || '7v7'}
              onChange={e => setEditingGame({...editingGame, type: e.target.value as any})}
            >
              <option value="7v7">7v7</option>
              <option value="Flag">Flag</option>
            </select>
            <select 
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingGame.status || 'scheduled'}
              onChange={e => setEditingGame({...editingGame, status: e.target.value as any})}
            >
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="finished">Finished</option>
            </select>
            <input 
              type="datetime-local"
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
              value={editingGame.start_time?.slice(0, 16) || ''}
              onChange={e => setEditingGame({...editingGame, start_time: e.target.value})}
            />
            <div className="flex items-center gap-2">
              <input 
                type="number"
                placeholder="Home Score" 
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
                value={editingGame.home_score ?? 0}
                onChange={e => setEditingGame({...editingGame, home_score: parseInt(e.target.value)})}
              />
              <span className="text-zinc-500">-</span>
              <input 
                type="number"
                placeholder="Away Score" 
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white"
                value={editingGame.away_score ?? 0}
                onChange={e => setEditingGame({...editingGame, away_score: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditingGame(null)} className="px-6 py-2 text-zinc-500 font-bold text-xs uppercase">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-full text-xs uppercase flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Matchup
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map(game => (
          <div key={game.id} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center group">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                  game.status === 'live' ? "bg-red-500 text-white animate-pulse" : 
                  game.status === 'finished' ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800 text-zinc-500"
                )}>
                  {game.status}
                </span>
                <span className="text-[8px] text-zinc-500 font-bold uppercase">{game.field}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs font-bold text-white">{game.home_team}</p>
                  <p className="text-lg font-mono font-black text-yellow-500">{game.home_score}</p>
                </div>
                <span className="text-zinc-700 font-black italic">VS</span>
                <div className="text-center">
                  <p className="text-xs font-bold text-white">{game.away_team}</p>
                  <p className="text-lg font-mono font-black text-yellow-500">{game.away_score}</p>
                </div>
              </div>
            </div>
            <button onClick={() => setEditingGame(game)} className="p-2 text-zinc-500 hover:text-yellow-500 transition-colors ml-4">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameManagement;
