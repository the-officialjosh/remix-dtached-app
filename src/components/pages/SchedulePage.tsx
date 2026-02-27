import React from 'react';
import { Calendar } from 'lucide-react';
import type { Game } from '../../types';
import FieldMap from '../game/FieldMap';
import GameRow from '../game/GameRow';
import { useLanguage } from '../../lib/LanguageContext';

interface SchedulePageProps {
  games: Game[];
  tournamentType: '7v7' | 'Flag';
}

export default function SchedulePage({ games, tournamentType }: SchedulePageProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase mb-2">{t('schedule.title')}</h2>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold uppercase tracking-widest">Saturday, Feb 21</span>
            <span className="w-1 h-1 bg-zinc-700 rounded-full" />
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Central Park Fields</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">{t('schedule.field_map')}</h3>
        <FieldMap tournamentType={tournamentType} activeField={games.find(g => g.status === 'live')?.field} />
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">{t('schedule.upcoming')}</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          {games.length > 0 ? (
            games.map((game) => (
              <GameRow key={game.id} game={game} />
            ))
          ) : (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">{t('schedule.no_games')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
