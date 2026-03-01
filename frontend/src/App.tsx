import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Player, TeamStandings, Game } from './types';
import { fetchTournamentData } from './lib/api';
import { useWebSocket } from './hooks/useWebSocket';

// --- Auth ---
import { AuthProvider, useAuth } from './lib/AuthContext';

// --- Layout ---
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import LanguagePicker from './components/layout/LanguagePicker';
import { LanguageProvider } from './lib/LanguageContext';

// --- Pages ---
import LeaderboardPage from './components/pages/LeaderboardPage';
import HomePage from './components/pages/HomePage';
import StandingsPage from './components/pages/StandingsPage';
import SchedulePage from './components/pages/SchedulePage';
import MediaPage from './components/pages/MediaPage';
import LivePage from './components/pages/LivePage';
import AdminPage from './components/pages/AdminPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import RoleSelectionPage from './components/pages/RoleSelectionPage';
import DashboardPage from './components/pages/DashboardPage';
import ProfilePage from './components/pages/ProfilePage';

// --- Feature Components ---
import TeamModal from './components/team/TeamModal';
import PlayerProfileModal from './components/player/PlayerProfileModal';
import PlayerRegistration from './components/registration/PlayerRegistration';

function AppContent() {
  const { isAuthenticated, isAdmin, isCoach, user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [adminSubTab, setAdminSubTab] = useState<'teams' | 'players' | 'stats' | 'matchups'>('teams');
  const [tournamentType, setTournamentType] = useState<'7v7' | 'Flag'>('7v7');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<TeamStandings[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamStandings | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: number; msg: string }[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [initialEventType, setInitialEventType] = useState<'camp' | 'tournament' | undefined>(undefined);

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

  // Handle email confirmation token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      fetch(`/api/auth/confirm?token=${token}`)
        .then(res => {
          if (res.ok) {
            addNotification('Email confirmed successfully!');
          } else {
            addNotification('Email confirmation failed or expired.');
          }
        })
        .catch(() => addNotification('Email confirmation failed.'));
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // After login: redirect to dashboard (or role selection if needed)
  useEffect(() => {
    if (isAuthenticated && (activeTab === 'login' || activeTab === 'signup')) {
      if (user?.needsRole) {
        setActiveTab('role-select');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [isAuthenticated, activeTab, user?.needsRole]);

  // After role selection: go to dashboard
  useEffect(() => {
    if (isAuthenticated && user && !user.needsRole && activeTab === 'role-select') {
      setActiveTab('dashboard');
    }
  }, [isAuthenticated, user, activeTab]);

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

  // Intercept: if logged in but needs role, force role selection
  const showRoleSelection = isAuthenticated && user?.needsRole;

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black">
      <LanguagePicker />
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tournamentType={tournamentType}
        setTournamentType={setTournamentType}
        isPremium={isPremium}
      />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* Force role selection if needed */}
          {showRoleSelection ? (
            <motion.div key="role-select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <RoleSelectionPage />
            </motion.div>
          ) : (
            <>
              {activeTab === 'home' && (
                <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <HomePage
                    players={players}
                    teams={teams}
                    expandedCategories={expandedCategories}
                    toggleCategory={toggleCategory}
                    onPlayerClick={setSelectedPlayer}
                    onTeamClick={setSelectedTeam}
                    onRegister={(eventType) => {
                      setInitialEventType(eventType);
                      setActiveTab('register');
                    }}
                  />
                </motion.div>
              )}

              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <DashboardPage onNavigate={(tab) => setActiveTab(tab)} />
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <ProfilePage />
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
                <motion.div key={`register-${initialEventType || 'none'}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <PlayerRegistration
                    initialEventType={initialEventType}
                    onComplete={() => {
                      setActiveTab('stats');
                      setInitialEventType(undefined);
                      loadData();
                    }}
                  />
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

              {activeTab === 'login' && (
                <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <LoginPage onSwitchToRegister={() => setActiveTab('signup')} />
                </motion.div>
              )}

              {activeTab === 'signup' && (
                <motion.div key="signup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <RegisterPage onSwitchToLogin={() => setActiveTab('login')} />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>
      <Footer />

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

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
