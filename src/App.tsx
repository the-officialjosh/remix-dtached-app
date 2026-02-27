import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Player, TeamStandings, Game } from './types';
import { fetchTournamentData } from './lib/api';
import { useWebSocket } from './hooks/useWebSocket';

// --- Layout ---
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';

// --- Pages ---
import LeaderboardPage from './components/pages/LeaderboardPage';
import HomePage from './components/pages/HomePage';
import StandingsPage from './components/pages/StandingsPage';
import SchedulePage from './components/pages/SchedulePage';
import MediaPage from './components/pages/MediaPage';
import LivePage from './components/pages/LivePage';
import AdminPage from './components/pages/AdminPage';

// --- Feature Components ---
import TeamModal from './components/team/TeamModal';
import PlayerProfileModal from './components/player/PlayerProfileModal';
import PlayerRegistration from './components/registration/PlayerRegistration';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'standings' | 'schedule' | 'media' | 'live' | 'admin' | 'register'>('home');
  const [adminSubTab, setAdminSubTab] = useState<'teams' | 'players' | 'stats' | 'matchups'>('teams');
  const [tournamentType, setTournamentType] = useState<'7v7' | 'Flag'>('7v7');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<TeamStandings[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamStandings | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: number; msg: string }[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const loadData = useCallback(async () => {
    const data = await fetchTournamentData(tournamentType);
    setPlayers(data.players);
    setGames(data.games);
    setTeams(data.teams);
    setLoading(false);
  }, [tournamentType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addNotification = (msg: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'STATS_UPDATED') {
      loadData();
      addNotification(`Stats updated for ${message.data.name}!`);
    }
  }, [loadData]);

  useWebSocket(handleWebSocketMessage);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tournamentType={tournamentType}
        setTournamentType={setTournamentType}
        isPremium={isPremium}
      />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <HomePage
                players={players}
                teams={teams}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
                onPlayerClick={setSelectedPlayer}
                onTeamClick={setSelectedTeam}
                onRegister={() => setActiveTab('register')}
              />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <LeaderboardPage
                players={players}
                teams={teams}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
                onPlayerClick={setSelectedPlayer}
                onTeamClick={setSelectedTeam}
              />
            </motion.div>
          )}

          {activeTab === 'standings' && (
            <motion.div key="standings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <StandingsPage teams={teams} onTeamClick={setSelectedTeam} />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <AdminPage
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
                adminSubTab={adminSubTab}
                setAdminSubTab={setAdminSubTab}
                players={players}
                teams={teams}
                games={games}
                onUpdate={loadData}
              />
            </motion.div>
          )}

          {activeTab === 'register' && (
            <motion.div key="register" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <PlayerRegistration onComplete={() => {
                setActiveTab('stats');
                loadData();
              }} />
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <SchedulePage games={games} tournamentType={tournamentType} />
            </motion.div>
          )}

          {activeTab === 'media' && (
            <motion.div key="media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MediaPage isPremium={isPremium} onUnlock={() => setIsPremium(true)} />
            </motion.div>
          )}

          {activeTab === 'live' && (
            <motion.div key="live" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
              <LivePage games={games} tournamentType={tournamentType} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Team Modal */}
      <AnimatePresence>
        {selectedTeam && (
          <TeamModal 
            team={selectedTeam} 
            onClose={() => setSelectedTeam(null)} 
            onPlayerClick={(p) => {
              setSelectedTeam(null);
              setSelectedPlayer(p);
            }}
          />
        )}
      </AnimatePresence>

      {/* Player Profile Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <PlayerProfileModal 
            player={selectedPlayer} 
            onClose={() => setSelectedPlayer(null)} 
            isPremium={isPremium}
            onUnlock={() => {
              setIsPremium(true);
              addNotification("Premium Unlocked! Enjoy full media access.");
            }}
          />
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="fixed top-24 right-6 z-[200] space-y-2">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="bg-zinc-900 border border-yellow-500/50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <p className="text-sm font-bold text-white">{n.msg}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
