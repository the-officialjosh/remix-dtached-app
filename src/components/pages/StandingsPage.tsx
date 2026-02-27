import React from 'react';
import type { TeamStandings } from '../../types';
import StandingsTable from '../team/StandingsTable';
import { useLanguage } from '../../lib/LanguageContext';

interface StandingsPageProps {
  teams: TeamStandings[];
  onTeamClick: (team: TeamStandings) => void;
}

export default function StandingsPage({ teams, onTeamClick }: StandingsPageProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase mb-2">{t('standings.title')}</h2>
        <p className="text-zinc-500 font-medium">{t('standings.subtitle')}</p>
      </div>

      <div className="space-y-16">
        {['Elite', '16U', '14U'].map((div) => {
          const divTeams = teams.filter(t => t.division === div);
          if (divTeams.length === 0) return null;
          return (
            <StandingsTable 
              key={div} 
              teams={divTeams} 
              title={div} 
              onTeamClick={onTeamClick} 
            />
          );
        })}
      </div>
    </div>
  );
}
